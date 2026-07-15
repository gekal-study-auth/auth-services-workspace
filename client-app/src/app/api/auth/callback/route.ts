import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { secureCookie } from "../../../../lib/cookie-options";
import { oauthConfig } from "../../../../lib/config";
import { type LoginTransaction, type TokenSession } from "../../../../lib/oauth";
import { createTokenRequest, isValidTransaction } from "../../../../lib/oauth-flow";
import { seal, unseal } from "../../../../lib/sealed-cookie";
import { recordAuthEventSafely } from "../../../../lib/auth-audit";
import { verifyIdToken } from "../../../../lib/id-token";
import { authInfo, authWarn } from "../../../../lib/auth-log";

export const runtime = "nodejs";

type TokenResponse = { access_token?: string; id_token?: string; expires_in?: number };

function redirectWithAuthError(errorCode: string) {
  const response = NextResponse.redirect(
    new URL(`/?auth_error=${encodeURIComponent(errorCode)}`, oauthConfig.appBaseUrl),
  );
  response.cookies.set("oauth_transaction", "", secureCookie(0));
  return response;
}

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");
  const state = request.nextUrl.searchParams.get("state");
  const transaction = unseal<LoginTransaction>(request.cookies.get("oauth_transaction")?.value);
  if (error) {
    const validState = isValidTransaction(transaction, state);
    const errorCode = validState && error === "access_denied" ? "access_denied" : "oauth_error";
    await recordAuthEventSafely(
      errorCode === "access_denied" ? "LOGIN_DENIED" : "LOGIN_FAILED",
      null,
      { reason: errorCode },
    );
    return redirectWithAuthError(errorCode);
  }

  const code = request.nextUrl.searchParams.get("code");
  if (
    !code ||
    !state ||
    !transaction ||
    state !== transaction.state ||
    !isValidTransaction(transaction, state)
  ) {
    await recordAuthEventSafely("LOGIN_FAILED", null, { reason: "invalid_transaction" });
    return redirectWithAuthError("invalid_transaction");
  }

  const tokenResponse = await fetch(`${oauthConfig.authorizationServerInternalUrl}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: createTokenRequest(code, transaction, oauthConfig.clientId, oauthConfig.redirectUri),
    cache: "no-store",
  });
  if (!tokenResponse.ok) {
    await recordAuthEventSafely("LOGIN_FAILED", null, { reason: "token_exchange_failed" });
    return NextResponse.json(
      { error: "Token exchange failed", detail: await tokenResponse.text() },
      { status: 502 },
    );
  }

  const tokens = (await tokenResponse.json()) as TokenResponse;
  if (!tokens.access_token || !tokens.id_token || typeof tokens.expires_in !== "number") {
    authWarn("oidc_token_response_invalid", {
      hasAccessToken: Boolean(tokens.access_token),
      hasIdToken: Boolean(tokens.id_token),
      hasExpiresIn: typeof tokens.expires_in === "number",
    });
    await recordAuthEventSafely("LOGIN_FAILED", null, { reason: "invalid_token_response" });
    return redirectWithAuthError("invalid_id_token");
  }

  let idClaims: Awaited<ReturnType<typeof verifyIdToken>>;
  try {
    idClaims = await verifyIdToken(tokens.id_token, transaction.nonce);
  } catch (error) {
    authWarn("oidc_id_token_validation_failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : "Unknown validation error",
    });
    await recordAuthEventSafely("LOGIN_FAILED", null, { reason: "invalid_id_token" });
    return redirectWithAuthError("invalid_id_token");
  }
  authInfo("oidc_id_token_validated", {
    subject: idClaims.sub,
    issuer: idClaims.iss,
    audience: idClaims.aud,
  });

  const session: TokenSession = {
    accessToken: tokens.access_token,
    idToken: tokens.id_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };
  const subject = typeof idClaims.sub === "string" ? idClaims.sub : null;
  await recordAuthEventSafely("LOGIN_SUCCEEDED", subject, { clientId: oauthConfig.clientId });
  const response = NextResponse.redirect(new URL("/dashboard", oauthConfig.appBaseUrl));
  response.cookies.set("auth_session", seal(session), secureCookie(tokens.expires_in));
  response.cookies.set("oauth_transaction", "", secureCookie(0));
  return response;
}

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { secureCookie } from "../../../../lib/cookie-options";
import { oauthConfig } from "../../../../lib/config";
import { decodeJwtPayload, type LoginTransaction, type TokenSession } from "../../../../lib/oauth";
import {
  createTokenRequest,
  hasExpectedNonce,
  isValidTransaction,
} from "../../../../lib/oauth-flow";
import { seal, unseal } from "../../../../lib/sealed-cookie";
import { recordAuthEventSafely } from "../../../../lib/auth-audit";

export const runtime = "nodejs";

type TokenResponse = { access_token: string; id_token: string; expires_in: number };

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
  const idClaims = decodeJwtPayload(tokens.id_token);
  if (!hasExpectedNonce(idClaims, transaction)) {
    await recordAuthEventSafely("LOGIN_FAILED", null, { reason: "invalid_nonce" });
    return NextResponse.json({ error: "Invalid ID token nonce" }, { status: 400 });
  }

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

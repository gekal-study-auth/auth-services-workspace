import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { secureCookie } from "../../../../lib/cookie-options";
import { oauthConfig } from "../../../../lib/config";
import { decodeJwtPayload, type LoginTransaction, type TokenSession } from "../../../../lib/oauth";
import { seal, unseal } from "../../../../lib/sealed-cookie";

export const runtime = "nodejs";

type TokenResponse = { access_token: string; id_token: string; expires_in: number };

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");
  const state = request.nextUrl.searchParams.get("state");
  const transaction = unseal<LoginTransaction>(request.cookies.get("oauth_transaction")?.value);
  if (error) {
    const validState = Boolean(state && transaction && state === transaction.state);
    const errorCode = validState && error === "access_denied" ? "access_denied" : "oauth_error";
    const response = NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(errorCode)}`, oauthConfig.appBaseUrl),
    );
    response.cookies.set("oauth_transaction", "", secureCookie(0));
    return response;
  }

  const code = request.nextUrl.searchParams.get("code");
  if (
    !code ||
    !state ||
    !transaction ||
    state !== transaction.state ||
    Date.now() - transaction.createdAt > 600_000
  ) {
    return NextResponse.json({ error: "Invalid or expired OAuth transaction" }, { status: 400 });
  }

  const tokenResponse = await fetch(`${oauthConfig.authorizationServerInternalUrl}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: oauthConfig.clientId,
      redirect_uri: oauthConfig.redirectUri,
      code,
      code_verifier: transaction.codeVerifier,
    }),
    cache: "no-store",
  });
  if (!tokenResponse.ok) {
    return NextResponse.json(
      { error: "Token exchange failed", detail: await tokenResponse.text() },
      { status: 502 },
    );
  }

  const tokens = (await tokenResponse.json()) as TokenResponse;
  const idClaims = decodeJwtPayload(tokens.id_token);
  if (idClaims.nonce !== transaction.nonce) {
    return NextResponse.json({ error: "Invalid ID token nonce" }, { status: 400 });
  }

  const session: TokenSession = {
    accessToken: tokens.access_token,
    idToken: tokens.id_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };
  const response = NextResponse.redirect(new URL("/dashboard", oauthConfig.appBaseUrl));
  response.cookies.set("auth_session", seal(session), secureCookie(tokens.expires_in));
  response.cookies.set("oauth_transaction", "", secureCookie(0));
  return response;
}

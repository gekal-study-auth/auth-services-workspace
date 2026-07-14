import { NextResponse } from "next/server";
import { secureCookie } from "../../../../lib/cookie-options";
import { oauthConfig } from "../../../../lib/config";
import { codeChallenge, randomUrlSafe, type LoginTransaction } from "../../../../lib/oauth";
import { seal } from "../../../../lib/sealed-cookie";

export const runtime = "nodejs";

export function GET() {
  const transaction: LoginTransaction = {
    state: randomUrlSafe(),
    nonce: randomUrlSafe(),
    codeVerifier: randomUrlSafe(64),
    createdAt: Date.now(),
  };
  const params = new URLSearchParams({
    response_type: "code",
    client_id: oauthConfig.clientId,
    redirect_uri: oauthConfig.redirectUri,
    scope: "openid profile",
    state: transaction.state,
    nonce: transaction.nonce,
    code_challenge: codeChallenge(transaction.codeVerifier),
    code_challenge_method: "S256",
  });

  const response = NextResponse.redirect(
    `${oauthConfig.authorizationServerUrl}/oauth2/authorize?${params}`,
  );
  response.cookies.set("oauth_transaction", seal(transaction), secureCookie(600));
  return response;
}

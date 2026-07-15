import { NextResponse } from "next/server";
import { secureCookie } from "../../../../lib/cookie-options";
import { oauthConfig } from "../../../../lib/config";
import { createAuthorizationParams, createLoginTransaction } from "../../../../lib/oauth-flow";
import { seal } from "../../../../lib/sealed-cookie";
import { recordAuthEventSafely } from "../../../../lib/auth-audit";

export const runtime = "nodejs";

export async function GET() {
  const transaction = createLoginTransaction();
  const params = createAuthorizationParams(
    transaction,
    oauthConfig.clientId,
    oauthConfig.redirectUri,
  );

  const response = NextResponse.redirect(
    `${oauthConfig.authorizationServerUrl}/oauth2/authorize?${params}`,
  );
  await recordAuthEventSafely("LOGIN_STARTED", null, {
    clientId: oauthConfig.clientId,
    redirectUri: oauthConfig.redirectUri,
  });
  response.cookies.set("oauth_transaction", seal(transaction), secureCookie(600));
  return response;
}

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { secureCookie } from "../../../../lib/cookie-options";
import { oauthConfig } from "../../../../lib/config";
import { createAuthorizationParams, createLoginTransaction } from "../../../../lib/oauth-flow";
import { seal } from "../../../../lib/sealed-cookie";
import { recordAuthEventSafely } from "../../../../lib/auth-audit";

export const runtime = "nodejs";

const incrementalScopes = new Set(["email", "address", "phone"]);

export async function GET(request: NextRequest) {
  const transaction = createLoginTransaction();
  const optionalScope = request.nextUrl.searchParams.get("scope");
  const scopes = ["openid", "profile"];
  if (optionalScope && incrementalScopes.has(optionalScope)) scopes.push(optionalScope);
  const params = createAuthorizationParams(
    transaction,
    oauthConfig.clientId,
    oauthConfig.redirectUri,
    scopes,
  );

  const response = NextResponse.redirect(
    `${oauthConfig.authorizationServerUrl}/oauth2/authorize?${params}`,
  );
  await recordAuthEventSafely("LOGIN_STARTED", null, {
    clientId: oauthConfig.clientId,
    redirectUri: oauthConfig.redirectUri,
    scopes,
  });
  response.cookies.set("oauth_transaction", seal(transaction), secureCookie(600));
  return response;
}

import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { oauthConfig } from "./config";
import { secureCookie } from "./cookie-options";
import { recordAuthEventSafely } from "./auth-audit";
import { decodeJwtPayload, type TokenSession } from "./oauth";
import { createEndSessionUrl } from "./oauth-flow";
import { unseal } from "./sealed-cookie";

export async function performLogout(request: NextRequest, revokeTokens: boolean) {
  const session = unseal<TokenSession>(request.cookies.get("auth_session")?.value);
  let redirectUrl = new URL("/", oauthConfig.appBaseUrl);
  if (session) {
    let subject: string | null = null;
    try {
      const claims = decodeJwtPayload(session.idToken);
      subject = typeof claims.sub === "string" ? claims.sub : null;
    } catch {
      // A malformed local session must not prevent cookie deletion or provider logout.
    }
    await recordAuthEventSafely(revokeTokens ? "LOGOUT_WITH_TOKEN_REVOCATION" : "LOGOUT", subject);
    redirectUrl = createEndSessionUrl(
      oauthConfig.authorizationServerUrl,
      session.idToken,
      oauthConfig.postLogoutRedirectUri,
      revokeTokens,
    );
  }
  const response = NextResponse.redirect(redirectUrl, 303);
  response.cookies.set("auth_session", "", secureCookie(0));
  return response;
}

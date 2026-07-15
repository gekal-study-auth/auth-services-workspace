import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { oauthConfig } from "../../../../lib/config";
import { secureCookie } from "../../../../lib/cookie-options";
import { recordAuthEventSafely } from "../../../../lib/auth-audit";
import { decodeJwtPayload, type TokenSession } from "../../../../lib/oauth";
import { createEndSessionUrl } from "../../../../lib/oauth-flow";
import { unseal } from "../../../../lib/sealed-cookie";

async function logout(request: NextRequest) {
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
    await recordAuthEventSafely("LOGOUT", subject);
    redirectUrl = createEndSessionUrl(
      oauthConfig.authorizationServerUrl,
      session.idToken,
      oauthConfig.postLogoutRedirectUri,
    );
  }
  const response = NextResponse.redirect(redirectUrl, 303);
  response.cookies.set("auth_session", "", secureCookie(0));
  return response;
}

export const GET = logout;
export const POST = logout;

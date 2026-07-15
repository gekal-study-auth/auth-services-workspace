import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { oauthConfig } from "../../../../lib/config";
import { secureCookie } from "../../../../lib/cookie-options";
import { recordAuthEventSafely } from "../../../../lib/auth-audit";
import { decodeJwtPayload, type TokenSession } from "../../../../lib/oauth";
import { unseal } from "../../../../lib/sealed-cookie";

async function logout(request: NextRequest) {
  const session = unseal<TokenSession>(request.cookies.get("auth_session")?.value);
  if (session) {
    const claims = decodeJwtPayload(session.idToken);
    const subject = typeof claims.sub === "string" ? claims.sub : null;
    await recordAuthEventSafely("LOGOUT", subject);
  }
  const response = NextResponse.redirect(new URL("/", oauthConfig.appBaseUrl), 303);
  response.cookies.set("auth_session", "", secureCookie(0));
  return response;
}

export const GET = logout;
export const POST = logout;

import { NextResponse } from "next/server";
import { oauthConfig } from "../../../../lib/config";
import { secureCookie } from "../../../../lib/cookie-options";

function logout() {
  const response = NextResponse.redirect(new URL("/", oauthConfig.appBaseUrl), 303);
  response.cookies.set("auth_session", "", secureCookie(0));
  return response;
}

export const GET = logout;
export const POST = logout;

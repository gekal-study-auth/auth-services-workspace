import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { secureCookie } from "../../../../lib/cookie-options";

function logout(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set("auth_session", "", secureCookie(0));
  return response;
}

export const GET = logout;
export const POST = logout;

import type { NextRequest } from "next/server";
import { performLogout } from "../../../../lib/logout";

async function logout(request: NextRequest) {
  return performLogout(request, false);
}

export const GET = logout;
export const POST = logout;

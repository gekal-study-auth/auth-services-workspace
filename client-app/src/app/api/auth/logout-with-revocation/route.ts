import type { NextRequest } from "next/server";
import { performLogout } from "../../../../lib/logout";

async function logoutWithRevocation(request: NextRequest) {
  return performLogout(request, true);
}

export const GET = logoutWithRevocation;
export const POST = logoutWithRevocation;

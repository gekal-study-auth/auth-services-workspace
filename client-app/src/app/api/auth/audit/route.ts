import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { listAuthEventsPage } from "../../../../lib/auth-audit";
import { decodeJwtPayload, type TokenSession } from "../../../../lib/oauth";
import { unseal } from "../../../../lib/sealed-cookie";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const session = unseal<TokenSession>(cookieStore.get("auth_session")?.value);
  if (!session || session.expiresAt <= Date.now()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const claims = decodeJwtPayload(session.idToken);
  const subject = typeof claims.sub === "string" ? claims.sub : "";
  if (!subject) return NextResponse.json({ error: "invalid_session" }, { status: 401 });

  const page = Number.parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10);
  const pageSize = Number.parseInt(request.nextUrl.searchParams.get("pageSize") ?? "10", 10);
  const result = await listAuthEventsPage(subject, page, pageSize);

  return NextResponse.json({
    ...result,
    events: result.events.map((event) => ({
      ...event,
      occurredAt: event.occurredAt.toISOString(),
    })),
  });
}

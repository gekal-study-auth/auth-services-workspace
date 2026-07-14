import type { IncomingMessage, ServerResponse } from "http";

export function readCookie(req: IncomingMessage, name: string): string | undefined {
  const item = req.headers.cookie?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : undefined;
}

export function cookie(name: string, value: string, maxAge: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearCookie(res: ServerResponse, name: string): void {
  res.setHeader("Set-Cookie", cookie(name, "", 0));
}


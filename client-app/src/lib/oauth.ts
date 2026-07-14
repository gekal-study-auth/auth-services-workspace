import { createHash, randomBytes } from "crypto";

export type LoginTransaction = {
  state: string;
  nonce: string;
  codeVerifier: string;
  createdAt: number;
};

export type TokenSession = {
  accessToken: string;
  idToken: string;
  expiresAt: number;
};

export function randomUrlSafe(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function codeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("Invalid JWT");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
}


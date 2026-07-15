import "server-only";

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { oauthConfig } from "./config";

const jwks = createRemoteJWKSet(
  new URL("/oauth2/jwks", oauthConfig.authorizationServerInternalUrl),
);

export async function verifyIdToken(idToken: string, expectedNonce: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(idToken, jwks, {
    algorithms: ["RS256"],
    issuer: oauthConfig.authorizationServerUrl,
    audience: oauthConfig.clientId,
  });

  if (typeof payload.sub !== "string" || payload.sub.length === 0) {
    throw new Error("ID token subject is missing");
  }
  if (payload.nonce !== expectedNonce) {
    throw new Error("ID token nonce does not match the login transaction");
  }

  return payload;
}

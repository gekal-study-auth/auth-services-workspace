import { codeChallenge, randomUrlSafe, type LoginTransaction } from "./oauth.ts";

export const TRANSACTION_MAX_AGE_MS = 10 * 60 * 1000;

export function createLoginTransaction(now = Date.now()): LoginTransaction {
  return {
    state: randomUrlSafe(),
    nonce: randomUrlSafe(),
    codeVerifier: randomUrlSafe(64),
    createdAt: now,
  };
}

export function createAuthorizationParams(
  transaction: LoginTransaction,
  clientId: string,
  redirectUri: string,
) {
  return new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "openid profile",
    state: transaction.state,
    nonce: transaction.nonce,
    code_challenge: codeChallenge(transaction.codeVerifier),
    code_challenge_method: "S256",
  });
}

export function isValidTransaction(
  transaction: LoginTransaction | undefined,
  state: string | null,
  now = Date.now(),
) {
  return Boolean(
    state &&
    transaction &&
    state === transaction.state &&
    now >= transaction.createdAt &&
    now - transaction.createdAt <= TRANSACTION_MAX_AGE_MS,
  );
}

export function createTokenRequest(
  code: string,
  transaction: LoginTransaction,
  clientId: string,
  redirectUri: string,
) {
  return new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
    code_verifier: transaction.codeVerifier,
  });
}

export function hasExpectedNonce(idClaims: Record<string, unknown>, transaction: LoginTransaction) {
  return typeof idClaims.nonce === "string" && idClaims.nonce === transaction.nonce;
}

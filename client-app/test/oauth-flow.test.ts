import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TRANSACTION_MAX_AGE_MS,
  createAuthorizationParams,
  createLoginTransaction,
  createTokenRequest,
  hasExpectedNonce,
  isValidTransaction,
} from "../src/lib/oauth-flow.ts";
import { codeChallenge, decodeJwtPayload } from "../src/lib/oauth.ts";

describe("OAuth 2.1 Authorization Code + PKCE", () => {
  it("creates independent state, nonce and a high-entropy verifier", () => {
    const first = createLoginTransaction(1_000);
    const second = createLoginTransaction(1_000);

    assert.notEqual(first.state, second.state);
    assert.notEqual(first.nonce, second.nonce);
    assert.notEqual(first.codeVerifier, second.codeVerifier);
    assert.ok(first.codeVerifier.length >= 86);
    assert.equal(first.createdAt, 1_000);
  });

  it("builds an OIDC code request with S256 PKCE", () => {
    const transaction = createLoginTransaction();
    const params = createAuthorizationParams(
      transaction,
      "nextjs-client",
      "https://client.example/callback",
    );

    assert.equal(params.get("response_type"), "code");
    assert.equal(params.get("scope"), "openid profile");
    assert.equal(params.get("state"), transaction.state);
    assert.equal(params.get("nonce"), transaction.nonce);
    assert.equal(params.get("code_challenge_method"), "S256");
    assert.equal(params.get("code_challenge"), codeChallenge(transaction.codeVerifier));
  });

  it("rejects missing, mismatched, future and expired transactions", () => {
    const transaction = createLoginTransaction(10_000);

    assert.equal(isValidTransaction(transaction, transaction.state, 10_001), true);
    assert.equal(isValidTransaction(undefined, transaction.state, 10_001), false);
    assert.equal(isValidTransaction(transaction, "attacker-state", 10_001), false);
    assert.equal(isValidTransaction(transaction, transaction.state, 9_999), false);
    assert.equal(
      isValidTransaction(transaction, transaction.state, 10_000 + TRANSACTION_MAX_AGE_MS + 1),
      false,
    );
  });

  it("sends the original verifier during the code exchange", () => {
    const transaction = createLoginTransaction();
    const body = createTokenRequest(
      "authorization-code",
      transaction,
      "nextjs-client",
      "https://client.example/callback",
    );

    assert.equal(body.get("grant_type"), "authorization_code");
    assert.equal(body.get("code"), "authorization-code");
    assert.equal(body.get("code_verifier"), transaction.codeVerifier);
    assert.equal(body.get("redirect_uri"), "https://client.example/callback");
    assert.equal(body.has("client_secret"), false);
  });

  it("accepts an ID token nonce only when it matches the transaction", () => {
    const transaction = createLoginTransaction();

    assert.equal(hasExpectedNonce({ nonce: transaction.nonce }, transaction), true);
    assert.equal(hasExpectedNonce({ nonce: "replayed-nonce" }, transaction), false);
    assert.equal(hasExpectedNonce({}, transaction), false);
  });
});

describe("JWT payload handling", () => {
  it("decodes claims from an ID token", () => {
    const payload = Buffer.from(JSON.stringify({ sub: "user", nonce: "nonce" })).toString(
      "base64url",
    );
    assert.deepEqual(decodeJwtPayload(`header.${payload}.signature`), {
      sub: "user",
      nonce: "nonce",
    });
  });

  it("rejects a malformed JWT", () => {
    assert.throws(() => decodeJwtPayload("invalid"), /Invalid JWT/);
  });
});

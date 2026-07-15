import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { secureCookie } from "../src/lib/cookie-options.ts";
import { seal, unseal } from "../src/lib/sealed-cookie.ts";

const originalSecret = process.env.SESSION_SECRET;
const originalEnvironment = process.env.NODE_ENV;

function setEnvironment(name: string, value: string | undefined) {
  if (value === undefined) Reflect.deleteProperty(process.env, name);
  else
    Object.defineProperty(process.env, name, {
      configurable: true,
      enumerable: true,
      value,
      writable: true,
    });
}

describe("BFF session protection", () => {
  before(() => {
    process.env.SESSION_SECRET = "test-secret-that-is-at-least-32-characters-long";
  });

  after(() => {
    setEnvironment("SESSION_SECRET", originalSecret);
    setEnvironment("NODE_ENV", originalEnvironment);
  });

  it("encrypts and authenticates session contents", () => {
    const session = { accessToken: "secret-access-token", expiresAt: 1234 };
    const cookie = seal(session);

    assert.equal(cookie.includes(session.accessToken), false);
    assert.deepEqual(unseal(cookie), session);
  });

  it("rejects a tampered sealed cookie", () => {
    const cookie = seal({ subject: "user" });
    const bytes = Buffer.from(cookie, "base64url");
    bytes[bytes.length - 1] ^= 1;
    assert.equal(unseal(bytes.toString("base64url")), undefined);
  });

  it("uses HttpOnly, SameSite and Secure cookie attributes in production", () => {
    setEnvironment("NODE_ENV", "production");
    assert.deepEqual(secureCookie(600), {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 600,
    });
  });

  it("refuses weak session secrets", () => {
    process.env.SESSION_SECRET = "too-short";
    assert.throws(() => seal({ subject: "user" }), /at least 32 characters/);
  });
});

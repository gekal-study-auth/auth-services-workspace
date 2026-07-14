import type { NextApiRequest, NextApiResponse } from "next";
import { cookie, readCookie } from "../../../lib/cookies";
import { oauthConfig } from "../../../lib/config";
import { decodeJwtPayload, type LoginTransaction, type TokenSession } from "../../../lib/oauth";
import { seal, unseal } from "../../../lib/sealed-cookie";

type TokenResponse = { access_token: string; id_token: string; expires_in: number };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  if (typeof req.query.error === "string") return res.status(400).json({ error: req.query.error });

  const code = typeof req.query.code === "string" ? req.query.code : undefined;
  const state = typeof req.query.state === "string" ? req.query.state : undefined;
  const transaction = unseal<LoginTransaction>(readCookie(req, "oauth_transaction"));
  if (!code || !state || !transaction || state !== transaction.state || Date.now() - transaction.createdAt > 600_000) {
    return res.status(400).json({ error: "Invalid or expired OAuth transaction" });
  }

  const tokenResponse = await fetch(`${oauthConfig.authorizationServerUrl}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: oauthConfig.clientId,
      redirect_uri: oauthConfig.redirectUri,
      code,
      code_verifier: transaction.codeVerifier,
    }),
  });
  if (!tokenResponse.ok) {
    return res.status(502).json({ error: "Token exchange failed", detail: await tokenResponse.text() });
  }

  const tokens = await tokenResponse.json() as TokenResponse;
  const idClaims = decodeJwtPayload(tokens.id_token);
  if (idClaims.nonce !== transaction.nonce) return res.status(400).json({ error: "Invalid ID token nonce" });

  const session: TokenSession = {
    accessToken: tokens.access_token,
    idToken: tokens.id_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };
  res.setHeader("Set-Cookie", [
    cookie("auth_session", seal(session), tokens.expires_in),
    cookie("oauth_transaction", "", 0),
  ]);
  res.redirect("/dashboard");
}


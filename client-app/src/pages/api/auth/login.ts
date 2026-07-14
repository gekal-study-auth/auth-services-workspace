import type { NextApiRequest, NextApiResponse } from "next";
import { cookie } from "../../../lib/cookies";
import { oauthConfig } from "../../../lib/config";
import { codeChallenge, randomUrlSafe, type LoginTransaction } from "../../../lib/oauth";
import { seal } from "../../../lib/sealed-cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const transaction: LoginTransaction = {
    state: randomUrlSafe(),
    nonce: randomUrlSafe(),
    codeVerifier: randomUrlSafe(64),
    createdAt: Date.now(),
  };
  const params = new URLSearchParams({
    response_type: "code",
    client_id: oauthConfig.clientId,
    redirect_uri: oauthConfig.redirectUri,
    scope: "openid profile",
    state: transaction.state,
    nonce: transaction.nonce,
    code_challenge: codeChallenge(transaction.codeVerifier),
    code_challenge_method: "S256",
  });

  res.setHeader("Set-Cookie", cookie("oauth_transaction", seal(transaction), 600));
  res.redirect(`${oauthConfig.authorizationServerUrl}/oauth2/authorize?${params}`);
}


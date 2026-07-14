import type { NextApiRequest, NextApiResponse } from "next";
import { clearCookie } from "../../../lib/cookies";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).end();
  clearCookie(res, "auth_session");
  res.redirect("/");
}


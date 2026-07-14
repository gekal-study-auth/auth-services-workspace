import type { GetServerSideProps } from "next";
import Head from "next/head";
import { readCookie } from "../lib/cookies";
import { oauthConfig } from "../lib/config";
import type { TokenSession } from "../lib/oauth";
import { decodeJwtPayload } from "../lib/oauth";
import { unseal } from "../lib/sealed-cookie";

type Props = { idClaims: Record<string, unknown>; apiUser: Record<string, unknown> };

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  const session = unseal<TokenSession>(readCookie(req, "auth_session"));
  if (!session || session.expiresAt <= Date.now()) {
    return { redirect: { destination: "/", permanent: false } };
  }

  const response = await fetch(`${oauthConfig.resourceServerUrl}/api/user`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  if (!response.ok) return { redirect: { destination: "/api/auth/logout", permanent: false } };

  return { props: { idClaims: decodeJwtPayload(session.idToken), apiUser: await response.json() } };
};

export default function Dashboard({ idClaims, apiUser }: Props) {
  return (
    <main className="shell">
      <Head><title>Dashboard | Auth Services Workspace</title></Head>
      <section className="card wide">
        <p className="eyebrow">Authenticated</p>
        <h1>ログインに成功しました。</h1>
        <div className="grid">
          <div><h2>IDトークン</h2><pre>{JSON.stringify(idClaims, null, 2)}</pre></div>
          <div><h2>保護APIの応答</h2><pre>{JSON.stringify(apiUser, null, 2)}</pre></div>
        </div>
        <a className="secondary" href="/api/auth/logout">セッションを終了</a>
      </section>
    </main>
  );
}


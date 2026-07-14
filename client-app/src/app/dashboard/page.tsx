import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { oauthConfig } from "../../lib/config";
import { decodeJwtPayload, type TokenSession } from "../../lib/oauth";
import { unseal } from "../../lib/sealed-cookie";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const cookieStore = await cookies();
  const session = unseal<TokenSession>(cookieStore.get("auth_session")?.value);
  if (!session || session.expiresAt <= Date.now()) redirect("/");

  const response = await fetch(`${oauthConfig.resourceServerUrl}/api/user`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) redirect("/api/auth/logout");

  const idClaims = decodeJwtPayload(session.idToken);
  const apiUser = (await response.json()) as Record<string, unknown>;

  return (
    <main className="shell">
      <section className="card wide">
        <p className="eyebrow">Authenticated</p>
        <h1>ログインに成功しました。</h1>
        <div className="grid">
          <div>
            <h2>IDトークン</h2>
            <pre>{JSON.stringify(idClaims, null, 2)}</pre>
          </div>
          <div>
            <h2>保護APIの応答</h2>
            <pre>{JSON.stringify(apiUser, null, 2)}</pre>
          </div>
        </div>
        <a className="secondary" href="/api/auth/logout">
          セッションを終了
        </a>
      </section>
    </main>
  );
}

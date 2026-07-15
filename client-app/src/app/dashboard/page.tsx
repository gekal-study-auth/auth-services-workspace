import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { oauthConfig } from "../../lib/config";
import { decodeJwtPayload, type TokenSession } from "../../lib/oauth";
import { unseal } from "../../lib/sealed-cookie";
import { listRecentAuthEvents } from "../../lib/auth-audit";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const cookieStore = await cookies();
  const session = unseal<TokenSession>(cookieStore.get("auth_session")?.value);
  if (!session || session.expiresAt <= Date.now()) redirect("/");

  const requestOptions = {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store" as const,
  };
  const [userResponse, resourcesResponse] = await Promise.all([
    fetch(`${oauthConfig.resourceServerUrl}/api/user`, requestOptions),
    fetch(`${oauthConfig.resourceServerUrl}/api/resources`, requestOptions),
  ]);
  if (!userResponse.ok || !resourcesResponse.ok) redirect("/api/auth/logout");

  const idClaims = decodeJwtPayload(session.idToken);
  const apiUser = (await userResponse.json()) as Record<string, unknown>;
  const resources = (await resourcesResponse.json()) as Record<string, unknown>[];
  const subject = typeof idClaims.sub === "string" ? idClaims.sub : "";
  const authEvents = subject ? await listRecentAuthEvents(subject) : [];

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
          <div>
            <h2>DBに保存された保護リソース</h2>
            <pre>{JSON.stringify(resources, null, 2)}</pre>
          </div>
          <div>
            <h2>Client Appの認証監査ログ</h2>
            <pre>{JSON.stringify(authEvents, null, 2)}</pre>
          </div>
        </div>
        <a className="secondary" href="/api/auth/logout">
          セッションを終了
        </a>
      </section>
    </main>
  );
}

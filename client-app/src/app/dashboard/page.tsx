import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { oauthConfig } from "../../lib/config";
import { decodeJwtPayload, type TokenSession } from "../../lib/oauth";
import { unseal } from "../../lib/sealed-cookie";
import { listAuthEventsPage } from "../../lib/auth-audit";

export const metadata: Metadata = { title: "Dashboard" };

type DashboardProps = {
  searchParams: Promise<{ auditPage?: string | string[] }>;
};

export default async function Dashboard({ searchParams }: DashboardProps) {
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
  const params = await searchParams;
  const auditPageValue = Array.isArray(params.auditPage) ? params.auditPage[0] : params.auditPage;
  const requestedAuditPage = Number.parseInt(auditPageValue ?? "1", 10);
  const authEvents = subject
    ? await listAuthEventsPage(subject, requestedAuditPage, 10)
    : { events: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 1 };

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
        </div>
        <a className="secondary" href="/api/auth/logout">
          セッションを終了
        </a>

        <section className="audit-section" aria-labelledby="auth-audit-heading">
          <div className="audit-heading">
            <div>
              <h2 id="auth-audit-heading">Client Appの認証監査ログ</h2>
              <p>{authEvents.totalItems}件のイベント</p>
            </div>
            <span>
              {authEvents.page} / {authEvents.totalPages}ページ
            </span>
          </div>
          <div className="table-scroll">
            <table className="audit-table">
              <thead>
                <tr>
                  <th scope="col">日時</th>
                  <th scope="col">イベント</th>
                  <th scope="col">ユーザー</th>
                  <th scope="col">詳細</th>
                </tr>
              </thead>
              <tbody>
                {authEvents.events.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-cell">
                      認証イベントはまだありません。
                    </td>
                  </tr>
                ) : (
                  authEvents.events.map((event) => (
                    <tr key={event.id}>
                      <td>
                        {event.occurredAt.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
                      </td>
                      <td>
                        <span className="event-badge">{event.eventType}</span>
                      </td>
                      <td>{event.subject ?? "—"}</td>
                      <td>
                        <code>{JSON.stringify(event.detail)}</code>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <nav className="pagination" aria-label="認証監査ログのページ">
            {authEvents.page > 1 ? (
              <a href={`/dashboard?auditPage=${authEvents.page - 1}`}>前のページ</a>
            ) : (
              <span aria-disabled="true">前のページ</span>
            )}
            {authEvents.page < authEvents.totalPages ? (
              <a href={`/dashboard?auditPage=${authEvents.page + 1}`}>次のページ</a>
            ) : (
              <span aria-disabled="true">次のページ</span>
            )}
          </nav>
        </section>
      </section>
    </main>
  );
}

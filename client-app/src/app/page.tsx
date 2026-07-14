export default function Home() {
  return (
    <main className="shell">
      <section className="card">
        <p className="eyebrow">OAuth 2.1 / OpenID Connect</p>
        <h1>認可フローをコードから理解する。</h1>
        <p>Authorization Code Flow + PKCEでログインし、JWTで保護されたAPIを呼び出します。</p>
        <a className="button" href="/api/auth/login">
          ログインを開始
        </a>
        <p className="hint">検証用ユーザー: user / password</p>
      </section>
    </main>
  );
}

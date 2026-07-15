const services = [
  {
    name: "Authorization Server",
    stack: "Spring Boot / Spring Authorization Server",
    url: "https://authorization-server.local.gekal.cn",
    description: "ログイン、同意、PKCE検証、JWTアクセストークンとIDトークンの発行を担当します。",
  },
  {
    name: "Resource Server",
    stack: "Spring Boot / OAuth2 Resource Server",
    url: "https://resource-server.local.gekal.cn",
    description: "JWKSでJWT署名を検証し、profileスコープを持つリクエストだけを許可します。",
  },
  {
    name: "Client Application",
    stack: "Next.js App Router / BFF",
    url: "https://client-app.local.gekal.cn",
    description: "PKCEとセッションをサーバー側Cookieで管理し、保護APIを呼び出します。",
  },
];

export default function Documentation() {
  return (
    <div className="page">
      <header className="hero">
        <nav>
          <a className="brand" href="#top">
            Auth Services Workspace
          </a>
          <div className="navLinks">
            <a href="#architecture">構成</a>
            <a href="#flow">認証フロー</a>
            <a href="#start">起動方法</a>
          </div>
        </nav>
        <div id="top" className="heroContent">
          <p className="eyebrow">OAuth 2.1 · OpenID Connect · PKCE</p>
          <h1>認証と認可を、コードの内側から理解する。</h1>
          <p className="lead">
            OAuth
            2.1とOIDCの仕組みを自前の構成で検証するためのモノレポです。認可コード、PKCE、JWT署名検証、BFFセッションを一つの環境で追跡できます。
          </p>
          <div className="actions">
            <a className="primary" href="#start">
              ローカルで起動
            </a>
            <a
              className="secondary"
              href="https://github.com/gekal-study-auth/auth-services-workspace"
            >
              GitHubでコードを見る
            </a>
          </div>
        </div>
      </header>

      <main>
        <section id="architecture">
          <p className="sectionLabel">Architecture</p>
          <h2>独立した3サービスとHTTPSプロキシ</h2>
          <div className="cards">
            {services.map((service, index) => (
              <article className="card" key={service.name}>
                <span className="number">0{index + 1}</span>
                <h3>{service.name}</h3>
                <p className="stack">{service.stack}</p>
                <p>{service.description}</p>
                <code>{service.url}</code>
              </article>
            ))}
          </div>
          <div className="diagram" aria-label="システム構成">
            <span>Browser</span>
            <b>→ HTTPS</b>
            <span>Nginx</span>
            <b>→</b>
            <span>Client BFF</span>
            <b>⇄ PKCE</b>
            <span>Authorization Server</span>
            <b>→ JWT</b>
            <span>Resource Server</span>
          </div>
        </section>

        <section id="flow" className="split">
          <div>
            <p className="sectionLabel">Authorization Code + PKCE</p>
            <h2>ログインからAPI応答まで</h2>
            <p>ブラウザへトークンを直接公開せず、Next.jsのRoute HandlerをBFFとして利用します。</p>
          </div>
          <ol className="steps">
            <li>
              <strong>PKCE生成</strong>
              <span>BFFがcode_verifierとcode_challengeを生成します。</span>
            </li>
            <li>
              <strong>ログインと同意</strong>
              <span>ユーザーを認証し、profileスコープへの同意を取得します。</span>
            </li>
            <li>
              <strong>コード交換</strong>
              <span>認可コードとcode_verifierを検証してトークンを発行します。</span>
            </li>
            <li>
              <strong>JWT検証</strong>
              <span>Resource Serverが署名、issuer、期限、スコープを検証します。</span>
            </li>
          </ol>
        </section>

        <section id="start">
          <p className="sectionLabel">Quick Start</p>
          <h2>Docker Composeで起動</h2>
          <div className="terminal">
            <div className="terminalBar">
              <i />
              <i />
              <i />
            </div>
            <pre>
              <code>{`git clone git@github.com:gekal-study-auth/auth-services-workspace.git
cd auth-services-workspace
docker compose up -d --build

# Client App
open https://client-app.local.gekal.cn/`}</code>
            </pre>
          </div>
          <div className="notes">
            <article>
              <h3>検証ユーザー</h3>
              <p>
                <code>user</code> / <code>password</code>
              </p>
            </article>
            <article>
              <h3>同意画面</h3>
              <p>
                <code>profile</code>を選択して認可してください。
              </p>
            </article>
            <article>
              <h3>APIログ</h3>
              <p>
                <code>docker compose logs -f authorization-server resource-server</code>
              </p>
            </article>
          </div>
        </section>

        <section className="warning">
          <p className="sectionLabel">Security Note</p>
          <h2>学習・ローカル検証専用</h2>
          <p>
            ComposeではAPI本文ログが有効なため、パスワードやトークンも平文で記録されます。本番環境では必ず本文ログを無効化し、秘密情報を外部のSecret管理へ移してください。
          </p>
        </section>
      </main>

      <footer>
        <span>Auth Services Workspace</span>
        <span>Built with Next.js static export</span>
      </footer>
    </div>
  );
}

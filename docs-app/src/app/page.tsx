const services = [
  {
    id: "01",
    type: "IDENTITY",
    name: "Authorization Server",
    stack: "Spring Boot · Spring Authorization Server",
    url: "authorization-server.local.gekal.cn",
    description:
      "ログイン、同意、PKCE検証からJWT・IDトークンの発行まで、認可フローの中核を担います。",
    accent: "violet",
  },
  {
    id: "02",
    type: "PROTECTED API",
    name: "Resource Server",
    stack: "Spring Boot · OAuth2 Resource Server",
    url: "resource-server.local.gekal.cn",
    description: "JWKSでJWT署名を検証し、必要なスコープを持つリクエストだけを安全に処理します。",
    accent: "cyan",
  },
  {
    id: "03",
    type: "EXPERIENCE",
    name: "Client Application",
    stack: "Next.js App Router · BFF",
    url: "client-app.local.gekal.cn",
    description:
      "PKCEとトークンをサーバー側セッションで管理し、ブラウザへ秘密情報を露出させません。",
    accent: "lime",
  },
];

const steps = [
  [
    "Challenge",
    "PKCEを生成",
    "BFFがcode_verifierを保存し、SHA-256からcode_challengeを生成します。",
  ],
  [
    "Authorize",
    "ログインと同意",
    "Authorization Serverで本人確認を行い、profileスコープへの同意を取得します。",
  ],
  [
    "Exchange",
    "コードを交換",
    "認可コードとcode_verifierを照合し、アクセストークンとIDトークンを発行します。",
  ],
  [
    "Validate",
    "JWTを検証",
    "Resource Serverが署名、issuer、期限、スコープを検証してAPI応答を返します。",
  ],
];

export default function Documentation() {
  return (
    <div className="page" id="top">
      <div className="ambient ambientOne" />
      <div className="ambient ambientTwo" />

      <header className="hero">
        <nav className="siteNav" aria-label="メインナビゲーション">
          <a className="brand" href="#top" aria-label="トップへ戻る">
            <span className="brandMark" aria-hidden="true">
              A
            </span>
            <span>Auth Services</span>
          </a>
          <div className="navLinks">
            <a href="#architecture">Architecture</a>
            <a href="#flow">Flow</a>
            <a href="#start">Quick start</a>
          </div>
          <a className="navCta" href="https://github.com/gekal-study-auth/auth-services-workspace">
            <span>GitHub</span>
            <span aria-hidden="true">↗</span>
          </a>
        </nav>

        <div className="heroGrid">
          <div className="heroCopy">
            <div className="statusPill">
              <span className="pulse" />
              OAuth 2.1 Learning Workspace
            </div>
            <h1>
              認証のしくみを、
              <span>透明にする。</span>
            </h1>
            <p className="lead">
              OAuth 2.1とOpenID
              Connectを、動くコードから理解するための検証環境。PKCE、JWT署名検証、BFFセッションの全経路を追跡できます。
            </p>
            <div className="actions">
              <a className="primary" href="#start">
                <span>環境を起動する</span>
                <span aria-hidden="true">→</span>
              </a>
              <a className="secondary" href="#architecture">
                構成を見る
              </a>
            </div>
            <div className="techLine" aria-label="使用技術">
              <span>SPRING BOOT</span>
              <i />
              <span>NEXT.JS</span>
              <i />
              <span>POSTGRESQL</span>
              <i />
              <span>NGINX</span>
            </div>
          </div>

          <div className="protocolPanel" aria-label="OAuth認証フローの概要">
            <div className="panelTop">
              <div className="windowDots" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <span>authorization.flow</span>
              <span className="secureBadge">● SECURE</span>
            </div>
            <div className="panelBody">
              <div className="requestMeta">
                <span className="method">GET</span>
                <code>/oauth2/authorize</code>
                <span className="httpStatus">302</span>
              </div>
              <div className="codeBlock">
                <p>
                  <span>client_id</span>
                  <b>auth-client</b>
                </p>
                <p>
                  <span>response_type</span>
                  <b>code</b>
                </p>
                <p>
                  <span>code_challenge_method</span>
                  <b>S256</b>
                </p>
                <p>
                  <span>scope</span>
                  <b>openid profile</b>
                </p>
              </div>
              <div className="flowVisual" aria-hidden="true">
                <div className="flowNode activeNode">
                  <span>01</span>
                  <b>Client</b>
                </div>
                <div className="flowConnection">
                  <span>PKCE</span>
                  <i />
                </div>
                <div className="flowNode">
                  <span>02</span>
                  <b>Auth</b>
                </div>
                <div className="flowConnection">
                  <span>JWT</span>
                  <i />
                </div>
                <div className="flowNode">
                  <span>03</span>
                  <b>API</b>
                </div>
              </div>
              <div className="verified">
                <span aria-hidden="true">✓</span>
                <div>
                  <b>Signature verified</b>
                  <small>RS256 · issuer matched · scope granted</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="architecture" className="section architecture">
          <div className="sectionHeading">
            <div>
              <p className="sectionLabel">01 / Architecture</p>
              <h2>
                役割を分離し、
                <br />
                信頼をつなぐ。
              </h2>
            </div>
            <p className="sectionIntro">
              3つの独立サービスをNginxのHTTPSプロキシで束ねます。それぞれの責務と境界が、コードとログから明確に見える構成です。
            </p>
          </div>

          <div className="serviceGrid">
            {services.map((service) => (
              <article className={`serviceCard ${service.accent}`} key={service.name}>
                <div className="cardHeader">
                  <span className="serviceIcon" aria-hidden="true">
                    {service.id}
                  </span>
                  <span className="serviceType">{service.type}</span>
                </div>
                <div>
                  <h3>{service.name}</h3>
                  <p className="stack">{service.stack}</p>
                  <p className="description">{service.description}</p>
                </div>
                <a href={`https://${service.url}`}>
                  <span className="onlineDot" />
                  {service.url}
                  <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>

          <div className="trustRail" aria-label="システム構成">
            <div>
              <small>ENTRY</small>
              <strong>Browser</strong>
            </div>
            <span>
              <i />
              HTTPS
            </span>
            <div>
              <small>PROXY</small>
              <strong>Nginx</strong>
            </div>
            <span>
              <i />
              BFF
            </span>
            <div>
              <small>SESSION</small>
              <strong>Next.js</strong>
            </div>
            <span>
              <i />
              PKCE
            </span>
            <div>
              <small>IDENTITY</small>
              <strong>Spring Auth</strong>
            </div>
            <span>
              <i />
              JWT
            </span>
            <div>
              <small>RESOURCE</small>
              <strong>Protected API</strong>
            </div>
          </div>
        </section>

        <section id="flow" className="section flowSection">
          <div className="flowHeading">
            <p className="sectionLabel">02 / Authorization flow</p>
            <h2>
              秘密をブラウザに
              <br />
              渡さない設計。
            </h2>
            <p>
              BFFがOAuthトランザクションとトークンを管理し、ブラウザには安全なセッションCookieだけを渡します。
            </p>
          </div>
          <ol className="steps">
            {steps.map(([label, title, text], index) => (
              <li key={label}>
                <span className="stepNumber">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <small>{label}</small>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <span className="stepArrow" aria-hidden="true">
                  ↘
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section id="start" className="section quickStart">
          <div className="sectionHeading startHeading">
            <div>
              <p className="sectionLabel">03 / Quick start</p>
              <h2>
                数分で、認証フローを
                <br />
                動かしてみる。
              </h2>
            </div>
            <p className="sectionIntro">
              Docker Composeがアプリケーション、データベース、HTTPSプロキシをまとめて起動します。
            </p>
          </div>

          <div className="terminal">
            <div className="terminalBar">
              <div className="windowDots" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <span>~/auth-services-workspace</span>
              <span className="shellType">ZSH</span>
            </div>
            <pre>
              <code>
                <span className="comment"># リポジトリを取得</span>
                {`\ngit clone git@github.com:gekal-study-auth/auth-services-workspace.git\ncd auth-services-workspace\n\n`}
                <span className="comment"># すべてのサービスを起動</span>
                {`\ndocker compose up -d --build\n\n`}
                <span className="comment"># ブラウザでクライアントを開く</span>
                {`\nopen https://client-app.local.gekal.cn/`}
              </code>
            </pre>
          </div>

          <div className="infoGrid">
            <article>
              <span>01</span>
              <div>
                <h3>検証ユーザー</h3>
                <p>
                  <code>user</code> / <code>password</code>
                </p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>同意画面</h3>
                <p>
                  <code>profile</code>を選択して認可します。
                </p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>APIログ</h3>
                <p>
                  <code>docker compose logs -f</code>で通信を追跡できます。
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="securityNote">
          <div className="securityIcon" aria-hidden="true">
            !
          </div>
          <div>
            <p className="sectionLabel">Security note</p>
            <h2>学習・ローカル検証専用です。</h2>
            <p>
              ComposeではAPI本文ログが有効なため、パスワードやトークンも平文で記録されます。本番環境では本文ログを無効化し、秘密情報を外部のSecret管理へ移してください。
            </p>
          </div>
        </section>
      </main>

      <footer>
        <a className="brand" href="#top">
          <span className="brandMark">A</span>
          <span>Auth Services</span>
        </a>
        <p>OAuth 2.1 / OIDC learning workspace</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </div>
  );
}

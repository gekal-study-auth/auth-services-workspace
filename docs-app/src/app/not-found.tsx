import Link from "next/link";
import { SiteBrand } from "../components/SiteBrand";

const destinations = [
  {
    label: "FLOW LIBRARY",
    title: "認証フローから探す",
    description: "OAuth 2.0、OAuth 2.1、OpenID Connectの動きを図とAPI例で確認できます。",
    href: "/flows/",
  },
  {
    label: "OAUTH 2.1",
    title: "OAuth 2.1を読む",
    description: "OAuth 2.0から何が変わり、なぜ安全になったのかを基礎から説明します。",
    href: "/specs/oauth-2-1/",
  },
  {
    label: "OPENID CONNECT",
    title: "OIDCを読む",
    description: "IDトークンによるログインと、OAuthとの役割の違いを整理します。",
    href: "/specs/oidc-core/",
  },
];

export default function NotFound() {
  return (
    <div className="page notFoundPage">
      <div className="ambient ambientOne" />
      <div className="ambient ambientTwo" />

      <nav className="siteNav notFoundNav" aria-label="404ページのナビゲーション">
        <SiteBrand ariaLabel="Auth Servicesのトップへ戻る" />
        <span className="notFoundNavStatus">404 / ROUTE NOT FOUND</span>
      </nav>

      <main className="notFoundMain">
        <section className="notFoundHero" aria-labelledby="not-found-title">
          <div className="notFoundCode" aria-hidden="true">
            404
          </div>
          <div className="notFoundCopy">
            <div className="statusPill">
              <span className="notFoundDot" />
              Response received
            </div>
            <h1 id="not-found-title">お探しのページは見つかりませんでした。</h1>
            <p>
              URLが変更されたか、入力したアドレスに小さな間違いがあるかもしれません。
              認証フローや仕様の入口から、目的のページを探してみてください。
            </p>
            <div className="actions notFoundActions">
              <Link className="primary" href="/">
                <span>トップへ戻る</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link className="secondary" href="/flows/">
                フロー一覧を見る
              </Link>
            </div>
          </div>

          <div className="notFoundResponse" aria-label="HTTPレスポンス例">
            <div className="notFoundResponseBar">
              <span />
              <span />
              <span />
              <strong>HTTP RESPONSE</strong>
            </div>
            <pre>
              <code>
                <span>HTTP/1.1 </span>
                <b>404 Not Found</b>
                {"\n"}
                <span>Content-Type: </span>text/html; charset=utf-8{"\n"}
                <span>Cache-Control: </span>public{"\n\n"}
                {`{\n  "message": "The requested page was not found",\n  "next": "/flows/"\n}`}
              </code>
            </pre>
          </div>
        </section>

        <section className="notFoundDestinations" aria-labelledby="destination-title">
          <div className="notFoundSectionHeading">
            <span>WHERE TO NEXT?</span>
            <h2 id="destination-title">ここから学習を続ける</h2>
          </div>
          <div className="notFoundGrid">
            {destinations.map((destination) => (
              <Link href={destination.href} key={destination.href}>
                <span>{destination.label}</span>
                <h3>{destination.title}</h3>
                <p>{destination.description}</p>
                <strong aria-hidden="true">Explore →</strong>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

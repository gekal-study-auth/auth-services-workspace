import { protocols } from "../../lib/protocols";
import { specifications } from "../../lib/specs";

export default function FlowCatalogPage() {
  return (
    <div className="catalogPage">
      <header className="catalogHeader">
        <nav className="flowNav">
          <a className="brand" href="/">
            <span className="brandMark">A</span>
            <span>Auth Services</span>
          </a>
          <a className="backLink" href="/">
            Overview ↗
          </a>
        </nav>
        <p className="sectionLabel">Protocol knowledge base</p>
        <h1>
          認証・認可フローを
          <br />
          仕様から理解する。
        </h1>
        <p>
          スペックの背景を確認し、対応するインタラクティブなシーケンス図でメッセージの流れを追跡できます。
        </p>
      </header>
      <main className="catalogMain">
        {specifications.map((spec) => (
          <section className={`specGroup ${spec.accent}`} key={spec.slug}>
            <div className="specGroupHeader">
              <div>
                <small>SPECIFICATION</small>
                <h2>{spec.name}</h2>
                <p>{spec.fullName}</p>
              </div>
              <a href={`/specs/${spec.slug}/`}>仕様ページを見る →</a>
            </div>
            <div className="catalogGrid">
              {spec.flowSlugs.map((slug) => {
                const flow = protocols.find((item) => item.slug === slug)!;
                return (
                  <a className="catalogCard" href={`/flows/${flow.slug}/`} key={flow.slug}>
                    <span>{flow.status === "legacy" ? "LEGACY" : "INTERACTIVE FLOW"}</span>
                    <h3>{flow.shortName}</h3>
                    <p>{flow.summary}</p>
                    <i>View flow →</i>
                  </a>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

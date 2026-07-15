import Link from "next/link";
import { FlowNav } from "../../components/FlowNav";
import { protocols } from "../../lib/protocols";
import { specifications } from "../../lib/specs";

export default function FlowCatalogPage() {
  return (
    <div className="catalogPage">
      <header className="catalogHeader">
        <FlowNav />
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
              <Link href={`/specs/${spec.slug}/`}>仕様ページを見る →</Link>
            </div>
            <div className="catalogGrid">
              {spec.flowSlugs.length > 0 ? (
                spec.flowSlugs.map((slug) => {
                  const flow = protocols.find((item) => item.slug === slug)!;
                  return (
                    <Link className="catalogCard" href={`/flows/${flow.slug}/`} key={flow.slug}>
                      <span>{flow.status === "legacy" ? "LEGACY" : "INTERACTIVE FLOW"}</span>
                      <h3>{flow.shortName}</h3>
                      <p>{flow.summary}</p>
                      <i>View flow →</i>
                    </Link>
                  );
                })
              ) : (
                <Link className="catalogCard catalogSpecCard" href={`/specs/${spec.slug}/`}>
                  <span>SPECIFICATION GUIDE</span>
                  <h3>{spec.keyPoints.slice(0, 3).join(" · ")}</h3>
                  <p>{spec.summary}</p>
                  <i>Read specification →</i>
                </Link>
              )}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

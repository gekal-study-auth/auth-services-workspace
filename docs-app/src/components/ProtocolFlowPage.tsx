import { AnimatedFlowDiagram } from "./AnimatedFlowDiagram";
import type { Protocol } from "../lib/protocols";
import { protocols } from "../lib/protocols";
import { specifications } from "../lib/specs";

export function ProtocolFlowPage({ protocol }: { protocol: Protocol }) {
  const specification = specifications.find((item) => item.flowSlugs.includes(protocol.slug));
  const relatedFlows = (specification?.flowSlugs ?? [])
    .filter((slug) => slug !== protocol.slug)
    .map((slug) => protocols.find((item) => item.slug === slug)!)
    .slice(0, 3);
  return (
    <div className={`protocolPage ${protocol.accent}`}>
      <header className="protocolHeader">
        <nav className="flowNav">
          <a className="brand" href="/">
            <span className="brandMark">A</span>
            <span>Auth Services</span>
          </a>
          <div className="protocolTabs">
            {specifications.map((item) => (
              <a
                className={item.slug === specification?.slug ? "active" : ""}
                href={`/specs/${item.slug}/`}
                key={item.slug}
              >
                {item.name}
              </a>
            ))}
          </div>
          <a className="backLink" href="/">
            Overview ↗
          </a>
        </nav>
        <div className="protocolHero">
          <div>
            <p className="sectionLabel">{protocol.eyebrow}</p>
            <h1>{protocol.title}</h1>
            <p className="protocolSummary">{protocol.summary}</p>
            {protocol.status === "legacy" && (
              <div className="legacyNotice">Legacy flow — 新規実装では使用しないでください</div>
            )}
          </div>
          <div className="protocolFacts">
            {protocol.highlights.map((item) => (
              <div key={item.label}>
                <small>{item.label}</small>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </header>
      <main className="flowMain">
        <AnimatedFlowDiagram protocol={protocol} />
        <section className="comparisonNav">
          <div>
            <p className="sectionLabel">Continue learning</p>
            <h2>仕様の違いを、フローで比較する。</h2>
          </div>
          <div className="comparisonLinks">
            {relatedFlows.map((item) => (
              <a href={`/flows/${item.slug}/`} key={item.slug}>
                <span>{item.eyebrow.split(" /")[0]}</span>
                <strong>{item.shortName}</strong>
                <i>→</i>
              </a>
            ))}
          </div>
        </section>
      </main>
      <footer className="flowFooter">
        <span>Auth Services Workspace</span>
        <span>{protocol.shortName} · Interactive flow</span>
      </footer>
    </div>
  );
}

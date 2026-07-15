import { AnimatedFlowDiagram } from "./AnimatedFlowDiagram";
import type { Protocol } from "../lib/protocols";
import { protocols } from "../lib/protocols";

export function ProtocolFlowPage({ protocol }: { protocol: Protocol }) {
  return (
    <div className={`protocolPage ${protocol.accent}`}>
      <header className="protocolHeader">
        <nav className="flowNav">
          <a className="brand" href="/">
            <span className="brandMark">A</span>
            <span>Auth Services</span>
          </a>
          <div className="protocolTabs">
            {protocols.map((item) => (
              <a
                className={item.slug === protocol.slug ? "active" : ""}
                href={`/flows/${item.slug}/`}
                key={item.slug}
              >
                {item.shortName}
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
            {protocols
              .filter((item) => item.slug !== protocol.slug)
              .map((item) => (
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

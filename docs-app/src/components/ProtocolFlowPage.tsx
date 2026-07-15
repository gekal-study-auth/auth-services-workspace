import Link from "next/link";
import { AnimatedFlowDiagram } from "./AnimatedFlowDiagram";
import { BeginnerFlowGuide } from "./BeginnerFlowGuide";
import { FlowNav, type FlowNavTab } from "./FlowNav";
import type { Protocol } from "../lib/protocols";
import { protocols } from "../lib/protocols";
import { specifications } from "../lib/specs";

export function ProtocolFlowPage({ protocol }: { protocol: Protocol }) {
  const specification = specifications.find((item) => item.flowSlugs.includes(protocol.slug));
  const relatedFlows = (specification?.flowSlugs ?? [])
    .filter((slug) => slug !== protocol.slug)
    .map((slug) => protocols.find((item) => item.slug === slug)!)
    .slice(0, 3);
  const tabs: FlowNavTab[] = [{ href: "/flows/", label: "All flows" }];
  if (specification) {
    tabs.push({ href: `/specs/${specification.slug}/`, label: specification.name, active: true });
  }
  return (
    <div className={`protocolPage ${protocol.accent}`}>
      <header className="protocolHeader">
        <FlowNav tabs={tabs} />
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
        <BeginnerFlowGuide protocol={protocol} />
        <AnimatedFlowDiagram protocol={protocol} />
        <section className="comparisonNav">
          <div>
            <p className="sectionLabel">Related flows</p>
            <h2>同じ仕様のフローを、続けて理解する。</h2>
          </div>
          <div className="comparisonLinks">
            {relatedFlows.map((item) => (
              <Link href={`/flows/${item.slug}/`} key={item.slug}>
                <span>{specification?.name ?? "Related flow"}</span>
                <strong>{item.shortName}</strong>
                <i>→</i>
              </Link>
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

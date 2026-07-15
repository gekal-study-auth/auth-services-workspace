import { notFound } from "next/navigation";
import { protocols } from "../../../lib/protocols";
import { getSpecification, specifications } from "../../../lib/specs";

export function generateStaticParams() {
  return specifications.map(({ slug }) => ({ slug }));
}

export default async function SpecificationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const spec = getSpecification(slug);
  if (!spec) notFound();
  return (
    <div className={`specPage ${spec.accent}`}>
      <header className="specHero">
        <nav className="flowNav">
          <a className="brand" href="/">
            <span className="brandMark">A</span>
            <span>Auth Services</span>
          </a>
          <a className="backLink" href="/flows/">
            All flows ↗
          </a>
        </nav>
        <div className="specHeroGrid">
          <div>
            <p className="sectionLabel">Specification</p>
            <h1>{spec.name}</h1>
            <h2>{spec.fullName}</h2>
            <p>{spec.summary}</p>
          </div>
          <div className="specMeta">
            <small>STATUS</small>
            <strong>{spec.status}</strong>
            <small>FLOWS</small>
            <strong>{spec.flowSlugs.length} documented</strong>
            {spec.sourceUrl && (
              <a className="specSource" href={spec.sourceUrl} rel="noreferrer" target="_blank">
                Primary specification ↗
              </a>
            )}
          </div>
        </div>
      </header>
      <main className="specMain">
        <section className="keyPointSection">
          <p className="sectionLabel">Key concepts</p>
          <div>
            {spec.keyPoints.map((point, index) => (
              <span key={point}>
                <i>{String(index + 1).padStart(2, "0")}</i>
                {point}
              </span>
            ))}
          </div>
        </section>
        <section className="specFlowSection">
          <div>
            <p className="sectionLabel">Interactive flows</p>
            <h2>この仕様に属するフロー</h2>
          </div>
          <div className="specFlowList">
            {spec.flowSlugs.map((flowSlug) => {
              const flow = protocols.find((item) => item.slug === flowSlug)!;
              return (
                <a href={`/flows/${flow.slug}/`} key={flow.slug}>
                  <span>
                    {spec.name}
                    {flow.status === "legacy" ? " · Legacy" : " · Interactive flow"}
                  </span>
                  <strong>{flow.title}</strong>
                  <p>{flow.summary}</p>
                  <i>図を再生する →</i>
                </a>
              );
            })}
          </div>
        </section>
        <section className="allSpecs">
          <p className="sectionLabel">Other specifications</p>
          <div>
            {specifications
              .filter((item) => item.slug !== spec.slug)
              .map((item) => (
                <a href={`/specs/${item.slug}/`} key={item.slug}>
                  <small>{item.name}</small>
                  <strong>{item.fullName}</strong>
                  <span>→</span>
                </a>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { FlowNav } from "../../../components/FlowNav";
import { protocols } from "../../../lib/protocols";
import { getSpecification, specifications } from "../../../lib/specs";
import { getSpecificationGuide } from "../../../lib/specification-guides";

export function generateStaticParams() {
  return specifications.map(({ slug }) => ({ slug }));
}

export default async function SpecificationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const spec = getSpecification(slug);
  if (!spec) notFound();
  const guide = getSpecificationGuide(slug);
  return (
    <div className={`specPage ${spec.accent}`}>
      <header className="specHero">
        <FlowNav backHref="/flows/" backLabel="All flows ↗" />
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
        {guide && (
          <>
            <section className="specIntroduction">
              <div>
                <p className="sectionLabel">Overview</p>
                <h2>
                  この仕様は、
                  <br />
                  何を解決するのか。
                </h2>
                <span>{guide.audience}</span>
              </div>
              <div>
                {guide.introduction.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
            <section className="specPurpose">
              <div className="specSectionHeading">
                <p className="sectionLabel">Purpose and responsibilities</p>
                <h2>仕様が定める、大切なこと。</h2>
              </div>
              <div className="purposeGrid">
                {guide.purpose.map((item, index) => (
                  <article key={item.title}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
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
        {guide && (
          <section className="specSecurity">
            <div>
              <p className="sectionLabel">Security considerations</p>
              <h2>安全に使うための確認事項。</h2>
              <p>
                仕様を実装するときは、正常系の通信だけでなく、値のすり替え、再利用、漏えいが起きた場合も考えます。
              </p>
            </div>
            <ol>
              {guide.security.map((item, index) => (
                <li key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
        {spec.flowSlugs.length > 0 && (
          <section className="specFlowSection">
            <div>
              <p className="sectionLabel">Interactive flows</p>
              <h2>この仕様に属するフロー</h2>
            </div>
            <div className="specFlowList">
              {spec.flowSlugs.map((flowSlug) => {
                const flow = protocols.find((item) => item.slug === flowSlug)!;
                return (
                  <Link href={`/flows/${flow.slug}/`} key={flow.slug}>
                    <span>
                      {spec.name}
                      {flow.status === "legacy" ? " · Legacy" : " · Interactive flow"}
                    </span>
                    <strong>{flow.title}</strong>
                    <p>{flow.summary}</p>
                    <i>図を再生する →</i>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
        {guide && (
          <section className="specRelationship">
            <p className="sectionLabel">Position and relationship</p>
            <div>
              <h2>ほかの仕様との関係</h2>
              <p>{guide.relationship}</p>
            </div>
          </section>
        )}
        <section className="allSpecs">
          <p className="sectionLabel">Other specifications</p>
          <div>
            {specifications
              .filter((item) => item.slug !== spec.slug)
              .map((item) => (
                <Link href={`/specs/${item.slug}/`} key={item.slug}>
                  <small>{item.name}</small>
                  <strong>{item.fullName}</strong>
                  <span>→</span>
                </Link>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}

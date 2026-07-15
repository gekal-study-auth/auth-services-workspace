import Link from "next/link";
import { SiteBrand } from "./SiteBrand";

export type FlowNavTab = { href: string; label: string; active?: boolean };

/**
 * Shared top navigation for flow / spec / catalog pages.
 * Renders the brand, optional center tabs, and a trailing back link.
 */
export function FlowNav({
  tabs,
  backHref = "/",
  backLabel = "Overview ↗",
}: {
  tabs?: FlowNavTab[];
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <nav className="flowNav">
      <SiteBrand />
      {tabs && tabs.length > 0 && (
        <div className="protocolTabs">
          {tabs.map((tab) => (
            <Link className={tab.active ? "active" : undefined} href={tab.href} key={tab.href}>
              {tab.label}
            </Link>
          ))}
        </div>
      )}
      <Link className="backLink" href={backHref}>
        {backLabel}
      </Link>
    </nav>
  );
}

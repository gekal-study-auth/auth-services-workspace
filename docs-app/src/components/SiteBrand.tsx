import Link from "next/link";

export function SiteBrand({
  href = "/",
  className = "brand",
  ariaLabel,
}: {
  href?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <Link className={className} href={href} aria-label={ariaLabel}>
      <span className="brandMark" aria-hidden="true">
        A
      </span>
      <span>Auth Services</span>
    </Link>
  );
}

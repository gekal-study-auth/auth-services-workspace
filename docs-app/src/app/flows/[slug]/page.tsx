import { notFound } from "next/navigation";
import { ProtocolFlowPage } from "../../../components/ProtocolFlowPage";
import { getProtocol, protocols } from "../../../lib/protocols";

export function generateStaticParams() {
  return protocols.map(({ slug }) => ({ slug }));
}

export default async function AdditionalFlowPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const protocol = getProtocol(slug);
  if (!protocol) notFound();
  return <ProtocolFlowPage protocol={protocol} />;
}

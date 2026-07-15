import { ProtocolFlowPage } from "../../../components/ProtocolFlowPage";
import { getProtocol } from "../../../lib/protocols";

export default function OAuth20Page() {
  return <ProtocolFlowPage protocol={getProtocol("oauth-2-0")!} />;
}

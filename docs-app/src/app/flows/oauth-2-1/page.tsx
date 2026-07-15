import { ProtocolFlowPage } from "../../../components/ProtocolFlowPage";
import { getProtocol } from "../../../lib/protocols";

export default function OAuth21Page() {
  return <ProtocolFlowPage protocol={getProtocol("oauth-2-1")!} />;
}

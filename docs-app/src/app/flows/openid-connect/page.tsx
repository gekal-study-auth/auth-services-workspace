import { ProtocolFlowPage } from "../../../components/ProtocolFlowPage";
import { getProtocol } from "../../../lib/protocols";

export default function OpenIDConnectPage() {
  return <ProtocolFlowPage protocol={getProtocol("openid-connect")!} />;
}

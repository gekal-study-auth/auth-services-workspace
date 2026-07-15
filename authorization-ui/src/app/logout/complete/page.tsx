import { Button } from "@mui/material";
import { AuthShell } from "../../../components/AuthShell";

export default function LogoutCompletePage() {
  return (
    <AuthShell
      eyebrow="Signed out"
      title="ログアウトしました。"
      description="認可サーバーのセッションを安全に終了しました。"
    >
      <Button variant="contained" href="https://client-app.local.gekal.cn/">
        Client Appへ戻る
      </Button>
    </AuthShell>
  );
}

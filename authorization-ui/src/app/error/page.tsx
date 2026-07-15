import { Alert, Button, Stack } from "@mui/material";
import { AuthShell } from "../../components/AuthShell";

export default function ErrorPage() {
  return (
    <AuthShell
      eyebrow="Authorization Error"
      title="処理を完了できませんでした。"
      description="認可リクエストが無効か、セッションの有効期限が切れています。"
    >
      <Stack spacing={2}>
        <Alert severity="warning">Client Appからログインを最初からやり直してください。</Alert>
        <Button variant="contained" href="https://client-app.local.gekal.cn/">
          Client Appへ戻る
        </Button>
      </Stack>
    </AuthShell>
  );
}

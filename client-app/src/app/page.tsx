type HomeProps = {
  searchParams: Promise<{ auth_error?: string | string[] }>;
};

const errorMessages: Record<string, string> = {
  access_denied:
    "認可がキャンセルされました。再試行する場合は、同意画面でprofileスコープを選択してから許可してください。",
  invalid_transaction:
    "ログイン処理の有効期限が切れたか、別のログイン操作によって更新されました。ログインを最初からやり直してください。",
  oauth_error: "認可処理を完了できませんでした。ログインを最初からやり直してください。",
};

export default async function Home({ searchParams }: HomeProps) {
  const authError = (await searchParams).auth_error;
  const errorCode = Array.isArray(authError) ? authError[0] : authError;
  const errorMessage = errorCode ? errorMessages[errorCode] : undefined;

  return (
    <Box component="main" sx={pageShellSx}>
      <Paper component="section" variant="outlined" sx={homeCardSx}>
        <Stack spacing={2.25} sx={{ alignItems: "flex-start" }}>
          <Typography
            variant="overline"
            sx={{ color: "primary.main", fontWeight: 800, letterSpacing: "0.15em" }}
          >
            OAuth 2.1 / OpenID Connect
          </Typography>
          <Typography component="h1" variant="h1">
            認可フローをコードから理解する。
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Authorization Code Flow + PKCEでログインし、JWTで保護されたAPIを呼び出します。
          </Typography>
          {errorMessage && (
            <Alert severity="error" variant="outlined" sx={{ width: "100%" }}>
              {errorMessage}
            </Alert>
          )}
          <Button variant="contained" size="large" href="/api/auth/login">
            {errorMessage ? "ログインを再試行" : "ログインを開始"}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
            検証用ユーザー: user / Gekal-Auth-Demo!2026-7fQ9
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

const pageShellSx = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  p: { xs: 2, sm: 4 },
};

const homeCardSx = {
  width: "min(680px, 100%)",
  p: { xs: 3.5, sm: 6 },
  borderColor: "divider",
  borderRadius: 3,
  backgroundColor: "rgba(10, 25, 42, 0.88)",
  boxShadow: "0 28px 80px #02071088",
};
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";

"use client";

import { Alert, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "../../components/AuthShell";

type LoginContext = {
  authenticated: boolean;
  username: string | null;
  csrf: { parameterName: string; token: string };
};

export function LoginForm() {
  const error = useSearchParams().get("error");
  const [context, setContext] = useState<LoginContext>();
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetch("/ui-api/login-context", { cache: "no-store", credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<LoginContext>;
      })
      .then(setContext)
      .catch(() => setLoadError(true));
  }, []);

  return (
    <AuthShell
      eyebrow="Authorization Server"
      title="アカウントへログイン"
      description="Client Appへ戻る前に、認可サーバーが本人確認を行います。パスワードは認可サーバーだけへ送信されます。"
    >
      {error && <Alert severity="error">ユーザー名またはパスワードが正しくありません。</Alert>}
      {loadError && <Alert severity="error">ログイン画面を初期化できませんでした。</Alert>}
      {!context && !loadError ? (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <CircularProgress size={22} />
          <Typography color="text.secondary">安全なログインセッションを準備しています…</Typography>
        </Stack>
      ) : (
        context && (
          <Stack component="form" method="post" action="/ui-api/login" spacing={2}>
            <input type="hidden" name={context.csrf.parameterName} value={context.csrf.token} />
            <TextField
              name="username"
              label="ユーザー名"
              autoComplete="username"
              required
              autoFocus
            />
            <TextField
              name="password"
              label="パスワード"
              type="password"
              autoComplete="current-password"
              required
            />
            <Button type="submit" variant="contained" size="large">
              ログインして続行
            </Button>
            <Typography variant="caption" color="text.secondary">
              デモユーザー: user / password
            </Typography>
          </Stack>
        )
      )}
    </AuthShell>
  );
}

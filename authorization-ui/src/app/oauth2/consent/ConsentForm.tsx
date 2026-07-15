"use client";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "../../../components/AuthShell";

type ConsentContext = {
  clientId: string;
  clientName: string;
  state: string;
  username: string;
  scopes: Array<{
    name: string;
    description: string;
    previouslyApproved: boolean;
    required: boolean;
    locked: boolean;
    defaultSelected: boolean;
  }>;
  csrf: { parameterName: string; token: string };
};

export function ConsentForm() {
  const query = useSearchParams().toString();
  const [context, setContext] = useState<ConsentContext>();
  const [loadError, setLoadError] = useState(false);
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/ui-api/consent-context?${query}`, { cache: "no-store", credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<ConsentContext>;
      })
      .then((loaded) => {
        setContext(loaded);
        setSelectedScopes(
          new Set(
            loaded.scopes.filter((scope) => scope.defaultSelected).map((scope) => scope.name),
          ),
        );
      })
      .catch(() => setLoadError(true));
  }, [query]);

  return (
    <AuthShell
      eyebrow="Consent"
      title="アクセスを許可しますか？"
      description="許可する情報を確認してください。許可しない場合、Client Appへ情報やトークンは渡されません。"
    >
      {loadError && <Alert severity="error">同意内容を読み込めませんでした。</Alert>}
      {!context && !loadError && <CircularProgress size={26} />}
      {context && (
        <Stack spacing={2.5}>
          <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
            <Typography sx={{ fontWeight: 800 }}>{context.clientName}</Typography>
            <Typography variant="caption" color="text.secondary">
              Client ID: {context.clientId} ・ ログイン中: {context.username}
            </Typography>
          </Paper>
          <Box component="form" id="approve-consent" method="post" action="/oauth2/authorize">
            <input type="hidden" name="client_id" value={context.clientId} />
            <input type="hidden" name="state" value={context.state} />
            <input type="hidden" name={context.csrf.parameterName} value={context.csrf.token} />
            <Stack spacing={1.25}>
              {context.scopes.map((scope) => (
                <Paper
                  key={scope.name}
                  variant="outlined"
                  sx={{ px: 1.5, py: 1, borderColor: "divider" }}
                >
                  {scope.locked && <input type="hidden" name="scope" value={scope.name} />}
                  <FormControlLabel
                    control={
                      <Checkbox
                        name={scope.locked ? undefined : "scope"}
                        value={scope.name}
                        checked={selectedScopes.has(scope.name)}
                        disabled={scope.locked}
                        onChange={(event) => {
                          setSelectedScopes((current) => {
                            const next = new Set(current);
                            if (event.target.checked) next.add(scope.name);
                            else next.delete(scope.name);
                            return next;
                          });
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <Typography sx={{ fontWeight: 800 }}>{scope.name}</Typography>
                          <Chip
                            label={
                              scope.locked ? "OIDC必須" : scope.required ? "アプリ必須" : "任意"
                            }
                            size="small"
                            color={scope.required ? "primary" : "default"}
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {scope.description}
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              ))}
            </Stack>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 1.5,
            }}
          >
            <Button
              form="approve-consent"
              type="submit"
              disabled={context.scopes.some(
                (scope) => scope.required && !selectedScopes.has(scope.name),
              )}
              variant="contained"
              fullWidth
              sx={{ whiteSpace: "nowrap" }}
            >
              許可して実行
            </Button>
            <Box component="form" method="post" action="/oauth2/authorize">
              <input type="hidden" name="client_id" value={context.clientId} />
              <input type="hidden" name="state" value={context.state} />
              <input type="hidden" name={context.csrf.parameterName} value={context.csrf.token} />
              <Button
                type="submit"
                variant="outlined"
                color="secondary"
                fullWidth
                sx={{ whiteSpace: "nowrap" }}
              >
                キャンセル
              </Button>
            </Box>
          </Box>
        </Stack>
      )}
    </AuthShell>
  );
}

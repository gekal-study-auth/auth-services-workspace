import type { Metadata } from "next";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { oauthConfig } from "../../lib/config";
import { decodeJwtPayload, type TokenSession } from "../../lib/oauth";
import { unseal } from "../../lib/sealed-cookie";
import { listAuthEventsPage } from "../../lib/auth-audit";
import { AuthAuditTable } from "./AuthAuditTable";
import { authWarn } from "../../lib/auth-log";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const cookieStore = await cookies();
  const session = unseal<TokenSession>(cookieStore.get("auth_session")?.value);
  if (!session || session.expiresAt <= Date.now()) redirect("/");

  const requestOptions = {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store" as const,
  };
  const [userResponse, resourcesResponse] = await Promise.all([
    fetch(`${oauthConfig.resourceServerUrl}/api/user`, requestOptions),
    fetch(`${oauthConfig.resourceServerUrl}/api/resources`, requestOptions),
  ]);
  if (!userResponse.ok || !resourcesResponse.ok) {
    const accessTokenClaims = decodeJwtPayload(session.accessToken);
    const grantedScopes = accessTokenClaims.scope ?? accessTokenClaims.scp ?? [];
    authWarn("protected_api_request_failed", {
      grantedScopes,
      profileScopeGranted:
        (typeof grantedScopes === "string" && grantedScopes.split(" ").includes("profile")) ||
        (Array.isArray(grantedScopes) && grantedScopes.includes("profile")),
      responses: [
        { endpoint: "/api/user", status: userResponse.status },
        { endpoint: "/api/resources", status: resourcesResponse.status },
      ],
    });
    redirect("/api/auth/logout");
  }

  const idClaims = decodeJwtPayload(session.idToken);
  const apiUser = (await userResponse.json()) as Record<string, unknown>;
  const resources = (await resourcesResponse.json()) as Record<string, unknown>[];
  const subject = typeof idClaims.sub === "string" ? idClaims.sub : "";
  const authEvents = subject
    ? await listAuthEventsPage(subject, 1, 10)
    : { events: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 1 };

  return (
    <Box component="main" sx={dashboardShellSx}>
      <Paper component="section" variant="outlined" sx={dashboardCardSx}>
        <Typography
          variant="overline"
          sx={{ color: "primary.main", fontWeight: 800, letterSpacing: "0.15em" }}
        >
          Authenticated
        </Typography>
        <Typography component="h1" variant="h1" sx={{ mt: 1.5, mb: 3 }}>
          ログインに成功しました。
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 2.5,
          }}
        >
          <JsonPanel title="IDトークン" value={idClaims} />
          <JsonPanel title="保護APIの応答" value={apiUser} />
          <JsonPanel title="DBに保存された保護リソース" value={resources} />
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ mt: 2.5, flexWrap: "wrap", gap: 1.5 }}>
          <Button variant="outlined" color="secondary" href="/api/auth/logout">
            セッションのみ終了
          </Button>
          <Button variant="contained" color="error" href="/api/auth/logout-with-revocation">
            ログアウトしてトークンも無効化
          </Button>
        </Stack>

        <Divider sx={{ my: 3.5 }} />
        <Box component="section" aria-labelledby="auth-audit-heading">
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "end", mb: 1.75 }}
          >
            <Box>
              <Typography component="h2" variant="h2" id="auth-audit-heading">
                Client Appの認証監査ログ
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {authEvents.totalItems}件のイベント
              </Typography>
            </Box>
          </Stack>
          <AuthAuditTable
            events={authEvents.events.map((event) => ({
              ...event,
              occurredAt: event.occurredAt.toISOString(),
            }))}
            page={authEvents.page}
            pageSize={authEvents.pageSize}
            totalItems={authEvents.totalItems}
          />
        </Box>
      </Paper>
    </Box>
  );
}

function JsonPanel({ title, value }: { title: string; value: unknown }) {
  return (
    <Box>
      <Typography component="h2" variant="h2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Paper
        component="pre"
        variant="outlined"
        sx={{
          m: 0,
          minHeight: 260,
          maxHeight: 360,
          overflow: "auto",
          p: 2.5,
          borderColor: "#20374d",
          borderRadius: 2,
          backgroundColor: "#050d17",
          color: "#b9f5e9",
          fontSize: "0.8rem",
          lineHeight: 1.6,
        }}
      >
        {JSON.stringify(value, null, 2)}
      </Paper>
    </Box>
  );
}

const dashboardShellSx = { minHeight: "100vh", p: { xs: 2, sm: 4 } };

const dashboardCardSx = {
  width: "min(1100px, 100%)",
  mx: "auto",
  p: { xs: 3.5, sm: 6 },
  borderColor: "divider",
  borderRadius: 3,
  backgroundColor: "rgba(10, 25, 42, 0.88)",
  boxShadow: "0 28px 80px #02071088",
};

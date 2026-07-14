function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value.replace(/\/$/, "");
}

export const oauthConfig = {
  authorizationServerUrl: required("AUTHORIZATION_SERVER_URL", "http://localhost:9000"),
  authorizationServerInternalUrl: required(
    "AUTHORIZATION_SERVER_INTERNAL_URL",
    process.env.AUTHORIZATION_SERVER_URL ?? "http://localhost:9000",
  ),
  resourceServerUrl: required("RESOURCE_SERVER_URL", "http://localhost:8080"),
  clientId: required("OAUTH_CLIENT_ID", "nextjs-client"),
  redirectUri: required("OAUTH_REDIRECT_URI", "http://localhost:3000/api/auth/callback"),
};

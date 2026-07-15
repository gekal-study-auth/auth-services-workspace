export type Specification = {
  slug: string;
  name: string;
  fullName: string;
  status: string;
  summary: string;
  accent: "lime" | "cyan" | "violet";
  flowSlugs: string[];
  keyPoints: string[];
};

export const specifications: Specification[] = [
  {
    slug: "rfc-6749",
    name: "RFC 6749",
    fullName: "The OAuth 2.0 Authorization Framework",
    status: "Published October 2012",
    summary:
      "OAuth 2.0のロール、エンドポイント、Grant Type、アクセストークンの基本モデルを定義する中核仕様です。",
    accent: "violet",
    flowSlugs: [
      "oauth-2-0",
      "oauth-2-0-client-credentials",
      "oauth-2-0-refresh-token",
      "oauth-2-0-implicit",
      "oauth-2-0-password",
    ],
    keyPoints: [
      "Authorization Code",
      "Client Credentials",
      "Refresh Token",
      "Implicit（Legacy）",
      "Password（Legacy）",
    ],
  },
  {
    slug: "rfc-8628",
    name: "RFC 8628",
    fullName: "OAuth 2.0 Device Authorization Grant",
    status: "Published August 2019",
    summary:
      "テレビ、ゲーム機、CLIなどブラウザや入力能力が限られる端末を、別端末のブラウザで認可する拡張仕様です。",
    accent: "violet",
    flowSlugs: ["oauth-2-0-device-authorization"],
    keyPoints: ["Device Code", "User Code", "Verification URI", "Token Polling"],
  },
  {
    slug: "oauth-2-1",
    name: "OAuth 2.1",
    fullName: "OAuth 2.1 Authorization Framework",
    status: "Modern OAuth consolidation",
    summary:
      "OAuth 2.0のセキュリティBest Current Practiceを統合し、PKCEを前提に安全な利用方法を整理した現代的な仕様です。",
    accent: "lime",
    flowSlugs: [
      "oauth-2-1",
      "oauth-2-0-client-credentials",
      "oauth-2-0-refresh-token",
      "oauth-2-0-device-authorization",
    ],
    keyPoints: [
      "PKCE Required",
      "Exact Redirect URI",
      "No Implicit",
      "No Password Grant",
      "Refresh Rotation",
    ],
  },
  {
    slug: "oidc-core",
    name: "OIDC Core 1.0",
    fullName: "OpenID Connect Core 1.0",
    status: "Identity layer on OAuth 2.0",
    summary:
      "OAuth 2.0の上に認証レイヤーを追加し、ID Token、UserInfo、標準Claimsによる本人確認を定義します。",
    accent: "cyan",
    flowSlugs: ["openid-connect", "oidc-hybrid", "oidc-implicit"],
    keyPoints: ["ID Token", "openid Scope", "Nonce", "UserInfo", "Standard Claims"],
  },
];

export const getSpecification = (slug: string) => specifications.find((item) => item.slug === slug);

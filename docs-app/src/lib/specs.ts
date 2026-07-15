export type Specification = {
  slug: string;
  name: string;
  fullName: string;
  status: string;
  summary: string;
  accent: "lime" | "cyan" | "violet";
  flowSlugs: string[];
  keyPoints: string[];
  sourceUrl?: string;
};

export const specifications: Specification[] = [
  {
    slug: "rfc-6749",
    name: "OAuth 2.0 (RFC 6749)",
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
    name: "OAuth 2.0 Device Authorization (RFC 8628)",
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
    name: "OpenID Connect Core 1.0",
    fullName: "OpenID Connect Core 1.0",
    status: "Identity layer on OAuth 2.0",
    summary:
      "OAuth 2.0の上に認証レイヤーを追加し、ID Token、UserInfo、標準Claimsによる本人確認を定義します。",
    accent: "cyan",
    flowSlugs: ["openid-connect", "oidc-hybrid", "oidc-implicit"],
    keyPoints: ["ID Token", "openid Scope", "Nonce", "UserInfo", "Standard Claims"],
  },
  {
    slug: "webauthn-level-3",
    name: "FIDO2 WebAuthn Level 3",
    fullName: "Web Authentication: Public Key Credentials",
    status: "W3C Web Authentication specification",
    summary:
      "Webアプリケーションが公開鍵Credentialを作成・利用するためのブラウザAPIと、Relying Partyが登録・認証応答を検証する手順を定義します。",
    accent: "lime",
    flowSlugs: ["fido2-registration", "fido2-authentication"],
    keyPoints: [
      "PublicKeyCredential",
      "Registration Ceremony",
      "Authentication Ceremony",
      "RP ID / Origin",
      "Attestation / Assertion",
    ],
    sourceUrl: "https://www.w3.org/TR/webauthn-3/",
  },
  {
    slug: "ctap-2-2",
    name: "FIDO2 CTAP 2.2",
    fullName: "Client to Authenticator Protocol",
    status: "FIDO Alliance Review Draft",
    summary:
      "ブラウザやOSなどのFIDO Clientと、PlatformまたはRoaming Authenticatorの間でCredential作成・署名を行うプロトコルを定義します。",
    accent: "lime",
    flowSlugs: ["fido2-registration", "fido2-authentication"],
    keyPoints: [
      "authenticatorMakeCredential",
      "authenticatorGetAssertion",
      "Platform Authenticator",
      "Roaming Authenticator",
      "PIN / User Verification",
    ],
    sourceUrl:
      "https://fidoalliance.org/specs/fido-v2.2-rd-20241003/fido-client-to-authenticator-protocol-v2.2-rd-20241003.html",
  },
  {
    slug: "fido-uaf-1-1",
    name: "FIDO UAF 1.1",
    fullName: "Universal Authentication Framework",
    status: "FIDO Alliance Proposed Standard",
    summary:
      "端末のAuthenticator能力を共通Policyで選択し、パスワードを置き換える登録・認証メッセージと処理規則を定義する従来FIDO仕様です。",
    accent: "cyan",
    flowSlugs: ["fido-uaf"],
    keyPoints: ["Passwordless", "UAF Client", "Authenticator Policy", "ASM", "Signed Assertion"],
    sourceUrl:
      "https://fidoalliance.org/specs/fido-uaf-v1.1-ps-20170202/fido-uaf-protocol-v1.1-ps-20170202.html",
  },
  {
    slug: "fido-u2f-1-2",
    name: "FIDO U2F 1.2",
    fullName: "Universal Second Factor",
    status: "Legacy FIDO second-factor specification",
    summary:
      "Security Keyの物理操作とRP固有の公開鍵署名を、パスワードに追加する第二要素として利用する従来FIDO仕様です。新規実装ではWebAuthnを使用します。",
    accent: "cyan",
    flowSlugs: ["fido-u2f"],
    keyPoints: [
      "Second Factor",
      "Security Key",
      "User Presence",
      "Key Handle",
      "WebAuthn Migration",
    ],
    sourceUrl: "https://fidoalliance.org/specs/fido-u2f-v1.2-ps-20170411/",
  },
];

export const getSpecification = (slug: string) => specifications.find((item) => item.slug === slug);

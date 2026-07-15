import { additionalProtocols } from "./additional-protocols";

export type FlowActor = { id: string; name: string; detail: string };
export type FlowStep = {
  from: string;
  to: string;
  label: string;
  detail: string;
  security: string;
  message: string;
  requestExample?: string;
  responseExample?: string;
};
export type Protocol = {
  slug: string;
  shortName: string;
  title: string;
  eyebrow: string;
  summary: string;
  accent: "lime" | "cyan" | "violet";
  actors: FlowActor[];
  steps: FlowStep[];
  highlights: { label: string; value: string }[];
  family?: "OAuth 2.0" | "OAuth 2.1" | "OpenID Connect" | "FIDO" | "FIDO2";
  status?: "recommended" | "specialized" | "legacy";
};

const actors: FlowActor[] = [
  { id: "user", name: "User", detail: "Resource Owner" },
  { id: "client", name: "Client", detail: "Web / BFF" },
  { id: "auth", name: "Authorization", detail: "Identity Server" },
  { id: "api", name: "Resource", detail: "Protected API" },
];

const coreProtocols: Protocol[] = [
  {
    slug: "oauth-2-0",
    shortName: "OAuth 2.0",
    title: "OAuth 2.0 Authorization Code Flow",
    eyebrow: "RFC 6749 / Authorization Framework",
    summary:
      "クライアントへパスワードを渡さず、認可コードをアクセストークンへ交換して保護APIへアクセスする基本フローです。",
    accent: "violet",
    actors,
    highlights: [
      { label: "Purpose", value: "Delegated access" },
      { label: "Token", value: "Access token" },
      { label: "Client", value: "Confidential" },
    ],
    steps: [
      {
        from: "user",
        to: "client",
        label: "認可を開始",
        detail: "ユーザーが外部データを必要とする機能を開始します。",
        security: "クライアントへユーザーの資格情報は渡しません。",
        message: "GET /connect",
      },
      {
        from: "client",
        to: "auth",
        label: "認可リクエスト",
        detail: "client_id、redirect_uri、scope、stateを付けて認可エンドポイントへ移動します。",
        security: "stateでリクエストとコールバックを結び、CSRFを検知します。",
        message: "GET /oauth2/authorize?response_type=code&state=...",
      },
      {
        from: "user",
        to: "auth",
        label: "ログインして同意",
        detail:
          "ユーザーがAuthorization Serverの画面でログインし、要求された権限への同意を行います。",
        security: "パスワードはAuthorization Serverだけが扱います。",
        message: "Login → review scopes → consent",
      },
      {
        from: "auth",
        to: "client",
        label: "Clientへ戻る（認可コード）",
        detail:
          "Authorization ServerがcodeとstateをLocationへ入れ、ブラウザをClientのredirect_uriへ戻します。",
        security: "クライアントは受信したstateの一致を検証します。",
        message: "302 /callback?code=...&state=...",
      },
      {
        from: "client",
        to: "auth",
        label: "トークン交換",
        detail: "バックチャネルからコードとクライアント認証情報を送信します。",
        security: "client_secretはブラウザへ公開しません。",
        message: "POST /oauth2/token  grant_type=authorization_code",
      },
      {
        from: "auth",
        to: "client",
        label: "トークン発行",
        detail: "認可されたscopeを持つアクセストークンを発行します。",
        security: "トークンは保存時・転送時とも秘密情報として扱います。",
        message: "200 { access_token, token_type, expires_in }",
      },
      {
        from: "client",
        to: "api",
        label: "保護APIを呼び出す",
        detail: "Bearerトークンを設定してResource Serverを呼び出します。",
        security: "APIは期限とscopeを検証してから応答します。",
        message: "GET /api/profile  Authorization: Bearer ...",
      },
    ],
  },
  {
    slug: "oauth-2-1",
    shortName: "OAuth 2.1",
    title: "OAuth 2.1 Authorization Code + PKCE",
    eyebrow: "Modern OAuth / Security Best Practice",
    summary:
      "Authorization Code FlowへPKCEを必須要件として組み込み、コード横取り攻撃を防ぐ現代的な認可フローです。",
    accent: "lime",
    actors,
    highlights: [
      { label: "Purpose", value: "Secure access" },
      { label: "Proof", value: "PKCE · S256" },
      { label: "Removed", value: "Implicit / Password" },
    ],
    steps: [
      {
        from: "user",
        to: "client",
        label: "ログインを開始",
        detail: "ユーザーがクライアントから認可フローを開始します。",
        security: "BFFはOAuthトランザクションをサーバー側で管理します。",
        message: "GET /api/auth/login",
      },
      {
        from: "client",
        to: "client",
        label: "PKCEを生成",
        detail: "ランダムなcode_verifierを生成し、SHA-256でcode_challengeへ変換します。",
        security: "verifierは推測困難な値とし、ブラウザへ露出させません。",
        message: "BASE64URL(SHA256(code_verifier))",
      },
      {
        from: "client",
        to: "auth",
        label: "S256認可リクエスト",
        detail: "challengeとcode_challenge_method=S256を認可リクエストへ含めます。",
        security: "OAuth 2.1ではPKCEをすべてのAuthorization Codeクライアントに要求します。",
        message: "GET /oauth2/authorize?...&code_challenge=...&code_challenge_method=S256",
      },
      {
        from: "user",
        to: "auth",
        label: "ログインして同意",
        detail: "ユーザーがAuthorization Serverでログインし、要求scopeへの同意を行います。",
        security: "redirect_uriは登録済みURLとの完全一致を要求します。",
        message: "Authenticate → consent",
      },
      {
        from: "auth",
        to: "client",
        label: "Clientへ戻る（認可コード）",
        detail:
          "Authorization Serverがchallengeと関連付けたcodeをLocationへ入れ、ブラウザをClientへ戻します。",
        security: "コードを横取りされてもverifierなしでは交換できません。",
        message: "302 /api/auth/callback?code=...&state=...",
      },
      {
        from: "client",
        to: "auth",
        label: "verifierを提示",
        detail: "コードと元のcode_verifierをトークンエンドポイントへ送信します。",
        security: "再計算したchallengeと保存値の一致を検証します。",
        message: "POST /oauth2/token  code=...&code_verifier=...",
      },
      {
        from: "auth",
        to: "client",
        label: "トークン発行",
        detail: "PKCE検証に成功した正規クライアントへトークンを発行します。",
        security: "トークンはBFFセッションへ保存します。",
        message: "200 { access_token, token_type: Bearer }",
      },
      {
        from: "client",
        to: "api",
        label: "JWTでAPIアクセス",
        detail: "BFFがアクセストークンを添えて保護APIを呼び出します。",
        security: "APIは署名、issuer、期限、audience、scopeを検証します。",
        message: "GET /api/user  Authorization: Bearer eyJ...",
      },
    ],
  },
  {
    slug: "openid-connect",
    shortName: "OpenID Connect",
    title: "OpenID Connect Authorization Code Flow",
    eyebrow: "OIDC Core 1.0 / Identity Layer",
    summary:
      "OAuth 2.0へ本人確認を追加し、署名付きIDトークンからユーザーの認証結果を安全に受け取ります。",
    accent: "cyan",
    actors,
    highlights: [
      { label: "Purpose", value: "Authentication" },
      { label: "Identity", value: "ID token · JWT" },
      { label: "Required", value: "openid scope" },
    ],
    steps: [
      {
        from: "user",
        to: "client",
        label: "サインインを開始",
        detail: "ユーザーがログインボタンからOIDC認証を開始します。",
        security: "state、nonce、PKCEを生成してセッションへ保存します。",
        message: "GET /api/auth/login",
      },
      {
        from: "client",
        to: "auth",
        label: "OpenID認証リクエスト",
        detail: "scopeにopenidを含め、nonceとPKCE challengeを付けます。",
        security: "openid scopeがOIDCリクエストであることを示します。",
        message: "GET /oauth2/authorize?scope=openid+profile&nonce=...",
      },
      {
        from: "user",
        to: "auth",
        label: "本人認証して同意",
        detail: "ユーザーがOpenID Providerで本人認証し、Clientへ渡すclaimsへの同意を行います。",
        security: "認証方式やMFAをProvider側で一元管理できます。",
        message: "Authenticate → consent to profile claims",
      },
      {
        from: "auth",
        to: "client",
        label: "Clientへ戻る（認可コード）",
        detail:
          "OpenID ProviderがcodeとstateをLocationへ入れ、ブラウザをClientのcallbackへ戻します。",
        security: "stateの一致確認で要求していないコールバックを拒否します。",
        message: "302 /api/auth/callback?code=...&state=...",
      },
      {
        from: "client",
        to: "auth",
        label: "コードを交換",
        detail: "バックチャネルでコードとcode_verifierを提示します。",
        security: "TLSとPKCEでコード交換経路を保護します。",
        message: "POST /oauth2/token  code=...&code_verifier=...",
      },
      {
        from: "auth",
        to: "client",
        label: "IDトークンを発行",
        detail: "アクセストークンに加え、認証結果を表す署名付きIDトークンを返します。",
        security: "IDトークンはAPI認可用ではありません。",
        message: "200 { access_token, id_token: eyJ... }",
      },
      {
        from: "client",
        to: "client",
        label: "IDトークンを検証",
        detail: "JWKSで署名を検証し、iss、aud、exp、nonceを確認します。",
        security: "nonceの一致でIDトークンのリプレイを検知します。",
        message: "verify(signature, iss, aud, exp, nonce) → sub",
      },
      {
        from: "client",
        to: "api",
        label: "UserInfoを取得",
        detail: "必要に応じてアクセストークンで追加claimsを取得します。",
        security: "UserInfoとIDトークンのsubが一致することを確認します。",
        message: "GET /userinfo  Authorization: Bearer ...",
      },
    ],
  },
];

export const protocols: Protocol[] = [...coreProtocols, ...additionalProtocols];
export const getProtocol = (slug: string) => protocols.find((item) => item.slug === slug);

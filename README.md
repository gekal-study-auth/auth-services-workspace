# Auth Services Workspace

OAuth 2.1 / OpenID Connect のAuthorization Code Flowを、3つの独立したコンポーネントで検証する学習用モノレポです。クライアントはPKCE（S256）を使用し、リソースサーバーは認可サーバーのJWKSを通じてJWT署名を検証します。

## 構成

```text
auth-services-workspace/
├── authorization-server/  Spring Authorization Server（:9000）
├── resource-server/       OAuth2 Resource Server（:8080）
└── client-app/            Next.js App Router / BFF（:3000）
```

フローは次のとおりです。

1. BFFが`code_verifier`、S256の`code_challenge`、`state`、`nonce`を生成します。
2. 認可サーバーがユーザーを認証し、同意後に認可コードを返します。
3. BFFが認可コードと`code_verifier`をトークンへ交換します。
4. トークンは暗号化されたHttpOnly / SameSite Cookieに格納され、ブラウザーのJavaScriptには公開されません。
5. BFFがアクセストークンを付けて保護APIを呼び、リソースサーバーがJWT署名・issuer・有効期限・`profile`スコープを検証します。

> この構成は学習・ローカル検証用です。ユーザー、クライアント、同意情報、認可情報、RSA鍵はインメモリです。認可サーバーの再起動時には鍵が変わるため、発行済みトークンは無効になります。

## 必要環境

- Java 17以上
- Node.js 20.9以上
- npm

Gradle本体の事前インストールは不要です。リポジトリ同梱のGradle Wrapperを使用します。

## セットアップ

```bash
cp client-app/.env.example client-app/.env.local
```

`.env.local`の`SESSION_SECRET`を32文字以上のランダム値に変更してください。たとえば次のコマンドで生成できます。

```bash
openssl rand -base64 32
```

依存関係をインストールします。

```bash
cd client-app
npm install
```

## 起動

3つのターミナルで順に起動します。

```bash
./gradlew :authorization-server:bootRun
```

```bash
./gradlew :resource-server:bootRun
```

```bash
cd client-app
npm run dev
```

[http://localhost:3000](http://localhost:3000)を開き、次の検証用ユーザーでログインします。

- ユーザー名: `user`
- パスワード: `password`

認可画面で`openid`と`profile`を許可すると、ダッシュボードにIDトークンのクレームと保護APIの応答が表示されます。

## エンドポイント

| コンポーネント | エンドポイント | 用途 |
| --- | --- | --- |
| Authorization Server | `/.well-known/openid-configuration` | OIDC Discovery |
| Authorization Server | `/oauth2/authorize` | 認可 |
| Authorization Server | `/oauth2/token` | トークン発行 |
| Authorization Server | `/oauth2/jwks` | 公開鍵（JWKS） |
| Resource Server | `/api/user` | `profile`スコープ必須のAPI |
| Client Application | `/api/auth/login` | PKCE認可フロー開始 |
| Client Application | `/api/auth/callback` | state/nonce検査・コード交換 |
| Client Application | `/dashboard` | BFF経由で保護APIを表示 |

## 検証

```bash
./gradlew test
cd client-app && npm run typecheck && npm run build
```

## 実装上の注意

- `code_verifier`とトークンはブラウザーから読めない暗号化HttpOnly Cookieで管理します。
- Cookie暗号化にはAES-256-GCMを使用し、`SESSION_SECRET`から鍵を導出します。
- `state`はログインCSRF対策、`nonce`はIDトークンのリプレイ対策としてコールバックで照合します。
- 本番ではHTTPS、永続的な署名鍵、安全な秘密管理、永続セッションストア、鍵ローテーション、audience検証などを追加してください。

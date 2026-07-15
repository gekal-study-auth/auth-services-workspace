# Auth Services Workspace

OAuth 2.1 / OpenID Connect のAuthorization Code Flowを、3つの独立したコンポーネントで検証する学習用モノレポです。クライアントはPKCE（S256）を使用し、リソースサーバーは認可サーバーのJWKSを通じてJWT署名を検証します。

## 構成

```text
auth-services-workspace/
├── authorization-server/  Spring Authorization Server（:9000）
├── resource-server/       OAuth2 Resource Server（:8080）
├── client-app/            Next.js App Router / BFF（:3000）
└── docker-compose.yml     PostgreSQL（:5432）
```

フローは次のとおりです。

1. BFFが`code_verifier`、S256の`code_challenge`、`state`、`nonce`を生成します。
2. 認可サーバーがユーザーを認証し、同意後に認可コードを返します。
3. BFFが認可コードと`code_verifier`をトークンへ交換します。
4. トークンは暗号化されたHttpOnly / SameSite Cookieに格納され、ブラウザーのJavaScriptには公開されません。
5. BFFがアクセストークンを付けて保護APIを呼び、リソースサーバーがJWT署名・issuer・有効期限・`profile`スコープを検証します。

ユーザー、クライアント、同意情報、認可情報、認可コード、アクセストークン、IDトークンはPostgreSQLへ永続化されます。RSA署名鍵は学習用として起動時生成のままなので、認可サーバーの再起動後はDBに残っている発行済みJWTも署名検証に失敗します。

## 必要環境

- Java 17以上
- Node.js 20.9以上
- npm
- Docker / Docker Compose

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

最初にPostgreSQLを起動します。

```bash
docker compose up -d postgres
docker compose ps
```

続いて3つのターミナルで各アプリケーションを起動します。

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

[https://client-app.local.gekal.cn](https://client-app.local.gekal.cn)を開き、次の検証用ユーザーでログインします。`gekal/nginx-local-domains:latest-gekal`に同梱されたローカル開発用証明書を使用し、次のHTTPSドメインを提供します。

- `https://authorization-server.local.gekal.cn`
- `https://resource-server.local.gekal.cn`
- `https://client-app.local.gekal.cn`

- ユーザー名: `user`
- パスワード: `password`

認可画面で`openid`と`profile`を許可すると、ダッシュボードにIDトークンのクレームと保護APIの応答が表示されます。

### PostgreSQL

ローカル用の接続情報は次のとおりです。

| 項目 | 値 |
| --- | --- |
| Database | `auth_services` |
| User | `auth_user` |
| Password | `auth_password` |
| JDBC URL | `jdbc:postgresql://localhost:5432/auth_services` |

認可サーバーでは`AUTH_DB_URL`、`AUTH_DB_USERNAME`、`AUTH_DB_PASSWORD`で上書きできます。Flywayが起動時にテーブル作成と検証ユーザー投入を行います。

保存内容は次のコマンドで確認できます。

```bash
docker compose exec postgres psql -U auth_user -d auth_services \
  -c "select id, principal_name, access_token_expires_at from oauth2_authorization;"
```

DBを停止する場合は`docker compose down`を使用します。データボリュームも削除して初期化する場合のみ`docker compose down -v`を使用してください。

### 全サービスをDockerで起動

PostgreSQLを含む全サービスは、ルートからまとめてビルド・起動できます。

```bash
docker compose up -d --build
docker compose ps
```

公開ポートが他のプロセスと競合する場合は、起動時に上書きできます。

```bash
RESOURCE_SERVER_PORT=8081 docker compose up -d
```

上書き可能な変数は`POSTGRES_PORT`、`AUTHORIZATION_SERVER_PORT`、`RESOURCE_SERVER_PORT`、`CLIENT_APP_PORT`です。OAuthのredirect URIが登録済みのため、通常はAuthorization ServerとClient Appのポートをそれぞれ`9000`、`3000`のまま使用してください。

コンテナイメージは次の方針で構成しています。

- PostgreSQLは`18.4-bookworm`をベースに、OSパッケージをビルド時に更新します。
- Spring BootサービスはTemurin 17 / Ubuntu 24.04 LTS（Noble）を使用し、layered JARとして依存関係とアプリケーションを分離します。
- JavaランタイムのOSパッケージはビルド時に更新し、非rootユーザーで実行します。
- Client AppはNode.js `24.12.0-bookworm-slim`でビルドし、Next.js standalone成果物のみを実行イメージへ格納します。
- BuildKitのGradle・npmキャッシュを使用し、再ビルド時の依存取得を抑えます。

PostgreSQL 17で使用していた`auth-postgres-data`ボリュームは自動削除せず保持されます。PostgreSQL 18は`auth-postgres18-data`を使用します。旧DBのデータが必要な場合は、旧コンテナからdumpして新DBへrestoreしてください。

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

## フォーマット

ルートからJavaとClientのソースをまとめて整形・検査できます。

```bash
./gradlew formatAll
./gradlew formatCheck
```

Gradle側は専用のNode.js/npmを自動取得するため、システムの`PATH`にnpmがなくても実行できます。Client依存関係はセットアップ手順の`npm install`で事前に導入してください。

個別に実行する場合は、Java側で`./gradlew spotlessApply`または`spotlessCheck`、Client側で`npm run format`または`format:check`を使用します。

## 実装上の注意

- `code_verifier`とトークンはブラウザーから読めない暗号化HttpOnly Cookieで管理します。
- Cookie暗号化にはAES-256-GCMを使用し、`SESSION_SECRET`から鍵を導出します。
- パスワードはbcryptハッシュとして保存し、平文パスワードはDBへ格納しません。
- JWT、認可コード、トークンメタデータはSpring Authorization ServerのJDBCサービスにより保存されます。
- `state`はログインCSRF対策、`nonce`はIDトークンのリプレイ対策としてコールバックで照合します。
- 本番ではHTTPS、永続的な署名鍵、安全な秘密管理、永続セッションストア、鍵ローテーション、audience検証などを追加してください。

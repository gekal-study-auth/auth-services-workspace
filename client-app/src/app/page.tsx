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
    <main className="shell">
      <section className="card">
        <p className="eyebrow">OAuth 2.1 / OpenID Connect</p>
        <h1>認可フローをコードから理解する。</h1>
        <p>Authorization Code Flow + PKCEでログインし、JWTで保護されたAPIを呼び出します。</p>
        {errorMessage && (
          <p className="error" role="alert">
            {errorMessage}
          </p>
        )}
        <a className="button" href="/api/auth/login">
          {errorMessage ? "ログインを再試行" : "ログインを開始"}
        </a>
        <p className="hint">検証用ユーザー: user / password</p>
      </section>
    </main>
  );
}

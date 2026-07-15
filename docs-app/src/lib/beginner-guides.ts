import type { FlowActor, Protocol } from "./protocols";

export type BeginnerGuide = {
  goal: string;
  overview: string;
  result: string;
  metaphor: string;
};

export function getBeginnerGuide(protocol: Protocol): BeginnerGuide {
  if (protocol.family === "FIDO2") {
    const registration = protocol.slug.includes("registration");
    return registration
      ? {
          goal: "この端末を、次回から安全にログインできる端末として登録します。",
          overview:
            "端末のAuthenticatorが、このWebサイト専用の鍵を2本作ります。秘密鍵は端末の中に残し、公開鍵だけをWebサイトへ預けます。パスワードのように、同じ秘密をお互いに保存することはありません。",
          result:
            "Relying Partyには公開鍵とCredential IDが保存されます。次回は端末内の秘密鍵で署名することで、本人の端末であることを証明できます。",
          metaphor:
            "たとえるなら、端末の中で専用の印鑑を作り、Webサイトには印影の見本だけを登録する作業です。印鑑そのものは外へ出ません。",
        }
      : {
          goal: "パスワードを送らずに、登録済みの端末を持つ本人だと証明します。",
          overview:
            "Webサイトが一度だけ使える問題（challenge）を出し、Authenticatorが端末内の秘密鍵で答えに署名します。Webサイトは登録済みの公開鍵で署名を確認します。",
          result:
            "署名、Webサイトの識別情報、challengeがすべて正しければ、ログイン済みセッションが発行されます。",
          metaphor:
            "毎回違う書類へその場で印鑑を押し、Webサイトが登録済みの印影と照合するイメージです。過去の答えをコピーしても使えません。",
        };
  }
  if (protocol.family === "FIDO") {
    return {
      goal:
        protocol.slug === "fido-u2f"
          ? "パスワードにSecurity Keyの確認を加え、ログインを二重に守ります。"
          : "端末の生体認証やPINを使い、パスワードに頼らず本人確認します。",
      overview:
        "サーバーが一度だけ使えるchallengeを送り、端末のAuthenticatorがユーザー操作を確認して署名します。秘密鍵や生体情報は端末の外へ送られません。",
      result: "サーバーが公開鍵で署名を確認できたときだけ、登録またはログインを完了します。",
      metaphor:
        "本人しか操作できない鍵で、サーバーから届いた一回限りの確認書へサインするイメージです。",
    };
  }
  if (protocol.slug === "openid-connect" || protocol.slug.startsWith("oidc-")) {
    return {
      goal: "安全にログインし、ログインした人が誰なのかをクライアントへ伝えます。",
      overview:
        "OpenID ConnectはOAuthの流れを利用して本人確認を行います。Authorization Serverがログインを担当し、結果を署名付きIDトークンとしてクライアントへ渡します。クライアントがパスワードを見ることはありません。",
      result:
        "クライアントはIDトークンを検証し、ユーザーを識別してログイン済みセッションを作れます。",
      metaphor:
        "信頼できる受付で本人確認をしてもらい、改ざんできない入館証を受け取るイメージです。",
    };
  }
  if (protocol.slug.includes("client-credentials")) {
    return {
      goal: "人の代わりではなく、システム自身の権限で別のAPIを利用します。",
      overview:
        "バッチやバックエンドサービスが自分のclient_idと認証情報を提示し、自分に許可された範囲のアクセストークンを受け取ります。ユーザーのログイン画面は登場しません。",
      result:
        "システムは短時間有効なアクセストークンを使い、許可されたサービス間APIだけを呼び出せます。",
      metaphor: "社員の代理ではなく、業務用ロボット専用の入館証を発行するイメージです。",
    };
  }
  if (protocol.slug.includes("device-authorization")) {
    return {
      goal: "文字入力が難しいテレビやCLIを、スマートフォンなど別の端末から認可します。",
      overview:
        "テレビ側に短いコードとURLを表示し、ユーザーは操作しやすい端末でログインして承認します。テレビは承認が終わったかを一定間隔で確認します。",
      result: "承認された端末だけがアクセストークンを受け取り、APIを利用できるようになります。",
      metaphor:
        "テレビに表示された引換番号をスマートフォンの受付へ見せて、テレビ用の利用許可を受け取るイメージです。",
    };
  }
  if (protocol.slug.includes("refresh-token")) {
    return {
      goal: "短時間で期限切れになるアクセストークンを、安全に更新します。",
      overview:
        "API用のアクセストークンが期限切れになったら、外部へ出さず保管していたrefresh tokenをToken Endpointへ送り、新しいトークンへ交換します。",
      result: "ユーザーに毎回ログインを求めず、権限やセッションが有効な間だけ利用を継続できます。",
      metaphor: "期限の短い入館証を、厳重に保管した更新券で新しい入館証へ交換するイメージです。",
    };
  }
  if (protocol.slug === "oauth-2-0-implicit") {
    return {
      goal: "以前のブラウザアプリが、コード交換をせずアクセストークンを受け取る仕組みを理解します。",
      overview:
        "Authorization ServerがアクセストークンをURL経由でブラウザへ直接返します。実装は単純ですがトークンがブラウザに露出するため、現在の新規アプリでは利用しません。",
      result:
        "歴史的な動作とリスクを理解し、Authorization Code + PKCEへ移行すべき理由が分かります。",
      metaphor:
        "受付から入館証を封筒に入れず、人が多い通路で直接手渡すようなものです。現在は安全な受け渡し場所で交換する方式を使います。",
    };
  }
  if (protocol.slug === "oauth-2-0-password") {
    return {
      goal: "アプリがパスワードを直接預かる旧方式の問題点を理解します。",
      overview:
        "ユーザーがAuthorization Serverではなくクライアントへパスワードを入力し、クライアントがそのままToken Endpointへ転送します。信頼境界が広がるためOAuth 2.1では削除されています。",
      result:
        "既存実装をAuthorization Code + PKCEへ移行し、クライアントがパスワードを扱わない構成を選べます。",
      metaphor:
        "代理人へ金庫の暗証番号そのものを教えるような方式です。現在は暗証番号を教えず、必要な権限だけを示す許可証を使います。",
    };
  }
  return {
    goal: "アプリへパスワードを渡さず、許可された範囲だけAPIを利用できるようにします。",
    overview:
      "ユーザーはAuthorization Serverでログインし、クライアントへ渡してよい権限を選びます。クライアントは短時間有効な認可コードを受け取り、安全なバックチャネルでアクセストークンへ交換します。",
    result: "クライアントはアクセストークンを使い、ユーザーが同意した範囲のAPIだけを呼び出せます。",
    metaphor:
      "ホテルの受付で本人確認を行い、部屋の鍵ではなく、許可された施設だけに入れる一時的なカードを受け取るイメージです。",
  };
}

export function actorExplanation(actor: FlowActor) {
  const descriptions: Record<string, string> = {
    User: "サービスを利用する人です。ログインや同意、端末の操作を行います。",
    Operator: "処理を開始する人や運用システムです。フローによっては途中から登場しません。",
    Client: "ユーザーに代わって認可を依頼し、許可されたAPIを呼び出すアプリです。",
    Browser: "WebサイトとAuthenticatorの間を安全につなぎ、WebAuthn APIを実行します。",
    Authorization: "ログイン、同意、コードやトークンの発行を担当する信頼できるサーバーです。",
    Authenticator: "秘密鍵を安全に保管し、生体認証やPINの確認と署名を行う端末機能です。",
    Resource: "アクセストークンを確認して、許可されたデータや機能を提供するAPIです。",
    "Relying Party": "ユーザーをログインさせるWebサービスです。公開鍵を保存し、署名を検証します。",
  };
  return descriptions[actor.name] ?? `${actor.detail}として、このフローに参加します。`;
}

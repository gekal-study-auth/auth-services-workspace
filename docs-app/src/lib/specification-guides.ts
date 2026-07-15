export type SpecificationGuide = {
  introduction: string[];
  purpose: { title: string; text: string }[];
  security: string[];
  relationship: string;
  audience: string;
};

const guides: Record<string, SpecificationGuide> = {
  "rfc-6749": {
    introduction: [
      "OAuth 2.0は、あるサービスが持つデータや機能を、ユーザーのパスワードを別のアプリへ教えずに利用させるための認可フレームワークです。たとえば写真サービスが持つ写真へ、印刷アプリからアクセスを許可する場面で使われます。",
      "RFC 6749は、Resource Owner、Client、Authorization Server、Resource Serverという4つの役割を分け、Clientがアクセストークンを受け取るまでの基本ルールを定義しました。重要なのは、OAuthが本人確認そのものではなく『どのClientへ、何を、どこまで許可するか』を扱う点です。",
    ],
    purpose: [
      {
        title: "パスワードを共有しない",
        text: "ユーザーはAuthorization Serverだけでログインします。Clientはパスワードではなく、限定されたアクセストークンを受け取ります。",
      },
      {
        title: "権限を小さく分ける",
        text: "scopeを使い、プロフィールの参照やデータの更新など、Clientへ許可する操作を必要な範囲に限定します。",
      },
      {
        title: "役割と通信を分離する",
        text: "ログイン、トークン発行、API提供を別の役割として整理し、それぞれが何を信頼し検証するかを明確にします。",
      },
    ],
    security: [
      "redirect_uriは事前登録した完全一致URLだけを許可します。",
      "stateで認可リクエストとコールバックを関連付け、CSRFを防ぎます。",
      "アクセストークンは短時間有効にし、TLSで送信します。",
      "Implicit GrantとPassword Grantは現在の新規実装では利用せず、Authorization Code + PKCEを選びます。",
    ],
    relationship:
      "RFC 6749がOAuth 2.0の土台です。その後、PKCE、Device Authorization、Token Revocationなどが個別RFCとして追加され、現在の安全な利用方法はOAuth 2.0 Security Best Current PracticeやOAuth 2.1へ整理されています。",
    audience: "OAuthの登場人物、Grant Type、アクセストークン、scopeの基本を理解したい人向けです。",
  },
  "rfc-8628": {
    introduction: [
      "Device Authorization Grantは、テレビ、ゲーム機、プリンター、CLIのように、文字入力やブラウザ操作が難しい端末を認可するためのOAuth 2.0拡張です。認可を必要とする端末と、ユーザーがログインする端末を分けます。",
      "対象端末は短いuser_codeとverification_uriを表示します。ユーザーはスマートフォンなど操作しやすい端末でコードを入力して承認し、対象端末は承認結果をToken Endpointへ問い合わせます。対象端末へパスワードを入力する必要はありません。",
    ],
    purpose: [
      {
        title: "入力制約を回避する",
        text: "リモコンやCLIで長いパスワードを入力せず、普段利用するスマートフォンの安全なブラウザでログインできます。",
      },
      {
        title: "端末を明確に承認する",
        text: "user_codeによって、スマートフォン上の承認操作と、認可を待っている対象端末を結び付けます。",
      },
      {
        title: "非同期に結果を待つ",
        text: "対象端末はdevice_codeを使って結果をpollし、承認が終わるまでauthorization_pendingを処理します。",
      },
    ],
    security: [
      "user_codeとdevice_codeは別の値として扱い、device_codeを画面へ表示しません。",
      "expires_inを過ぎた要求を拒否し、device_codeは一度だけ使用可能にします。",
      "intervalを守り、slow_downを受け取った場合は問い合わせ間隔を延ばします。",
      "承認画面に対象端末、Client名、要求scopeを表示し、ユーザーが意図した要求か確認できるようにします。",
    ],
    relationship:
      "RFC 8628はRFC 6749の拡張Grantです。OpenID Connectのopenid scopeと組み合わせれば認証にも利用できますが、CIBAとは開始方法が異なります。Device Flowは端末にコードを表示し、CIBAはClientがユーザー識別子を使って別端末へ認証要求を開始します。",
    audience:
      "テレビアプリ、CLI、IoTなど、通常のブラウザリダイレクトを利用しにくいClientを設計する人向けです。",
  },
  "oauth-2-1": {
    introduction: [
      "OAuth 2.1は、OAuth 2.0公開後に蓄積されたセキュリティ上の知見を、実装者が迷いにくい形へ整理する取り組みです。OAuth 2.0をまったく別の仕組みに置き換えるのではなく、安全な選択肢を標準の使い方としてまとめます。",
      "中心となるのはAuthorization Code FlowとPKCEです。認可コードを横取りされてもcode_verifierを持たない攻撃者はトークンへ交換できません。一方、トークンをブラウザへ直接返すImplicit Grantや、Clientがパスワードを預かるPassword Grantは除外されます。",
    ],
    purpose: [
      {
        title: "PKCEを標準にする",
        text: "公開Client・機密Clientを問わずAuthorization Code FlowへPKCEを組み込み、認可コードの横取りに備えます。",
      },
      {
        title: "危険な選択肢を減らす",
        text: "Implicit GrantとPassword Grantを外し、実装者が古い方式を誤って選びにくくします。",
      },
      {
        title: "現在の実装慣行を統合する",
        text: "完全一致redirect URI、Bearer Tokenの安全な扱い、refresh token保護など、現代の実装で必要な要件をまとめます。",
      },
    ],
    security: [
      "code_verifierは暗号学的乱数から生成し、S256 code_challengeを使用します。",
      "stateまたは同等の仕組みでClientが開始した処理とコールバックを関連付けます。",
      "redirect_uriは文字列の完全一致で検証し、ワイルドカードを使いません。",
      "refresh tokenはrotationまたはsender-constrained tokenで再利用リスクを抑えます。",
    ],
    relationship:
      "OAuth 2.1はRFC 6749、PKCE、Bearer Tokenの利用方法、OAuth Security BCPなどを前提にしています。OpenID Connectはこの認可フローの上へ本人確認を追加する別仕様であり、OAuth 2.1だけではユーザーが誰かをClientへ伝えません。",
    audience:
      "新しくOAuth ClientやAuthorization Serverを実装し、現在推奨される認可フローを選びたい人向けです。",
  },
  "oidc-core": {
    introduction: [
      "OpenID ConnectはOAuth 2.0の上に本人確認の仕組みを追加する認証仕様です。OAuthのアクセストークンはAPIを利用するための許可証ですが、それだけでは『ログインした人が誰か』をClientが安全に判断できません。",
      "OIDCでは認可リクエストへopenid scopeを追加し、認証結果を署名付きJWTであるID Tokenとして受け取ります。Clientは署名だけでなく、issuer、audience、有効期限、nonceを検証し、自分のために発行された新しい認証結果であることを確認します。",
    ],
    purpose: [
      {
        title: "認証結果を標準化する",
        text: "ID Tokenのclaimsによって、誰が、どのProviderで、いつ認証されたかをClientへ伝えます。",
      },
      {
        title: "複数サービスでログインを共有する",
        text: "Clientごとにパスワードを管理せず、信頼するOpenID Providerへ本人確認を集約できます。",
      },
      {
        title: "プロフィール取得を共通化する",
        text: "UserInfo Endpointと標準claimsにより、sub、name、emailなどの受け渡し方法を統一します。",
      },
    ],
    security: [
      "ID Tokenはアクセストークンの代わりにAPIへ送らず、Clientが認証結果を確認するために使います。",
      "JWKSで署名を検証し、iss、aud、exp、iat、nonceを用途に応じて確認します。",
      "subをユーザーの安定した識別子として使い、表示名やemailだけでアカウントを結び付けません。",
      "UserInfoを利用する場合、応答のsubがID Tokenのsubと一致することを確認します。",
    ],
    relationship:
      "OIDC CoreはOAuth 2.0 Authorization Code Flowを利用します。DiscoveryはProviderのEndpointや機能を公開し、Dynamic RegistrationはClient登録を標準化します。CIBAはブラウザリダイレクトを使わないOIDCの追加認証フローです。",
    audience:
      "ログイン、SSO、ID Token、UserInfoを正しく実装し、OAuthの認可との違いを理解したい人向けです。",
  },
  "webauthn-level-3": {
    introduction: [
      "WebAuthnは、Webサイトが公開鍵Credentialを使ってユーザーを強く認証するためのブラウザAPIです。パスキー、端末の生体認証、PIN、Security Keyなどの違いを、Relying Partyが共通のAPIで扱えるようにします。",
      "登録時にAuthenticatorがサイト専用の鍵ペアを作り、公開鍵だけをRelying Partyへ登録します。認証時にはサーバーのchallengeへ秘密鍵で署名します。秘密鍵、生体情報、PINはWebサイトへ送られません。",
    ],
    purpose: [
      {
        title: "共有秘密をなくす",
        text: "サーバーは公開鍵を保存するため、データベースが漏えいしてもパスワードのようなログイン可能な秘密が直接流出しません。",
      },
      {
        title: "フィッシングへ強くする",
        text: "CredentialはRP IDとoriginへ結び付くため、偽サイトから本物のサイト用Credentialを利用できません。",
      },
      {
        title: "Authenticatorを共通化する",
        text: "Platform Authenticatorと外付けSecurity Keyをnavigator.credentials.create/getという共通APIで扱います。",
      },
    ],
    security: [
      "challengeはランダムかつ一度限りにし、セッションと関連付けます。",
      "clientDataJSONのtype、challenge、originとauthenticatorDataのRP ID hash、flagsを検証します。",
      "登録時は許可algorithm、attestation方針、userVerification要件を明確にします。",
      "アカウント復旧と複数Credential登録を設計し、端末紛失時に安全に失効できるようにします。",
    ],
    relationship:
      "WebAuthnはRelying Partyとブラウザ間のWeb API・検証手順を定義し、CTAPはブラウザやOSとAuthenticator間の通信を定義します。この2つを組み合わせた認証エコシステムがFIDO2です。",
    audience:
      "パスキーやSecurity KeyをWebアプリへ導入し、登録・認証Ceremonyの検証項目を理解したい人向けです。",
  },
  "ctap-2-2": {
    introduction: [
      "CTAPは、ブラウザやOSなどのFIDO ClientとAuthenticatorの間で、Credential作成や署名を依頼するためのプロトコルです。Web開発者がCTAPを直接呼ぶことは通常ありませんが、WebAuthnの裏側で何が起きるかを理解するために重要です。",
      "Authenticatorには端末内蔵のPlatform Authenticatorと、USB・NFC・BLEなどで接続するRoaming Authenticatorがあります。CTAP2は両者へ共通のコマンド、User Presence、User Verification、PIN/UV認証などを定義します。",
    ],
    purpose: [
      {
        title: "ClientとAuthenticatorを分離する",
        text: "ブラウザやOSが、メーカーの異なるAuthenticatorを共通プロトコルで利用できます。",
      },
      {
        title: "ローカル本人確認を守る",
        text: "PINや生体認証の結果だけを利用し、認証要素そのものをRelying Partyへ公開しません。",
      },
      {
        title: "Credential操作を標準化する",
        text: "makeCredential、getAssertion、Credential管理などのAuthenticator操作を共通化します。",
      },
    ],
    security: [
      "PIN/UV protocolでClientとAuthenticator間の機密性・完全性を保護します。",
      "User PresenceとUser Verificationを混同せず、Relying Partyの要求に合ったflagsを確認します。",
      "Authenticatorのtransportと物理的な利用環境を考慮します。",
      "拡張機能はAuthenticatorとClient双方の対応状況を確認し、未認識データを安全に扱います。",
    ],
    relationship:
      "CTAP2はFIDO2のAuthenticator側プロトコルで、WebAuthnはWebアプリ側インターフェースです。従来のU2F互換を扱うCTAP1もありますが、新しいパスキー機能はCTAP2系の機能を利用します。",
    audience:
      "Authenticator、ブラウザ、OSの境界や、パスキーが端末内部でどのように処理されるかを理解したい人向けです。",
  },
  "fido-uaf-1-1": {
    introduction: [
      "FIDO UAFは、端末に備わる生体認証やPINなどを利用し、パスワードを置き換えることを目的としたFIDOの認証アーキテクチャです。Relying PartyはAuthenticatorの種類を直接実装せず、Policyとして必要な能力を指定します。",
      "UAF ClientはPolicyに合うAuthenticatorを選び、ASMを介して登録や署名を実行します。サーバーには公開鍵が登録され、認証時にはchallengeに対する署名を検証します。ローカルの生体情報はサーバーへ送られません。",
    ],
    purpose: [
      {
        title: "パスワードレス認証",
        text: "端末内のAuthenticatorと公開鍵署名によって、共有パスワードに依存しない認証を実現します。",
      },
      {
        title: "AuthenticatorをPolicyで選ぶ",
        text: "生体認証やハードウェア保護など、Relying Partyが必要とする能力をPolicyとして表現します。",
      },
      {
        title: "端末機能を抽象化する",
        text: "UAF ClientとASMが、Authenticator固有の実装差をアプリケーションから隠します。",
      },
    ],
    security: [
      "UAF ProtocolメッセージはTLSで送信します。",
      "AppIDとFacet IDの関係を検証し、別アプリからCredentialを利用されないようにします。",
      "Authenticator MetadataとPolicyを検証して許可したAuthenticatorだけを登録します。",
      "署名counterを確認し、Authenticator複製の兆候を検知します。",
    ],
    relationship:
      "UAFは従来FIDOのパスワードレス仕様です。Webの新規実装では、ブラウザ標準APIとして普及しているWebAuthn/FIDO2を検討します。UAFの公開鍵認証という基本思想はFIDO2にも引き継がれています。",
    audience:
      "既存UAFシステムを理解・保守する人や、FIDO2へ移行する際にアーキテクチャの違いを整理したい人向けです。",
  },
  "fido-u2f-1-2": {
    introduction: [
      "FIDO U2Fは、パスワードに加えてSecurity Keyの物理操作を要求する第二要素認証の仕様です。ユーザーが鍵へタッチすると、Security Keyがサイト固有の秘密鍵でchallengeへ署名します。",
      "OTPとは異なり、署名はAppIDとWeb originへ結び付くため、偽サイトへ入力可能な共通コードを生成しません。この性質がフィッシング耐性を高めます。一方、U2Fは基本的に第一要素のパスワードを置き換える仕様ではありません。",
    ],
    purpose: [
      {
        title: "第二要素を強くする",
        text: "パスワードが漏れても、登録済みSecurity Keyの物理操作と署名がなければログインできません。",
      },
      {
        title: "フィッシングを防ぐ",
        text: "サイト固有鍵とAppID/origin検証により、偽サイトで生成した要求へ本物サイト用の署名を行いません。",
      },
      {
        title: "サービス間の追跡を防ぐ",
        text: "AuthenticatorはRelying Partyごとに異なる鍵ペアとKey Handleを利用します。",
      },
    ],
    security: [
      "challengeを一度限りにし、ログインセッションへ関連付けます。",
      "ClientがAppIDとoriginの関係を確認し、サーバーが署名とUser Presenceを検証します。",
      "counterの後退をAuthenticator複製のリスクとして扱います。",
      "新規Web実装ではU2F JavaScript APIではなくWebAuthnを使用します。",
    ],
    relationship:
      "U2FはFIDOの第二要素仕様で、後継のWebAuthnではU2F Security Keyも利用できます。WebAuthnはUser VerificationやDiscoverable Credentialを扱え、パスキーによる第一要素・多要素認証へ範囲を広げています。",
    audience: "既存のSecurity Key第二要素認証を理解し、WebAuthnへ移行したい人向けです。",
  },
  "openid-ciba-core-1-0": {
    introduction: [
      "CIBAは、ClientがユーザーのブラウザをAuthorization Serverへリダイレクトせず、バックチャネルから認証を開始するOpenID Connectフローです。ユーザーが操作中のConsumption Deviceと、本人確認するAuthentication Deviceを分離できます。",
      "たとえば店舗端末で支払いを始め、手元の銀行アプリで内容を確認して承認する場面に向いています。店舗端末へ銀行のパスワードを入力する必要はありません。OpenID Providerは認証要求をauth_req_idで識別し、Poll、Ping、Pushのいずれかで結果をClientへ届けます。",
    ],
    purpose: [
      {
        title: "端末を分離する",
        text: "処理を始めるConsumption Deviceを信頼しすぎず、ユーザー管理下のAuthentication Deviceで本人確認します。",
      },
      {
        title: "リダイレクトを不要にする",
        text: "ClientとOpenID ProviderがBackchannel Authentication Endpointで直接通信し、Consumption Deviceのブラウザ遷移を使いません。",
      },
      {
        title: "非同期結果を配送する",
        text: "Client登録時にPoll、Ping、Pushを選び、利用環境に合った方法で認証結果を受け取ります。",
      },
    ],
    security: [
      "ClientはBackchannel Authentication EndpointとToken Endpointで認証される必要があります。",
      "login_hint等で特定したユーザーと、Authentication Device上のユーザーを安全に結び付けます。",
      "binding_messageへ取引内容を表示し、ユーザーが意図した要求か確認できるようにします。",
      "auth_req_idとclient_notification_tokenを推測困難にし、有効期限と一度限り利用を守ります。",
    ],
    relationship:
      "CIBAはOpenID Connect Coreの認証セマンティクスを変更せず、認証開始と結果配送をバックチャネル化します。Device Authorization Grantも端末分離を扱いますが、Device Flowはuser_codeをユーザーが別端末へ入力し、CIBAはClientがユーザーhintを使って認証要求を開始します。",
    audience:
      "金融、コールセンター、店舗端末、スマートデバイスなど、操作端末と認証端末を分けたいシステム設計者向けです。",
  },
  "rfc-7636": {
    introduction: [
      "PKCE（Proof Key for Code Exchange）は、Authorization Code Flowで発行された認可コードを、認可リクエストを始めたClientだけがトークンへ交換できるようにする仕組みです。読み方は『ピクシー』です。",
      "Clientは最初に推測困難なcode_verifierを作り、そのSHA-256ハッシュであるcode_challengeだけをAuthorization Serverへ送ります。Token Endpointでは元のcode_verifierを提示し、サーバーが再計算した値と最初のchallengeが一致した場合だけトークンを発行します。",
    ],
    purpose: [
      {
        title: "認可コードをClientへ結び付ける",
        text: "認可コードだけでなく、処理開始時に作った一度限りの秘密値も要求し、別のClientによるコード交換を防ぎます。",
      },
      {
        title: "Client Secretを置けない環境を守る",
        text: "SPAやモバイルアプリのように固定Secretを安全に保管できないPublic Clientでも、リクエストごとの証明を利用できます。",
      },
      {
        title: "コード横取りの被害を抑える",
        text: "カスタムURL Schemeやログなどから認可コードが漏れても、code_verifierがなければトークンへ交換できません。",
      },
    ],
    security: [
      "code_verifierは暗号学的に安全な乱数から生成し、43〜128文字の許可された文字列として扱います。",
      "code_challenge_methodにはplainではなくS256を使用します。",
      "code_verifierはブラウザURLへ含めず、Clientのセッションなど外部へ漏れにくい場所に一時保存します。",
      "PKCEはstate、redirect_uri検証、Client認証を置き換えるものではなく、それぞれ別の攻撃を防ぎます。",
    ],
    relationship:
      "PKCEはRFC 6749のAuthorization Code Grantを拡張します。OAuth 2.1ではPublic ClientだけでなくAuthorization Code Flow全般の基本要件として扱われます。OIDC Authorization Code Flowでも同じ仕組みを利用できます。",
    audience:
      "Authorization Code Flowを実装し、code_verifierとcode_challengeがどこで作られ、なぜ必要なのかを理解したい人向けです。",
  },
  "rfc-7519": {
    introduction: [
      "JWTは、名前や権限、有効期限といったClaimsをJSONで表し、URLでも扱いやすいコンパクトな文字列として交換する形式です。JWTという名前はトークンの形式を示すものであり、それだけでOAuthのアクセストークンやログインセッションになるわけではありません。",
      "一般的な署名付きJWTはHeader、Payload、Signatureの3部分をピリオドで連結します。Payloadは暗号化されていないため誰でもBase64URLデコードできます。信頼性は秘密性ではなく、JWS署名とClaimsの検証によって確かめます。",
    ],
    purpose: [
      {
        title: "Claimsを共通形式で運ぶ",
        text: "iss、sub、aud、expなどの登録済みClaimと、用途固有のClaimをJSONオブジェクトとして表現します。",
      },
      {
        title: "改ざんを検出する",
        text: "JWSで署名されたJWTでは、HeaderやPayloadが発行後に変更されていないことを受信側が検証できます。",
      },
      {
        title: "サービス間で検証する",
        text: "公開鍵署名を利用すると、秘密鍵を持たないResource Serverも発行者の公開鍵でトークンを検証できます。",
      },
    ],
    security: [
      "algをトークン任せにせず、受信側が許可した署名Algorithmだけを受け入れます。",
      "署名だけでなくiss、aud、exp、nbfと、用途に必要なnonceやscopeも検証します。",
      "Payloadへパスワードや不要な個人情報を入れません。機密性が必要ならJWEまたは別の安全な保存・通信方法を選びます。",
      "JWTの用途を分離し、ID TokenをアクセストークンとしてAPIへ送らないようにします。",
    ],
    relationship:
      "RFC 7519はClaimsとJWT表現を定義し、実際の署名はJWS、暗号化はJWE、鍵表現はJWKが支えます。OIDCはID TokenをJWTとして定義しますが、OAuthのアクセストークンは必ずJWTであるとは限りません。",
    audience:
      "JWTの三つの部分、署名と暗号化の違い、OAuth/OIDCで検証すべきClaimsを整理したい人向けです。",
  },
  "rfc-9449": {
    introduction: [
      "DPoPは、OAuthアクセストークンをClientが持つ鍵ペアへ結び付ける仕組みです。通常のBearer Tokenは持っている人なら誰でも利用できますが、DPoP Tokenは対応する秘密鍵でリクエストごとの証明を作れるClientだけが利用できます。",
      "ClientはToken EndpointとResource ServerへのリクエストごとにDPoP Proof JWTを作ります。ProofにはHTTP Method、送信先URI、発行時刻、一意なjtiなどが含まれ、Resource Serverは署名と内容、アクセストークンとの鍵Bindingを検証します。",
    ],
    purpose: [
      {
        title: "Tokenを鍵へ結び付ける",
        text: "Authorization ServerはClient公開鍵のthumbprintをアクセストークンへ記録し、Resource Serverが同じ鍵の証明を要求できるようにします。",
      },
      {
        title: "漏えいTokenの再利用を防ぐ",
        text: "攻撃者がアクセストークンだけを取得しても、対応する秘密鍵がなければ有効なAPIリクエストを作れません。",
      },
      {
        title: "リクエスト単位で証明する",
        text: "htmとhtuでProofをHTTPリクエストへ結び付け、別Endpointや別Methodへの転用を防ぎます。",
      },
    ],
    security: [
      "秘密鍵はClient外へ出さず、可能ならOSのKey Storeやハードウェア保護領域へ保存します。",
      "Resource Serverは署名、typ、jti、iat、htm、htu、athと公開鍵Bindingをまとめて検証します。",
      "Proofのjtiと短い有効時間を利用してReplayを検出し、必要に応じてServer Nonceを要求します。",
      "DPoPはTLSを置き換えません。TokenとProofは常にHTTPSで送信します。",
    ],
    relationship:
      "DPoPはOAuth 2.0のBearer TokenをSender-Constrained Tokenとして強化します。相互TLSも同じ目的を持ちますが、DPoPはアプリケーション層の鍵証明を使うため、Public Clientやプロキシを含む構成で採用しやすい特徴があります。",
    audience:
      "アクセストークン漏えい後の再利用まで防ぎたいAPI設計者や、Bearer TokenとSender-Constrained Tokenの違いを学びたい人向けです。",
  },
  "saml-2-0": {
    introduction: [
      "SAML 2.0は、組織やサービスの境界を越えて認証結果とユーザー属性を交換するためのXMLベースの標準です。企業向けSingle Sign-Onで広く利用され、ログインを担当するIdentity Provider（IdP）と、アプリを提供するService Provider（SP）を分離します。",
      "代表的なWeb Browser SSOでは、SPがAuthnRequestをIdPへ送り、ユーザーがIdPで認証します。IdPは署名付きSAML ResponseとAssertionをブラウザ経由でSPのAssertion Consumer Serviceへ返し、SPが検証後にローカルセッションを開始します。",
    ],
    purpose: [
      {
        title: "組織間SSOを実現する",
        text: "利用者は組織のIdPで一度認証し、連携する複数のSPへ個別パスワードを登録せずアクセスできます。",
      },
      {
        title: "認証結果と属性を伝える",
        text: "AssertionにSubject、認証時刻、認証Context、所属や役割などのAttributeを含められます。",
      },
      {
        title: "Metadataで信頼を設定する",
        text: "Entity ID、Endpoint、証明書、対応BindingをMetadataとして交換し、連携相手と検証鍵を事前設定します。",
      },
    ],
    security: [
      "SAML ResponseまたはAssertionの署名を信頼済みIdP証明書で検証し、未署名部分の参照を避けます。",
      "Issuer、Audience、Recipient、Destination、InResponseTo、有効時間をSP自身の要求と照合します。",
      "Assertionを一度だけ受理し、短い有効時間とID記録でReplayを防ぎます。",
      "XML Signature Wrappingを防げる実績あるライブラリを使い、独自XML署名検証を実装しません。",
    ],
    relationship:
      "SAMLとOpenID ConnectはどちらもFederated LoginとSSOに利用できます。SAMLはXMLとブラウザPOST/Redirect Bindingを中心とし、OIDCはOAuth 2.0、JSON、JWT、RESTとの親和性が高いため、Web・モバイルの新規サービスではOIDCが選ばれることが多いです。",
    audience:
      "企業SSO、IdP/SP、SAML Assertionの役割を理解し、OpenID Connectとの違いを整理したい人向けです。",
  },
  "rfc-7644": {
    introduction: [
      "SCIMは、クラウドサービス間でユーザーとグループのライフサイクルを自動管理するためのRESTプロトコルです。ログイン時に本人を確認する認証プロトコルではなく、入社・異動・退職に合わせてアカウントを準備し、権限の土台を最新に保つIdentity Provisioning仕様です。",
      "Identity Providerや人事システムがSCIM Clientとなり、Service Providerの/Usersや/Groups Endpointを操作します。共通Schema、検索Filter、PATCH、Bulk処理が定義され、サービスごとに異なるユーザー管理APIを減らします。",
    ],
    purpose: [
      {
        title: "アカウント管理を自動化する",
        text: "利用開始前の作成、属性変更、グループ所属、利用終了時の無効化を組織のID情報と同期します。",
      },
      {
        title: "ユーザー表現を共通化する",
        text: "UserとGroupのCore Schemaにより、userName、name、emails、active、membersなどを共通形式で扱います。",
      },
      {
        title: "退職者のアクセスを止める",
        text: "SSO設定だけで終わらず、active=falseやアカウント削除を連携して不要なアクセス権を速やかに失効させます。",
      },
    ],
    security: [
      "SCIM EndpointはOAuthアクセストークンなどで強く認証し、Provisioningに必要な最小権限だけを付与します。",
      "すべてHTTPSで通信し、ログへアクセストークンや不要な個人属性を残しません。",
      "externalIdやidを安定した識別子として扱い、表示名やメールアドレスだけでユーザーを誤結合しません。",
      "削除と無効化の方針、再試行時の冪等性、監査ログ、管理者による変更との競合を設計します。",
    ],
    relationship:
      "OIDCやSAMLは主にログイン時の認証結果を伝え、SCIMはログイン前後を含むアカウントのライフサイクルを管理します。SSOでログインを統合し、SCIMで作成・属性・所属・無効化を同期することで、Identity管理全体を構成できます。",
    audience:
      "Enterprise SSOと合わせてユーザーProvisioning、グループ同期、退職者のアクセス失効を設計する人向けです。",
  },
};

export function getSpecificationGuide(slug: string) {
  return guides[slug];
}

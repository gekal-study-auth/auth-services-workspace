import type { FlowStep, Protocol } from "./protocols";

export type FlowExamples = {
  request: string;
  response: string;
  transport: string;
  handoff?: string;
};

const jsonHeaders = "Content-Type: application/json\nAccept: application/json";
const formHeaders = "Content-Type: application/x-www-form-urlencoded\nAccept: application/json";

function oauthExamples(step: FlowStep): FlowExamples {
  const text = `${step.label} ${step.message}`;
  if (/ログインを開始|認可を開始|サインインを開始/.test(text)) {
    return {
      transport: "Browser → Client BFF",
      request: `GET /api/auth/login\nContent-Type: application/json\nAccept: text/html`,
      response: `HTTP/1.1 302 Found\nLocation: https://authorization.example/oauth2/authorize?response_type=code&client_id=nextjs-client&scope=openid%20profile&state=af0ifjsldkj&code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&code_challenge_method=S256\nSet-Cookie: oauth_transaction=sealed; HttpOnly; Secure; SameSite=Lax`,
    };
  }
  if (/PKCEを生成/.test(text)) {
    return {
      transport: "BFF API → Authorization Endpoint",
      request: `GET /api/auth/login\nAccept: text/html`,
      response: `HTTP/1.1 302 Found\nLocation: /oauth2/authorize?response_type=code\n  &client_id=nextjs-client\n  &scope=openid%20profile\n  &state=af0ifjsldkj\n  &nonce=n-0S6_WzA2Mj\n  &code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM\n  &code_challenge_method=S256\nSet-Cookie: oauth_transaction=sealed; HttpOnly; Secure; SameSite=Lax`,
    };
  }
  if (
    /認可リクエスト|S256認可|OpenID認証|複合レスポンス|tokenを直接要求|トークンを直接要求/.test(
      text,
    )
  ) {
    return {
      transport: "Browser → Authorization Server",
      request: `GET /oauth2/authorize?response_type=code&client_id=nextjs-client&redirect_uri=https%3A%2F%2Fclient.example%2Fapi%2Fauth%2Fcallback&scope=openid%20profile&state=af0ifjsldkj\nAccept: text/html`,
      response: `HTTP/1.1 302 Found\nLocation: /login`,
    };
  }
  if (/ログイン|本人認証|同意/.test(text)) {
    return {
      transport: "Browser → Authorization Server",
      request: `POST /login\nContent-Type: application/x-www-form-urlencoded\n\nusername=user&password=********`,
      response: `HTTP/1.1 302 Found\nLocation: https://client.example/api/auth/callback?code=SplxlOBeZQQYbYS6WxSbIA&state=af0ifjsldkj\nCache-Control: no-store`,
      handoff:
        "Authorization Serverがcodeを新しく発行し、Locationのクエリへ入れます。stateは最初の認可リクエストでClientが送った値を、そのまま返したものです。ブラウザはこのLocationへ自動的に移動するため、次のステップでは同じcodeとstateを持つGETリクエストが発生します。",
    };
  }
  if (/認可コード|コードを返却/.test(text)) {
    return {
      transport: "Authorization Server → Client callback",
      request: `GET /api/auth/callback?code=SplxlOBeZQQYbYS6WxSbIA&state=af0ifjsldkj\nCookie: oauth_transaction=sealed`,
      response: `HTTP/1.1 302 Found\nLocation: /dashboard\nSet-Cookie: oauth_transaction=; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
      handoff:
        "このcode=SplxlOBeZQQYbYS6WxSbIAとstate=af0ifjsldkjは、直前の302レスポンスのLocationに入っていた値です。ブラウザがリダイレクト先をGETしたことでClient BFFへ届きました。Clientはstateが開始時の保存値と同じか確認します。",
    };
  }
  if (/トークン交換|verifierを提示|コードを交換|更新を要求/.test(text)) {
    const refresh = /更新/.test(text);
    return {
      transport: "Client BFF → Token Endpoint",
      request: refresh
        ? `POST /oauth2/token\n${formHeaders}\n\ngrant_type=refresh_token&refresh_token=def502...&client_id=nextjs-client`
        : `POST /oauth2/token\n${formHeaders}\n\ngrant_type=authorization_code&client_id=nextjs-client&code=SplxlOBeZQQYbYS6WxSbIA&redirect_uri=https%3A%2F%2Fclient.example%2Fapi%2Fauth%2Fcallback&code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk`,
      response: `HTTP/1.1 200 OK\n${jsonHeaders}\nCache-Control: no-store\n\n{\n  "access_token": "eyJhbGciOiJSUzI1NiJ9...",\n  "token_type": "Bearer",\n  "expires_in": 300,\n  "scope": "openid profile",\n  "id_token": "eyJraWQiOiJh..."\n}`,
      handoff: refresh
        ? "前回のトークン発行時に受け取って安全に保存したrefresh_tokenを使います。"
        : "codeはコールバックURLから受け取った値です。Client BFFが同じcodeと、ログイン開始時から保管していたcode_verifierをToken Endpointへ送ります。",
    };
  }
  if (/クライアントを認証/.test(text)) {
    return {
      transport: "Machine Client → Token Endpoint",
      request: `POST /oauth2/token\n${formHeaders}\nAuthorization: Basic bTJtLWNsaWVudDpzZWNyZXQ=\n\ngrant_type=client_credentials&scope=jobs.write`,
      response: `HTTP/1.1 200 OK\n${jsonHeaders}\nCache-Control: no-store\n\n{\n  "access_token": "eyJhbGciOiJSUzI1NiJ9...",\n  "token_type": "Bearer",\n  "expires_in": 300,\n  "scope": "jobs.write"\n}`,
    };
  }
  if (/デバイスコード/.test(text)) {
    return {
      transport: "Device → Device Authorization Endpoint",
      request: `POST /oauth2/device_authorization\n${formHeaders}\n\nclient_id=tv-client&scope=openid%20profile`,
      response: `HTTP/1.1 200 OK\n${jsonHeaders}\n\n{\n  "device_code": "GmRhmhcxhwAzkoEqiMEg...",\n  "user_code": "WDJB-MJHT",\n  "verification_uri": "https://auth.example/device",\n  "expires_in": 1800,\n  "interval": 5\n}`,
    };
  }
  if (/ポーリング/.test(text)) {
    return {
      transport: "Device → Token Endpoint",
      request: `POST /oauth2/token\n${formHeaders}\n\ngrant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=GmRhmhcxhwAzkoEqiMEg&client_id=tv-client`,
      response: `HTTP/1.1 400 Bad Request\n${jsonHeaders}\n\n{ "error": "authorization_pending" }`,
    };
  }
  if (/API|UserInfo/.test(text)) {
    const userInfo = /UserInfo/.test(text);
    return {
      transport: "Client BFF → Resource Server",
      request: `GET ${userInfo ? "/userinfo" : "/api/user"}\nAccept: application/json\nAuthorization: Bearer eyJhbGciOiJSUzI1NiJ9...`,
      response: `HTTP/1.1 200 OK\n${jsonHeaders}\n\n{\n  "sub": "user-123",\n  "name": "Example User",\n  "scope": ["profile"]\n}`,
    };
  }
  if (/トークンを発行|IDトークンを発行|アクセストークン発行/.test(text)) {
    return {
      transport: "Authorization Server → Client BFF",
      request: `POST /oauth2/token\n${formHeaders}\n\ngrant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA&code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk`,
      response: `HTTP/1.1 200 OK\n${jsonHeaders}\nCache-Control: no-store\n\n{\n  "access_token": "eyJhbGciOiJSUzI1NiJ9...",\n  "id_token": "eyJraWQiOiJh...",\n  "token_type": "Bearer",\n  "expires_in": 300\n}`,
    };
  }
  return {
    transport: "Protocol operation",
    request: `${step.message}\n${jsonHeaders}`,
    response: `HTTP/1.1 200 OK\n${jsonHeaders}\n\n{ "status": "accepted" }`,
  };
}

function fidoExamples(protocol: Protocol, step: FlowStep): FlowExamples {
  const text = `${step.label} ${step.message}`;
  const registration = protocol.slug === "fido2-registration";
  if (/Options|登録を開始|サインイン開始/.test(text)) {
    const path = registration ? "registration" : "authentication";
    return {
      transport: "Browser → Relying Party",
      request: `POST /webauthn/${path}/options\n${jsonHeaders}\nCookie: session=...\n\n{ "username": "user@example.com" }`,
      response: registration
        ? `HTTP/1.1 200 OK\n${jsonHeaders}\n\n{\n  "rp": { "id": "example.com", "name": "Example" },\n  "user": { "id": "dXNlci0xMjM", "name": "user@example.com" },\n  "challenge": "Y2hhbGxlbmdl...",\n  "pubKeyCredParams": [{ "type": "public-key", "alg": -7 }],\n  "authenticatorSelection": { "userVerification": "required" }\n}`
        : `HTTP/1.1 200 OK\n${jsonHeaders}\n\n{\n  "challenge": "Y2hhbGxlbmdl...",\n  "rpId": "example.com",\n  "allowCredentials": [{ "type": "public-key", "id": "AbCdEf..." }],\n  "userVerification": "required"\n}`,
    };
  }
  if (/Credential作成|Assertionを要求|Authenticatorを呼ぶ|署名要求/.test(text)) {
    return {
      transport: "Browser API → Authenticator",
      request: registration
        ? `navigator.credentials.create({\n  publicKey: creationOptions\n})`
        : `navigator.credentials.get({\n  publicKey: requestOptions\n})`,
      response: registration
        ? `PublicKeyCredential {\n  id: "AbCdEf...",\n  type: "public-key",\n  response: AuthenticatorAttestationResponse {\n    clientDataJSON: ArrayBuffer(...),\n    attestationObject: ArrayBuffer(...)\n  }\n}`
        : `PublicKeyCredential {\n  id: "AbCdEf...",\n  type: "public-key",\n  response: AuthenticatorAssertionResponse {\n    clientDataJSON: ArrayBuffer(...),\n    authenticatorData: ArrayBuffer(...),\n    signature: ArrayBuffer(...)\n  }\n}`,
    };
  }
  if (/送信|検証|保存/.test(text)) {
    const path = registration ? "registration" : "authentication";
    return {
      transport: "Browser → Relying Party",
      request: `POST /webauthn/${path}/verify\n${jsonHeaders}\nCookie: session=...\n\n{\n  "id": "AbCdEf...",\n  "type": "public-key",\n  "response": {\n    "clientDataJSON": "eyJ0eXBlIjo...",\n    "${registration ? "attestationObject" : "authenticatorData"}": "o2NmbXRkbm9u...",\n    "${registration ? "transports" : "signature"}": ${registration ? '["internal"]' : '"MEUCIQD..."'}\n  }\n}`,
      response: `HTTP/1.1 200 OK\n${jsonHeaders}\nSet-Cookie: session=sealed; HttpOnly; Secure; SameSite=Lax\n\n{ "verified": true${registration ? ', "credentialId": "AbCdEf..."' : ""} }`,
    };
  }
  return {
    transport: protocol.slug.startsWith("fido2")
      ? "CTAP / Authenticator operation"
      : "FIDO Client operation",
    request: `${step.message}\n\n{ "challenge": "Y2hhbGxlbmdl...", "rpId": "example.com" }`,
    response: `{\n  "status": "OK",\n  "credentialId": "AbCdEf...",\n  "signature": "MEUCIQD..."\n}`,
  };
}

export function getFlowExamples(protocol: Protocol, step: FlowStep): FlowExamples {
  if (step.requestExample && step.responseExample) {
    return {
      request: step.requestExample,
      response: step.responseExample,
      transport: "API exchange",
    };
  }
  return protocol.family === "FIDO" || protocol.family === "FIDO2"
    ? fidoExamples(protocol, step)
    : oauthExamples(step);
}

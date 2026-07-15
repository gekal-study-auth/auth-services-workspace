package com.example.auth.controller;

import java.security.Principal;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsent;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ui-api")
public class AuthorizationUiController {
  private static final Map<String, String> SCOPE_DESCRIPTIONS =
      Map.of(
          OidcScopes.OPENID, "あなたを識別するためのIDトークンを発行します。",
          OidcScopes.PROFILE, "表示名、ユーザー名、プロフィール画像をClient Appへ共有します。");

  private final RegisteredClientRepository clients;
  private final OAuth2AuthorizationConsentService consents;

  public AuthorizationUiController(
      RegisteredClientRepository clients, OAuth2AuthorizationConsentService consents) {
    this.clients = clients;
    this.consents = consents;
  }

  @GetMapping("/login-context")
  LoginContext loginContext(CsrfToken csrfToken, Principal principal) {
    return new LoginContext(
        principal != null, principal != null ? principal.getName() : null, csrf(csrfToken));
  }

  @GetMapping("/consent-context")
  ResponseEntity<ConsentContext> consentContext(
      @RequestParam("client_id") String clientId,
      @RequestParam("scope") String scope,
      @RequestParam("state") String state,
      CsrfToken csrfToken,
      Principal principal) {
    RegisteredClient client = clients.findByClientId(clientId);
    if (client == null) return ResponseEntity.notFound().build();

    Set<String> requestedScopes = new LinkedHashSet<>(Arrays.asList(scope.trim().split("\\s+")));
    OAuth2AuthorizationConsent existing = consents.findById(client.getId(), principal.getName());
    Set<String> previouslyApproved = existing == null ? Set.of() : existing.getScopes();
    List<ScopeView> scopes =
        requestedScopes.stream()
            .map(
                name ->
                    new ScopeView(
                        name,
                        SCOPE_DESCRIPTIONS.getOrDefault(name, "この権限をClient Appへ許可します。"),
                        previouslyApproved.contains(name)))
            .toList();
    return ResponseEntity.ok(
        new ConsentContext(
            client.getClientId(),
            client.getClientName(),
            state,
            principal.getName(),
            scopes,
            csrf(csrfToken)));
  }

  private static CsrfView csrf(CsrfToken token) {
    return new CsrfView(token.getParameterName(), token.getHeaderName(), token.getToken());
  }

  record CsrfView(String parameterName, String headerName, String token) {}

  record LoginContext(boolean authenticated, String username, CsrfView csrf) {}

  record ScopeView(String name, String description, boolean previouslyApproved) {}

  record ConsentContext(
      String clientId,
      String clientName,
      String state,
      String username,
      List<ScopeView> scopes,
      CsrfView csrf) {}
}

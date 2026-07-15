package com.example.auth.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.oidc.authentication.OidcLogoutAuthenticationToken;

class OidcLogoutSuccessHandlerTests {
  @Test
  void revokesTokensAndEndsTheAuthorizationServerSession() throws Exception {
    Instant now = Instant.now();
    RegisteredClient client =
        RegisteredClient.withId("client-id")
            .clientId("nextjs-client")
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri("https://client.example/callback")
            .build();
    OAuth2AccessToken accessToken =
        new OAuth2AccessToken(
            OAuth2AccessToken.TokenType.BEARER,
            "access-token",
            now,
            now.plusSeconds(300),
            Set.of("profile"));
    OidcIdToken idToken =
        new OidcIdToken(
            "id-token", now, now.plusSeconds(300), Map.of("sub", "user", "aud", "nextjs-client"));
    OAuth2Authorization authorization =
        OAuth2Authorization.withRegisteredClient(client)
            .principalName("user")
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .accessToken(accessToken)
            .token(idToken)
            .build();
    OAuth2AuthorizationService service = mock(OAuth2AuthorizationService.class);
    when(service.findByToken("id-token", new OAuth2TokenType("id_token")))
        .thenReturn(authorization);
    AtomicReference<OAuth2Authorization> saved = new AtomicReference<>();
    org.mockito.Mockito.doAnswer(
            invocation -> {
              saved.set(invocation.getArgument(0));
              return null;
            })
        .when(service)
        .save(any());
    var principal = UsernamePasswordAuthenticationToken.authenticated("user", "password", Set.of());
    var logout =
        new OidcLogoutAuthenticationToken(
            idToken, principal, "session-id", "nextjs-client", "https://client.example/", null);

    new OidcLogoutSuccessHandler(service)
        .onAuthenticationSuccess(
            mock(HttpServletRequest.class), mock(HttpServletResponse.class), logout);

    verify(service).save(any());
    assertThat(saved.get().getAccessToken().isInvalidated()).isTrue();
    assertThat(saved.get().getToken(OidcIdToken.class).isInvalidated()).isTrue();
  }
}

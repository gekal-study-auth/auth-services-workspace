package com.example.auth.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.auth.model.UserProfileRepository;
import java.time.Instant;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

@SpringBootTest
class PersistenceConfigTests {
  @Autowired JdbcTemplate jdbcTemplate;
  @Autowired UserDetailsService users;
  @Autowired PasswordEncoder passwordEncoder;
  @Autowired RegisteredClientRepository clients;
  @Autowired OAuth2AuthorizationService authorizations;
  @Autowired OAuth2AuthorizationConsentService consents;
  @Autowired UserProfileRepository profiles;

  @Test
  void loadsSeedUserAndJdbcOAuthServices() {
    var user = users.loadUserByUsername("user");

    assertThat(user.isEnabled()).isTrue();
    assertThat(passwordEncoder.matches("password", user.getPassword())).isTrue();
    assertThat(clients.findByClientId("nextjs-client")).isNotNull();
    assertThat(authorizations.getClass().getSimpleName())
        .isEqualTo("JdbcOAuth2AuthorizationService");
    assertThat(consents.getClass().getSimpleName())
        .isEqualTo("JdbcOAuth2AuthorizationConsentService");
    assertThat(profiles.findByUsername("user"))
        .get()
        .satisfies(
            profile -> {
              assertThat(profile.displayName()).isEqualTo("Demo User");
              assertThat(profile.locale()).isEqualTo("ja-JP");
            });
    assertThat(
            jdbcTemplate.queryForObject(
                "select count(*) from oauth2_registered_client", Integer.class))
        .isEqualTo(1);
  }

  @Test
  void registersAnOidcAuthorizationCodeClientWithMandatoryPkce() {
    var client = clients.findByClientId("nextjs-client");

    assertThat(client).isNotNull();
    assertThat(client.getClientAuthenticationMethods())
        .containsExactly(ClientAuthenticationMethod.NONE);
    assertThat(client.getAuthorizationGrantTypes())
        .containsExactly(AuthorizationGrantType.AUTHORIZATION_CODE);
    assertThat(client.getScopes()).containsExactlyInAnyOrder("openid", "profile");
    assertThat(client.getClientSettings().isRequireProofKey()).isTrue();
    assertThat(client.getClientSettings().isRequireAuthorizationConsent()).isTrue();
  }

  @Test
  void registersOnlyTheDocumentedExactRedirectAndLogoutUris() {
    var client = clients.findByClientId("nextjs-client");

    assertThat(client.getRedirectUris())
        .containsExactlyInAnyOrder(
            "http://localhost:3000/api/auth/callback",
            "https://client-app.local.gekal.cn/api/auth/callback");
    assertThat(client.getPostLogoutRedirectUris())
        .containsExactlyInAnyOrder("http://localhost:3000/", "https://client-app.local.gekal.cn/");
    assertThat(client.getRedirectUris())
        .doesNotContain(
            "https://client-app.local.gekal.cn/", "https://client-app.local.gekal.cn/*");
  }

  @Test
  void persistsAndLoadsAccessToken() {
    var client = clients.findByClientId("nextjs-client");
    var issuedAt = Instant.now();
    var token =
        new OAuth2AccessToken(
            OAuth2AccessToken.TokenType.BEARER,
            "persisted-test-access-token",
            issuedAt,
            issuedAt.plusSeconds(300),
            Set.of("profile"));
    var authorization =
        OAuth2Authorization.withRegisteredClient(client)
            .principalName("user")
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .authorizedScopes(Set.of("profile"))
            .accessToken(token)
            .build();

    authorizations.save(authorization);

    var loaded =
        authorizations.findByToken("persisted-test-access-token", OAuth2TokenType.ACCESS_TOKEN);
    assertThat(loaded).isNotNull();
    assertThat(loaded.getAccessToken().getToken().getTokenValue())
        .isEqualTo("persisted-test-access-token");
    assertThat(
            jdbcTemplate.queryForObject("select count(*) from oauth2_authorization", Integer.class))
        .isEqualTo(1);
  }
}

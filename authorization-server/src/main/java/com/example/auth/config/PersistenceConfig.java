package com.example.auth.config;

import java.util.UUID;
import javax.sql.DataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.provisioning.JdbcUserDetailsManager;

@Configuration
public class PersistenceConfig {
  @Bean
  RegisteredClientRepository registeredClientRepository(JdbcOperations jdbcOperations) {
    JdbcRegisteredClientRepository repository = new JdbcRegisteredClientRepository(jdbcOperations);
    if (repository.findByClientId("nextjs-client") == null) {
      repository.save(
          RegisteredClient.withId(UUID.randomUUID().toString())
              .clientId("nextjs-client")
              .clientName("Next.js BFF Client")
              .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
              .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
              .redirectUri("http://localhost:3000/api/auth/callback")
              .postLogoutRedirectUri("http://localhost:3000/")
              .scope(OidcScopes.OPENID)
              .scope(OidcScopes.PROFILE)
              .clientSettings(
                  ClientSettings.builder()
                      .requireProofKey(true)
                      .requireAuthorizationConsent(true)
                      .build())
              .build());
    }
    return repository;
  }

  @Bean
  OAuth2AuthorizationService authorizationService(
      JdbcOperations jdbcOperations, RegisteredClientRepository clients) {
    return new JdbcOAuth2AuthorizationService(jdbcOperations, clients);
  }

  @Bean
  OAuth2AuthorizationConsentService authorizationConsentService(
      JdbcOperations jdbcOperations, RegisteredClientRepository clients) {
    return new JdbcOAuth2AuthorizationConsentService(jdbcOperations, clients);
  }

  @Bean
  UserDetailsService userDetailsService(DataSource dataSource) {
    JdbcUserDetailsManager manager = new JdbcUserDetailsManager(dataSource);
    manager.setUsersByUsernameQuery(
        "select username, password, enabled from app_user where username = ?");
    manager.setAuthoritiesByUsernameQuery(
        "select username, authority from app_authority where username = ?");
    return manager;
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();
  }
}

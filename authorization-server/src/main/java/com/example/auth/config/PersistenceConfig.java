package com.example.auth.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.jackson2.SecurityJackson2Modules;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService.OAuth2AuthorizationParametersMapper;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService.OAuth2AuthorizationRowMapper;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.jackson2.OAuth2AuthorizationServerJackson2Module;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.provisioning.JdbcUserDetailsManager;

@Configuration
public class PersistenceConfig {
  @Bean
  RegisteredClientRepository registeredClientRepository(JdbcOperations jdbcOperations) {
    JdbcRegisteredClientRepository repository = new JdbcRegisteredClientRepository(jdbcOperations);
    RegisteredClient existing = repository.findByClientId("nextjs-client");
    RegisteredClient.Builder client =
        existing == null
            ? RegisteredClient.withId(UUID.randomUUID().toString())
            : RegisteredClient.from(existing);
    repository.save(
        client
            .clientId("nextjs-client")
            .clientName("Next.js BFF Client")
            .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri("http://localhost:3000/api/auth/callback")
            .redirectUri("https://client-app.local.gekal.cn/api/auth/callback")
            .postLogoutRedirectUri("http://localhost:3000/")
            .postLogoutRedirectUri("https://client-app.local.gekal.cn/")
            .scope(OidcScopes.OPENID)
            .scope(OidcScopes.PROFILE)
            .scope("demo.read")
            .clientSettings(
                ClientSettings.builder()
                    .requireProofKey(true)
                    .requireAuthorizationConsent(true)
                    .build())
            .build());
    return repository;
  }

  @Bean
  OAuth2AuthorizationService authorizationService(
      JdbcOperations jdbcOperations, RegisteredClientRepository clients) {
    ObjectMapper objectMapper = authorizationObjectMapper();
    OAuth2AuthorizationRowMapper rowMapper = new OAuth2AuthorizationRowMapper(clients);
    rowMapper.setObjectMapper(objectMapper);
    OAuth2AuthorizationParametersMapper parametersMapper =
        new OAuth2AuthorizationParametersMapper();
    parametersMapper.setObjectMapper(objectMapper);

    JdbcOAuth2AuthorizationService service =
        new JdbcOAuth2AuthorizationService(jdbcOperations, clients);
    service.setAuthorizationRowMapper(rowMapper);
    service.setAuthorizationParametersMapper(parametersMapper);
    return service;
  }

  private static ObjectMapper authorizationObjectMapper() {
    ObjectMapper objectMapper = new ObjectMapper();
    ClassLoader classLoader = JdbcOAuth2AuthorizationService.class.getClassLoader();
    List<Module> securityModules = SecurityJackson2Modules.getModules(classLoader);
    objectMapper.registerModules(securityModules);
    objectMapper.registerModule(new OAuth2AuthorizationServerJackson2Module());
    objectMapper.addMixIn(Long.class, LongMixin.class);
    return objectMapper;
  }

  @JsonTypeInfo(use = JsonTypeInfo.Id.CLASS)
  private abstract static class LongMixin {}

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

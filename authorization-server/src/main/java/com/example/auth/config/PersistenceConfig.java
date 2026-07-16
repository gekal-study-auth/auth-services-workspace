package com.example.auth.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.jackson.SecurityJacksonModules;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService.JsonMapperOAuth2AuthorizationParametersMapper;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService.JsonMapperOAuth2AuthorizationRowMapper;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.provisioning.JdbcUserDetailsManager;
import tools.jackson.databind.JacksonModule;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.jsontype.BasicPolymorphicTypeValidator;

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
            .scope(OidcScopes.EMAIL)
            .scope(OidcScopes.ADDRESS)
            .scope(OidcScopes.PHONE)
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
    JsonMapper jsonMapper = authorizationJsonMapper();
    JsonMapperOAuth2AuthorizationRowMapper rowMapper =
        new JsonMapperOAuth2AuthorizationRowMapper(clients, jsonMapper);
    JsonMapperOAuth2AuthorizationParametersMapper parametersMapper =
        new JsonMapperOAuth2AuthorizationParametersMapper(jsonMapper);

    JdbcOAuth2AuthorizationService service =
        new JdbcOAuth2AuthorizationService(jdbcOperations, clients);
    service.setAuthorizationRowMapper(rowMapper);
    service.setAuthorizationParametersMapper(parametersMapper);
    return service;
  }

  private static JsonMapper authorizationJsonMapper() {
    ClassLoader classLoader = JdbcOAuth2AuthorizationService.class.getClassLoader();
    // The LongMixin tags numeric OIDC claims (e.g. updated_at) with their concrete type so
    // they survive a JSON round-trip as Long instead of being read back as Integer. Jackson
    // 3's security modules validate every @class type id against an allowlist, so java.lang.Long
    // must be permitted explicitly for deserialization to succeed.
    BasicPolymorphicTypeValidator.Builder typeValidator =
        BasicPolymorphicTypeValidator.builder().allowIfSubType(Long.class);
    // Spring Security 7.0 folded the Authorization Server in and serializes authorizations
    // with Jackson 3; getModules() registers the OAuth2/security mixins (and java.time
    // support, which Jackson 3 has in core) so no jackson-datatype-jsr310 is needed.
    List<JacksonModule> securityModules =
        SecurityJacksonModules.getModules(classLoader, typeValidator);
    return JsonMapper.builder()
        .addModules(securityModules)
        .addMixIn(Long.class, LongMixin.class)
        .build();
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

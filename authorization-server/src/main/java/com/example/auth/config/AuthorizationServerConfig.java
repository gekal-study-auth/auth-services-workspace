package com.example.auth.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.UUID;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class AuthorizationServerConfig {
  @Bean
  @Order(1)
  SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
    OAuth2AuthorizationServerConfigurer authorizationServerConfigurer =
        OAuth2AuthorizationServerConfigurer.authorizationServer();

    http.securityMatcher(authorizationServerConfigurer.getEndpointsMatcher())
        .with(authorizationServerConfigurer, server -> server.oidc(Customizer.withDefaults()))
        .authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
        .exceptionHandling(
            exceptions ->
                exceptions.defaultAuthenticationEntryPointFor(
                    new org.springframework.security.web.authentication
                        .LoginUrlAuthenticationEntryPoint("/login"),
                    new org.springframework.security.web.util.matcher.MediaTypeRequestMatcher(
                        org.springframework.http.MediaType.TEXT_HTML)));
    return http.build();
  }

  @Bean
  JWKSource<SecurityContext> jwkSource() {
    KeyPair keyPair = generateRsaKey();
    RSAKey rsaKey =
        new RSAKey.Builder((RSAPublicKey) keyPair.getPublic())
            .privateKey((RSAPrivateKey) keyPair.getPrivate())
            .keyID(UUID.randomUUID().toString())
            .build();
    return new ImmutableJWKSet<>(new JWKSet(rsaKey));
  }

  private static KeyPair generateRsaKey() {
    try {
      KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
      generator.initialize(2048);
      return generator.generateKeyPair();
    } catch (Exception ex) {
      throw new IllegalStateException("RSA key generation failed", ex);
    }
  }

  @Bean
  JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
    return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
  }

  @Bean
  AuthorizationServerSettings authorizationServerSettings() {
    return AuthorizationServerSettings.builder().issuer("http://localhost:9000").build();
  }
}

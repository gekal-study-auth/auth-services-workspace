package com.example.auth.config;

import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.session.HttpSessionEventPublisher;

@Configuration
public class SecurityConfig {
  @Bean
  @Order(2)
  SecurityFilterChain applicationSecurityFilterChain(
      HttpSecurity http, SessionRegistry sessionRegistry) throws Exception {
    http.authorizeHttpRequests(
            authorize ->
                authorize
                    .requestMatchers("/actuator/health", "/ui-api/login-context")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .formLogin(
            form ->
                form.loginPage("/login")
                    .loginProcessingUrl("/ui-api/login")
                    .failureUrl("/login?error=invalid_credentials")
                    .permitAll())
        .sessionManagement(session -> session.maximumSessions(-1).sessionRegistry(sessionRegistry));
    return http.build();
  }

  @Bean
  SessionRegistry sessionRegistry() {
    return new SessionRegistryImpl();
  }

  @Bean
  ServletListenerRegistrationBean<HttpSessionEventPublisher> httpSessionEventPublisher() {
    return new ServletListenerRegistrationBean<>(new HttpSessionEventPublisher());
  }
}

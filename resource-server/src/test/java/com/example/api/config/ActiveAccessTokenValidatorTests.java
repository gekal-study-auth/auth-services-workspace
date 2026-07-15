package com.example.api.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.example.api.model.ActiveAccessTokenMapper;
import java.time.Instant;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class ActiveAccessTokenValidatorTests {
  private final ActiveAccessTokenMapper tokens = mock(ActiveAccessTokenMapper.class);
  private final ActiveAccessTokenValidator validator = new ActiveAccessTokenValidator(tokens);

  @Test
  void acceptsActiveDatabaseToken() {
    Jwt jwt = jwt("active-token");
    when(tokens.isActive("active-token")).thenReturn(true);

    assertThat(validator.validate(jwt).hasErrors()).isFalse();
  }

  @Test
  void rejectsRevokedDatabaseToken() {
    Jwt jwt = jwt("revoked-token");
    when(tokens.isActive("revoked-token")).thenReturn(false);

    assertThat(validator.validate(jwt).hasErrors()).isTrue();
  }

  private static Jwt jwt(String value) {
    Instant now = Instant.now();
    return new Jwt(value, now, now.plusSeconds(300), Map.of("alg", "RS256"), Map.of("sub", "user"));
  }
}

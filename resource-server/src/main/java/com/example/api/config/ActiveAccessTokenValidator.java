package com.example.api.config;

import com.example.api.model.ActiveAccessTokenMapper;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

final class ActiveAccessTokenValidator implements OAuth2TokenValidator<Jwt> {
  private final ActiveAccessTokenMapper tokens;

  ActiveAccessTokenValidator(ActiveAccessTokenMapper tokens) {
    this.tokens = tokens;
  }

  @Override
  public OAuth2TokenValidatorResult validate(Jwt jwt) {
    if (tokens.isActive(jwt.getTokenValue())) {
      return OAuth2TokenValidatorResult.success();
    }
    return OAuth2TokenValidatorResult.failure(
        new OAuth2Error(
            OAuth2ErrorCodes.INVALID_TOKEN, "The access token is expired or revoked.", null));
  }
}

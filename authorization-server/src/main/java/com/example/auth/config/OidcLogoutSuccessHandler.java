package com.example.auth.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.oidc.authentication.OidcLogoutAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.oidc.web.authentication.OidcLogoutAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

final class OidcLogoutSuccessHandler implements AuthenticationSuccessHandler {
  private static final Logger log = LoggerFactory.getLogger(OidcLogoutSuccessHandler.class);
  private static final OAuth2TokenType ID_TOKEN = new OAuth2TokenType("id_token");
  private static final String REVOKE_TOKENS_PARAMETER = "revoke_tokens";

  private final OAuth2AuthorizationService authorizations;
  private final AuthenticationSuccessHandler sessionLogout =
      new OidcLogoutAuthenticationSuccessHandler();

  OidcLogoutSuccessHandler(OAuth2AuthorizationService authorizations) {
    this.authorizations = authorizations;
  }

  @Override
  public void onAuthenticationSuccess(
      HttpServletRequest request, HttpServletResponse response, Authentication authentication)
      throws IOException, ServletException {
    OidcLogoutAuthenticationToken logout = (OidcLogoutAuthenticationToken) authentication;
    if (Boolean.parseBoolean(request.getParameter(REVOKE_TOKENS_PARAMETER))) {
      revokeTokens(logout);
    }

    sessionLogout.onAuthenticationSuccess(request, response, authentication);
    log.info("event=oidc_logout_session_ended principal={}", authentication.getName());
  }

  private void revokeTokens(OidcLogoutAuthenticationToken logout) {
    OAuth2Authorization authorization =
        authorizations.findByToken(logout.getIdTokenHint(), ID_TOKEN);
    if (authorization == null) return;

    OAuth2Authorization.Builder revoked = OAuth2Authorization.from(authorization);
    if (authorization.getAccessToken() != null) {
      revoked.invalidate(authorization.getAccessToken().getToken());
    }
    if (authorization.getRefreshToken() != null) {
      revoked.invalidate(authorization.getRefreshToken().getToken());
    }
    OAuth2Authorization.Token<OidcIdToken> idToken = authorization.getToken(OidcIdToken.class);
    if (idToken != null) {
      revoked.invalidate(idToken.getToken());
    }
    authorizations.save(revoked.build());
    log.info(
        "event=oidc_logout_tokens_revoked authorization_id={} principal={}",
        authorization.getId(),
        authorization.getPrincipalName());
  }
}

package com.example.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.api.config.ControllerMethodLoggingAspect;
import com.example.api.config.ResourceServerConfig;
import com.example.api.model.DemoResource;
import com.example.api.model.DemoResourceMapper;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.aop.AopAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UserController.class)
@Import({ResourceServerConfig.class, ControllerMethodLoggingAspect.class})
@ImportAutoConfiguration(AopAutoConfiguration.class)
@ExtendWith(OutputCaptureExtension.class)
class UserControllerTests {
  @Autowired MockMvc mockMvc;
  @MockitoBean JwtDecoder jwtDecoder;
  @MockitoBean DemoResourceMapper resources;

  @Test
  void rejectsMissingToken() throws Exception {
    mockMvc.perform(get("/api/user")).andExpect(status().isUnauthorized());
  }

  @Test
  void returnsClaimsForProfileScope() throws Exception {
    var issuedAt = Instant.parse("2026-01-01T00:00:00Z");
    var expiresAt = issuedAt.plusSeconds(300);
    mockMvc
        .perform(
            get("/api/user")
                .with(
                    jwt()
                        .jwt(
                            token ->
                                token
                                    .subject("user")
                                    .issuer("https://authorization.example")
                                    .issuedAt(issuedAt)
                                    .expiresAt(expiresAt)
                                    .claim("scope", List.of("profile")))
                        .authorities(() -> "SCOPE_profile")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.subject").value("user"))
        .andExpect(jsonPath("$.issuer").value("https://authorization.example"))
        .andExpect(jsonPath("$.scopes[0]").value("profile"))
        .andExpect(jsonPath("$.issuedAt").exists())
        .andExpect(jsonPath("$.expiresAt").exists());
  }

  @Test
  void logsControllerParametersAndReturnValue(CapturedOutput output) throws Exception {
    mockMvc
        .perform(
            get("/api/user")
                .header("X-Request-ID", "controller-log-test")
                .with(
                    jwt()
                        .jwt(token -> token.subject("user").claim("scope", List.of("profile")))
                        .authorities(() -> "SCOPE_profile")))
        .andExpect(status().isOk());

    assertThat(output)
        .contains("event=controller_method")
        .contains("controller=UserController")
        .contains("method=user")
        .contains("arguments=")
        .contains("return=")
        .contains("user");
  }

  @Test
  void rejectsAuthenticatedTokenWithoutProfileScope() throws Exception {
    mockMvc.perform(get("/api/user").with(jwt())).andExpect(status().isForbidden());
  }

  @Test
  void rejectsOpenidScopeBecauseItDoesNotAuthorizeTheApi() throws Exception {
    mockMvc
        .perform(get("/api/user").with(jwt().authorities(() -> "SCOPE_openid")))
        .andExpect(status().isForbidden());
  }

  @Test
  void returnsOnlyResourcesOwnedByAuthenticatedSubject() throws Exception {
    var createdAt = Instant.parse("2026-01-01T00:00:00Z");
    when(resources.findAllByOwnerSubject("user"))
        .thenReturn(
            List.of(
                new DemoResource(
                    1,
                    "user",
                    "Protected demo",
                    "Stored in the resource schema",
                    "ACTIVE",
                    createdAt,
                    createdAt)));

    mockMvc
        .perform(
            get("/api/resources")
                .with(jwt().jwt(token -> token.subject("user")).authorities(() -> "SCOPE_profile")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].ownerSubject").value("user"))
        .andExpect(jsonPath("$[0].title").value("Protected demo"));

    verify(resources).findAllByOwnerSubject("user");
  }

  @Test
  void rejectsResourceListWithoutProfileScope() throws Exception {
    mockMvc.perform(get("/api/resources").with(jwt())).andExpect(status().isForbidden());
  }
}

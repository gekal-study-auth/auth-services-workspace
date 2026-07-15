package com.example.auth.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AuthorizationUiControllerTests {
  @Autowired MockMvc mockMvc;

  @Test
  void providesCsrfContextBeforeLogin() throws Exception {
    mockMvc
        .perform(get("/ui-api/login-context"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.authenticated").value(false))
        .andExpect(jsonPath("$.csrf.parameterName").value("_csrf"))
        .andExpect(jsonPath("$.csrf.token").isNotEmpty());
  }

  @Test
  void providesClientAndScopeDetailsForConsent() throws Exception {
    mockMvc
        .perform(
            get("/ui-api/consent-context")
                .with(user("user"))
                .param("client_id", "nextjs-client")
                .param("scope", "demo.read profile openid")
                .param("state", "state-value"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.clientName").value("Next.js BFF Client"))
        .andExpect(jsonPath("$.username").value("user"))
        .andExpect(jsonPath("$.state").value("state-value"))
        .andExpect(jsonPath("$.scopes.length()").value(3))
        .andExpect(jsonPath("$.scopes[0].name").value("openid"))
        .andExpect(jsonPath("$.scopes[0].required").value(true))
        .andExpect(jsonPath("$.scopes[0].locked").value(true))
        .andExpect(jsonPath("$.scopes[1].name").value("profile"))
        .andExpect(jsonPath("$.scopes[1].required").value(true))
        .andExpect(jsonPath("$.scopes[1].locked").value(false))
        .andExpect(jsonPath("$.scopes[2].name").value("demo.read"))
        .andExpect(jsonPath("$.scopes[2].required").value(false))
        .andExpect(jsonPath("$.scopes[2].defaultSelected").value(false))
        .andExpect(jsonPath("$.csrf.token").isNotEmpty());
  }
}

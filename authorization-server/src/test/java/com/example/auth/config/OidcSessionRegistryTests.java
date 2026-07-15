package com.example.auth.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class OidcSessionRegistryTests {
  @Autowired MockMvc mockMvc;
  @Autowired SessionRegistry sessionRegistry;

  @Test
  void registersFormLoginSessionForOidcLogout() throws Exception {
    var result =
        mockMvc
            .perform(
                post("/login").with(csrf()).param("username", "user").param("password", "password"))
            .andExpect(status().is3xxRedirection())
            .andReturn();

    HttpSession session = result.getRequest().getSession(false);
    assertThat(session).isNotNull();
    assertThat(sessionRegistry.getAllPrincipals())
        .anySatisfy(
            principal ->
                assertThat(sessionRegistry.getAllSessions(principal, false))
                    .anySatisfy(
                        information ->
                            assertThat(information.getSessionId()).isEqualTo(session.getId())));
  }
}

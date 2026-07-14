package com.example.api.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.api.config.ResourceServerConfig;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import(ResourceServerConfig.class)
class UserControllerTests {
    @Autowired MockMvc mockMvc;
    @MockitoBean JwtDecoder jwtDecoder;

    @Test
    void rejectsMissingToken() throws Exception {
        mockMvc.perform(get("/api/user")).andExpect(status().isUnauthorized());
    }

    @Test
    void returnsClaimsForProfileScope() throws Exception {
        mockMvc.perform(get("/api/user").with(jwt().jwt(token -> token.subject("user"))
                        .authorities(() -> "SCOPE_profile")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subject").value("user"));
    }
}

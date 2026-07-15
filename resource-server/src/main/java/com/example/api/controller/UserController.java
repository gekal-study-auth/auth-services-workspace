package com.example.api.controller;

import com.example.api.model.DemoResource;
import com.example.api.model.DemoResourceMapper;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserController {
  private final DemoResourceMapper resources;

  public UserController(DemoResourceMapper resources) {
    this.resources = resources;
  }

  @GetMapping("/user")
  Map<String, Object> user(@AuthenticationPrincipal Jwt jwt) {
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("subject", jwt.getSubject());
    result.put("issuer", jwt.getIssuer());
    result.put("scopes", jwt.getClaimAsStringList("scope"));
    result.put("issuedAt", jwt.getIssuedAt());
    result.put("expiresAt", jwt.getExpiresAt());
    return result;
  }

  @GetMapping("/resources")
  List<DemoResource> resources(@AuthenticationPrincipal Jwt jwt) {
    return resources.findAllByOwnerSubject(jwt.getSubject());
  }
}

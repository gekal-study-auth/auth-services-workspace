package com.example.api.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
  @GetMapping("/")
  Map<String, String> home() {
    return Map.of(
        "service", "resource-server",
        "status", "ok",
        "protectedResource", "/api/user");
  }
}

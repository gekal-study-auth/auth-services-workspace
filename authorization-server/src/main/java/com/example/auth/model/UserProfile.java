package com.example.auth.model;

import java.time.Instant;

public record UserProfile(
    String username,
    String displayName,
    String givenName,
    String familyName,
    String locale,
    String pictureUrl,
    Instant updatedAt) {}

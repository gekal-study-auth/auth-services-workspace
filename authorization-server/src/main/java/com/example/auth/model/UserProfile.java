package com.example.auth.model;

import java.time.Instant;

public record UserProfile(
    String username,
    String displayName,
    String givenName,
    String familyName,
    String locale,
    String pictureUrl,
    String email,
    boolean emailVerified,
    String addressFormatted,
    String addressStreet,
    String addressLocality,
    String addressRegion,
    String addressPostalCode,
    String addressCountry,
    String phoneNumber,
    boolean phoneNumberVerified,
    Instant updatedAt) {}

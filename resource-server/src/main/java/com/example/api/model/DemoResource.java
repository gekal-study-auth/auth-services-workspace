package com.example.api.model;

import java.time.Instant;

public record DemoResource(
    long id,
    String ownerSubject,
    String title,
    String description,
    String status,
    Instant createdAt,
    Instant updatedAt) {}

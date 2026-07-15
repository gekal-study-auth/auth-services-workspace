package com.example.api.model;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.JdbcTest;
import org.springframework.context.annotation.Import;

@JdbcTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(DemoResourceRepository.class)
class DemoResourceRepositoryTests {
  @Autowired DemoResourceRepository resources;

  @Test
  void loadsOnlyResourcesForRequestedSubject() {
    var result = resources.findAllByOwnerSubject("user");

    assertThat(result).hasSize(2).allMatch(resource -> resource.ownerSubject().equals("user"));
    assertThat(resources.findAllByOwnerSubject("another-user")).isEmpty();
  }
}

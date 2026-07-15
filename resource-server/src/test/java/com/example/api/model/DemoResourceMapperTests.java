package com.example.api.model;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;

@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class DemoResourceMapperTests {
  @Autowired DemoResourceMapper resources;

  @Test
  void loadsOnlyResourcesForRequestedSubject() {
    var result = resources.findAllByOwnerSubject("user");

    assertThat(result).hasSize(2).allMatch(resource -> resource.ownerSubject().equals("user"));
    assertThat(resources.findAllByOwnerSubject("another-user")).isEmpty();
  }
}

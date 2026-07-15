package com.example.auth.model;

import java.util.Optional;
import org.apache.ibatis.annotations.Arg;
import org.apache.ibatis.annotations.ConstructorArgs;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserProfileMapper {
  @Select(
      """
      SELECT username, display_name, given_name, family_name, locale, picture_url, updated_at
      FROM app_user_profile
      WHERE username = #{username}
      """)
  @ConstructorArgs({
    @Arg(column = "username", javaType = String.class),
    @Arg(column = "display_name", javaType = String.class),
    @Arg(column = "given_name", javaType = String.class),
    @Arg(column = "family_name", javaType = String.class),
    @Arg(column = "locale", javaType = String.class),
    @Arg(column = "picture_url", javaType = String.class),
    @Arg(column = "updated_at", javaType = java.time.Instant.class)
  })
  Optional<UserProfile> findByUsername(@Param("username") String username);
}

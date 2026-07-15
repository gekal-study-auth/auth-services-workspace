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
      SELECT username, display_name, given_name, family_name, locale, picture_url,
             email, email_verified, address_formatted, address_street, address_locality,
             address_region, address_postal_code, address_country,
             phone_number, phone_number_verified, updated_at
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
    @Arg(column = "email", javaType = String.class),
    @Arg(column = "email_verified", javaType = boolean.class),
    @Arg(column = "address_formatted", javaType = String.class),
    @Arg(column = "address_street", javaType = String.class),
    @Arg(column = "address_locality", javaType = String.class),
    @Arg(column = "address_region", javaType = String.class),
    @Arg(column = "address_postal_code", javaType = String.class),
    @Arg(column = "address_country", javaType = String.class),
    @Arg(column = "phone_number", javaType = String.class),
    @Arg(column = "phone_number_verified", javaType = boolean.class),
    @Arg(column = "updated_at", javaType = java.time.Instant.class)
  })
  Optional<UserProfile> findByUsername(@Param("username") String username);
}

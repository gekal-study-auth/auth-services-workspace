package com.example.api.model;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface ActiveAccessTokenMapper {
  @Select(
      """
      SELECT EXISTS (
          SELECT 1
          FROM authorization_server.oauth2_authorization
          WHERE access_token_value = #{tokenValue}
            AND access_token_expires_at > CURRENT_TIMESTAMP
            AND COALESCE(
                (CAST(access_token_metadata AS jsonb) ->> 'metadata.token.invalidated')::boolean,
                false
            ) = false
      )
      """)
  boolean isActive(String tokenValue);
}

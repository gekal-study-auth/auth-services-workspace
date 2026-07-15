package com.example.auth.model;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.stereotype.Repository;

@Repository
public class UserProfileRepository {
  private final JdbcOperations jdbc;

  public UserProfileRepository(JdbcOperations jdbc) {
    this.jdbc = jdbc;
  }

  public Optional<UserProfile> findByUsername(String username) {
    return jdbc.query(
        """
        select username, display_name, given_name, family_name, locale, picture_url, updated_at
        from app_user_profile
        where username = ?
        """,
        resultSet -> resultSet.next() ? Optional.of(map(resultSet)) : Optional.empty(),
        username);
  }

  private static UserProfile map(ResultSet resultSet) throws SQLException {
    return new UserProfile(
        resultSet.getString("username"),
        resultSet.getString("display_name"),
        resultSet.getString("given_name"),
        resultSet.getString("family_name"),
        resultSet.getString("locale"),
        resultSet.getString("picture_url"),
        resultSet.getTimestamp("updated_at").toInstant());
  }
}

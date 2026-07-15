package com.example.api.model;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.stereotype.Repository;

@Repository
public class DemoResourceRepository {
  private final JdbcOperations jdbc;

  public DemoResourceRepository(JdbcOperations jdbc) {
    this.jdbc = jdbc;
  }

  public List<DemoResource> findAllByOwnerSubject(String subject) {
    return jdbc.query(
        """
        select id, owner_subject, title, description, status, created_at, updated_at
        from demo_resource
        where owner_subject = ?
        order by created_at desc, id desc
        """,
        (resultSet, rowNumber) -> map(resultSet),
        subject);
  }

  private static DemoResource map(ResultSet resultSet) throws SQLException {
    return new DemoResource(
        resultSet.getLong("id"),
        resultSet.getString("owner_subject"),
        resultSet.getString("title"),
        resultSet.getString("description"),
        resultSet.getString("status"),
        resultSet.getTimestamp("created_at").toInstant(),
        resultSet.getTimestamp("updated_at").toInstant());
  }
}

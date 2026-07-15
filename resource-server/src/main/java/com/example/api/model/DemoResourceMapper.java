package com.example.api.model;

import java.util.List;
import org.apache.ibatis.annotations.Arg;
import org.apache.ibatis.annotations.ConstructorArgs;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface DemoResourceMapper {
  @Select(
      """
      SELECT id, owner_subject, title, description, status, created_at, updated_at
      FROM demo_resource
      WHERE owner_subject = #{subject}
      ORDER BY created_at DESC, id DESC
      """)
  @ConstructorArgs({
    @Arg(column = "id", javaType = long.class),
    @Arg(column = "owner_subject", javaType = String.class),
    @Arg(column = "title", javaType = String.class),
    @Arg(column = "description", javaType = String.class),
    @Arg(column = "status", javaType = String.class),
    @Arg(column = "created_at", javaType = java.time.Instant.class),
    @Arg(column = "updated_at", javaType = java.time.Instant.class)
  })
  List<DemoResource> findAllByOwnerSubject(@Param("subject") String subject);
}

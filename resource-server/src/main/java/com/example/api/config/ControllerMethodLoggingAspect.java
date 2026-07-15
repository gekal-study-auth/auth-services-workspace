package com.example.api.config;

import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Aspect
@Component
public class ControllerMethodLoggingAspect {
  private static final Logger log = LoggerFactory.getLogger(ControllerMethodLoggingAspect.class);
  private static final Pattern SENSITIVE_NAME =
      Pattern.compile("(?i).*(password|secret|token|code|verifier|authorization).*");
  private final ObjectMapper objectMapper;

  public ControllerMethodLoggingAspect(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Around(
      "within(com.example.api..*) && @within(org.springframework.web.bind.annotation.RestController)")
  public Object logControllerMethod(ProceedingJoinPoint joinPoint) throws Throwable {
    MethodSignature signature = (MethodSignature) joinPoint.getSignature();
    String controller = signature.getDeclaringType().getSimpleName();
    String method = signature.getName();
    String arguments = serialize(arguments(signature.getParameterNames(), joinPoint.getArgs()));
    long startedAt = System.nanoTime();
    try {
      Object result = joinPoint.proceed();
      log.info(
          "event=controller_method service=resource-server request_id={} controller={} method={} duration_ms={} arguments={} return={}",
          MDC.get(RequestCorrelationFilter.REQUEST_ID_MDC_KEY),
          controller,
          method,
          elapsedMillis(startedAt),
          arguments,
          serialize(result));
      return result;
    } catch (Throwable error) {
      log.warn(
          "event=controller_method_error service=resource-server request_id={} controller={} method={} duration_ms={} arguments={} exception={} message={}",
          MDC.get(RequestCorrelationFilter.REQUEST_ID_MDC_KEY),
          controller,
          method,
          elapsedMillis(startedAt),
          arguments,
          error.getClass().getSimpleName(),
          error.getMessage());
      throw error;
    }
  }

  private Map<String, Object> arguments(String[] names, Object[] values) {
    Map<String, Object> arguments = new LinkedHashMap<>();
    for (int index = 0; index < values.length; index++) {
      String name = names == null ? "arg" + index : names[index];
      arguments.put(name, safeValue(name, values[index]));
    }
    return arguments;
  }

  private Object safeValue(String name, Object value) {
    if (SENSITIVE_NAME.matcher(name).matches()) return "[REDACTED]";
    if (value instanceof Jwt jwt) return jwt.getClaims();
    if (value instanceof ServletRequest) return "[ServletRequest]";
    if (value instanceof ServletResponse) return "[ServletResponse]";
    return value;
  }

  private String serialize(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JacksonException error) {
      return '"' + String.valueOf(value) + '"';
    }
  }

  private long elapsedMillis(long startedAt) {
    return (System.nanoTime() - startedAt) / 1_000_000;
  }
}

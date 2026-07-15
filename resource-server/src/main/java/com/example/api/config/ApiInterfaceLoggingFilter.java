package com.example.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiInterfaceLoggingFilter extends OncePerRequestFilter {
  private static final Logger log = LoggerFactory.getLogger(ApiInterfaceLoggingFilter.class);
  private static final String REQUEST_ID_HEADER = "X-Request-ID";
  private final boolean includeBody;

  public ApiInterfaceLoggingFilter(
      @Value("${api.logging.include-body:false}") boolean includeBody) {
    this.includeBody = includeBody;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return "/actuator/health".equals(request.getRequestURI());
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String requestId = request.getHeader(REQUEST_ID_HEADER);
    if (requestId == null || !requestId.matches("[A-Za-z0-9._-]{1,128}")) {
      requestId = UUID.randomUUID().toString();
    }
    if (!includeBody) {
      logMetadata(request, response, filterChain, requestId);
      return;
    }
    ContentCachingRequestWrapper requestWrapper =
        new ContentCachingRequestWrapper(request, Integer.MAX_VALUE);
    ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);
    responseWrapper.setHeader(REQUEST_ID_HEADER, requestId);
    long startedAt = System.nanoTime();
    try {
      filterChain.doFilter(requestWrapper, responseWrapper);
    } finally {
      long durationMs = (System.nanoTime() - startedAt) / 1_000_000;
      log.info(
          "event=api_interface service=resource-server request_id={} method={} path={} status={} duration_ms={} request_body={} response_body={}",
          requestId,
          request.getMethod(),
          request.getRequestURI(),
          responseWrapper.getStatus(),
          durationMs,
          body(requestWrapper.getContentAsByteArray(), requestWrapper.getCharacterEncoding()),
          body(responseWrapper.getContentAsByteArray(), responseWrapper.getCharacterEncoding()));
      responseWrapper.copyBodyToResponse();
    }
  }

  private void logMetadata(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain,
      String requestId)
      throws ServletException, IOException {
    response.setHeader(REQUEST_ID_HEADER, requestId);
    long startedAt = System.nanoTime();
    try {
      filterChain.doFilter(request, response);
    } finally {
      long durationMs = (System.nanoTime() - startedAt) / 1_000_000;
      log.info(
          "event=api_interface service=resource-server request_id={} method={} path={} status={} duration_ms={}",
          requestId,
          request.getMethod(),
          request.getRequestURI(),
          response.getStatus(),
          durationMs);
    }
  }

  private String body(byte[] content, String encoding) {
    Charset charset = encoding == null ? StandardCharsets.UTF_8 : Charset.forName(encoding);
    return new String(content, charset);
  }
}

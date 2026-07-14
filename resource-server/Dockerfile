# syntax=docker/dockerfile:1

FROM eclipse-temurin:17-jdk-noble AS builder
WORKDIR /app

COPY gradlew ./
COPY gradle gradle
COPY build.gradle settings.gradle ./
COPY authorization-server/build.gradle authorization-server/
COPY resource-server/build.gradle resource-server/
COPY resource-server/src resource-server/src
RUN --mount=type=cache,target=/root/.gradle \
    ./gradlew :resource-server:bootJar --no-daemon

FROM eclipse-temurin:17-jdk-noble AS extractor
WORKDIR /builder
COPY --from=builder /app/resource-server/build/libs/resource-server-*.jar application.jar
RUN java -Djarmode=tools -jar application.jar extract --layers --destination extracted

FROM eclipse-temurin:17-jre-noble
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system appuser \
    && useradd --system --gid appuser appuser \
    && mkdir -p /app \
    && chown appuser:appuser /app
WORKDIR /app
USER appuser
COPY --from=extractor /builder/extracted/dependencies/ ./
COPY --from=extractor /builder/extracted/spring-boot-loader/ ./
COPY --from=extractor /builder/extracted/snapshot-dependencies/ ./
COPY --from=extractor /builder/extracted/application/ ./
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java ${JAVA_OPTS} -jar /app/application.jar"]

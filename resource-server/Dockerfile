FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /workspace

COPY gradlew gradlew.bat settings.gradle build.gradle ./
COPY gradle ./gradle
COPY authorization-server/build.gradle authorization-server/build.gradle
COPY resource-server/build.gradle resource-server/build.gradle
COPY resource-server/src resource-server/src
RUN ./gradlew :resource-server:bootJar --no-daemon

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system spring \
    && useradd --system --gid spring spring
USER spring
COPY --from=builder /workspace/resource-server/build/libs/resource-server-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

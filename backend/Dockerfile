# Multi-stage Dockerfile for CP25MS1-backend
# Build stage: use Maven with Eclipse Temurin 21
FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy maven wrapper & pom first to leverage Docker cache for deps
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Copy sources
COPY src ./src
COPY pom.xml ./

# Run a Maven package to build the fat jar (skip tests for faster builds; remove -DskipTests locally if you want tests)
RUN mvn -B -DskipTests package

# Runtime stage: slim JRE image
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy jar from build stage (uses wildcard to accommodate versioned jar name)
ARG JAR_FILE=target/*.jar
COPY --from=build /workspace/target/*.jar /app/app.jar

# Application runs on port 8000 (matches src/main/resources/application.yml)
EXPOSE 8000

# Use a non-root user if desired (commented out for maximum compatibility)
# RUN addgroup --system app && adduser --system --ingroup app app
# USER app

ENV TZ=UTC
ENTRYPOINT ["java","-jar","/app/app.jar"]


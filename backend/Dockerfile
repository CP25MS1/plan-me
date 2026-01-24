FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml mvnw ./
COPY .mvn .mvn

RUN mvn -q -DskipTests dependency:go-offline

COPY src ./src

RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /workspace/target/*.jar /app/app.jar

ENV TZ=UTC

ENTRYPOINT ["java","-jar","/app/app.jar"]

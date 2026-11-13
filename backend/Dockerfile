# API do portfólio (Spring Boot 3 / Java 21). O Render constrói esta imagem a partir de backend/.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src src
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/portfolio-api-*.jar app.jar
# O plano gratuito tem pouca memória: a JVM usa no máximo 75% do que o contêiner tiver.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"
EXPOSE 8080
CMD ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]

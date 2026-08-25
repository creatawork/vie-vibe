FROM eclipse-temurin:17-jre
COPY server.jar /app/app.jar
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

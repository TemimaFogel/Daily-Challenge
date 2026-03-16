FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY . .
RUN mvn package -DskipTests
CMD ["java","-jar","target/*.jar"]

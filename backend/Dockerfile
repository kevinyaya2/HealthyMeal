# 建置階段 (Build Stage)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# 打包專案，跳過測試以加快速度
RUN mvn clean package -DskipTests

# 執行階段 (Run Stage)
FROM eclipse-temurin:17-jre
WORKDIR /app
# 複製建置好的 jar 檔
COPY --from=build /app/target/*.jar app.jar
# 因為 Spring Boot 預設跑 8080 port，Render 會自己檢測
EXPOSE 8080
# 啟動應用程式
ENTRYPOINT ["java", "-jar", "app.jar"]

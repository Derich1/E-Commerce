ARG ARG_PLATFORM=linux/amd64
FROM --platform=${ARG_PLATFORM} openjdk:23-jdk-slim
LABEL maintainer="Derich Rosário"
# Defina o diretório de trabalho no container
WORKDIR /app

# Copie o arquivo .jar para o diretório de trabalho do container
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

# Defina o comando de inicialização
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
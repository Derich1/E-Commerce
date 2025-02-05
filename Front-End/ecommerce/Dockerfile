# Etapa 1: Construir a aplicação
FROM node:22 AS build

WORKDIR /app

# Copiar o package.json e o package-lock.json
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Construir a aplicação para produção
RUN npm run build

# Etapa 2: Servir a aplicação
FROM nginx:alpine

# Copiar os arquivos dist do estágio de build
COPY --from=build /app/dist /usr/share/nginx/html

# Expor a porta 80 (porta padrão do nginx)
EXPOSE 80

# Iniciar o nginx para servir a aplicação
CMD ["nginx", "-g", "daemon off;"]

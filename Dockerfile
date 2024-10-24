FROM node:14

# Establece el directorio de trabajo
WORKDIR /app

# Copia el archivo package.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Instala Ngrok
RUN npm install ngrok

# Copia el resto del código
COPY . .

# Establece las variables de entorno
ENV WEBHOOK_VERIFY_TOKEN=${WEBHOOK_VERIFY_TOKEN}
ENV GRAPH_API_TOKEN=${GRAPH_API_TOKEN}
ENV NGROK_HTTP_PORT=3000

# Exponer puertos
EXPOSE 3000 4040
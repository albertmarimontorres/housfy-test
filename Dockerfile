FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copiar el proyecto cuando exista (si no existe, no pasa nada)
COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host"]

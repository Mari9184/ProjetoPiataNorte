# ---------- etapa 1: build Angular ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

# ---------- etapa 2: Nginx ----------
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/piata-norte/browser /usr/share/nginx/html

EXPOSE 80
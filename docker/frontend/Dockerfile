FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY package-lock*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=http://backend:4000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:alpine

RUN mkdir -p /etc/nginx/certs
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]

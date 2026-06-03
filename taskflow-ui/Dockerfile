# ── Stage 1: Build React app ─────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY public ./public
COPY src ./src
RUN npm run build

# ── Stage 2: Serve with nginx ─────────────────────────────────────
FROM nginx:alpine AS runtime

# Copy built assets
COPY --from=build /app/build /usr/share/nginx/html

# nginx config: proxy /api calls to Spring Boot, serve React for everything else
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

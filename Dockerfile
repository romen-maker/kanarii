# syntax=docker/dockerfile:1

# 1. Base Stage: Node 22 Alpine + tini para manejo limpio de señales UNIX
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache tini

# 2. Dev-Deps Stage: Instala TODAS las dependencias (incluyendo devDependencies) para compilar vite
FROM base AS dev-deps
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN npm ci --include=dev

# 3. Build Stage: Compila la SPA estática en /dist
FROM base AS build
WORKDIR /app
ENV NODE_ENV=development
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .

ARG VITE_API_BASE=/api/v1
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_HD_API_KEY
ARG VITE_HD_API_URL

ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
ENV VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
ENV VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}
ENV VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
ENV VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}
ENV VITE_HD_API_KEY=${VITE_HD_API_KEY}
ENV VITE_HD_API_URL=${VITE_HD_API_URL}

RUN npm run build

# 4. Prod-Deps Stage: Instala EXCLUSIVAMENTE dependencias de producción para el runtime
FROM base AS prod-deps
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# 5. Runner Stage: Imagen final ultraliviana para Coolify
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY package.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["tini", "--"]
CMD ["npm", "start"]

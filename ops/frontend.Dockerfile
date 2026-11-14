FROM node:24.18.0-bookworm-slim@sha256:6f7b03f7c2c8e2e784dcf9295400527b9b1270fd37b7e9a7285cf83b6951452d AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=1536
COPY package.json package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund
COPY . .
# Static generation reads already-public HTTPS content. It never loads production credentials.
ARG DJANGO_INTERNAL_API_URL=https://lunador.ro
ENV DJANGO_INTERNAL_API_URL=${DJANGO_INTERNAL_API_URL} DJANGO_API_PROXY_TARGET=http://backend:8010 NEXT_PUBLIC_SITE_URL=https://lunador.ro 
RUN npm run build

FROM node:24.18.0-bookworm-slim@sha256:6f7b03f7c2c8e2e784dcf9295400527b9b1270fd37b7e9a7285cf83b6951452d AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=512 MALLOC_ARENA_MAX=2 DJANGO_INTERNAL_API_URL=http://backend:8010 DJANGO_API_PROXY_TARGET=http://backend:8010 NEXT_PUBLIC_SITE_URL=https://lunador.ro 
RUN groupadd --gid 20012 app && useradd --no-log-init --uid 20012 --gid 20012 --no-create-home --shell /usr/sbin/nologin app
COPY --from=build --chown=20012:20012 /app/ /app/
USER 20012:20012
EXPOSE 3010
CMD ["node", "node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0", "--port", "3010", "--keepAliveTimeout", "70000"]

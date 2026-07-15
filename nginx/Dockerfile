# syntax=docker/dockerfile:1

FROM node:24.12.0-bookworm-slim AS authorization-ui-builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY authorization-ui/package.json authorization-ui/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts
COPY authorization-ui ./
RUN npm run build

FROM gekal/nginx-local-domains:latest-gekal

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=authorization-ui-builder /app/out /usr/share/nginx/html/authorization-ui

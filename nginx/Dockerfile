# syntax=docker/dockerfile:1

# local.gekal.cn の証明書を提供する専用イメージ。
FROM --platform=linux/amd64 gekal/nginx-local-domains:latest-gekal AS certificates

# Nginx本体、entrypoint、CMDは公式イメージから利用する。
FROM nginx:1.28.0-bookworm

RUN apt-get update \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/*

COPY --from=certificates /certs/local.gekal.cn /etc/nginx/certs/local.gekal.cn
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

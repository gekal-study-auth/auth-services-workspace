# syntax=docker/dockerfile:1

FROM golang:1.26.5-bookworm AS gosu-builder
RUN git clone --depth 1 --branch 1.19 https://github.com/tianon/gosu.git /src/gosu \
    && cd /src/gosu \
    && CGO_ENABLED=0 go build -trimpath -o /go/bin/gosu .

FROM postgres:18.4-bookworm
COPY --from=gosu-builder /go/bin/gosu /usr/local/bin/gosu
RUN apt-get update && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/* \
    && gosu --version \
    && gosu nobody true

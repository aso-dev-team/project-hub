# Dev container image for the attached `api` workspace service.
FROM node:24-bookworm AS node

FROM golang:1.24-bookworm AS golang

FROM mcr.microsoft.com/dotnet/sdk:10.0

COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=golang /usr/local/go /usr/local/go

ENV PATH="/usr/local/go/bin:${PATH}"

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  git curl ca-certificates postgresql-client \
  && ln -sf ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -sf ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
 && ln -sf ../lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack \
 && rm -rf /var/lib/apt/lists/* \
 && corepack enable \
 && corepack prepare pnpm@10.18.1 --activate

WORKDIR /workspaces/repo

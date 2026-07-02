# Dev container images for the local Compose development stack.
FROM node:lts AS web

RUN npm install --global pnpm@latest

WORKDIR /app
USER node
CMD ["bash", "-lc", "CI=true pnpm install --frozen-lockfile && pnpm --dir web exec next dev --webpack --hostname 0.0.0.0 --port 3000"]

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  git \
  curl \
  ca-certificates \
  fonts-noto-cjk \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p \
  /home/ubuntu/.cache/ms-playwright \
  /home/ubuntu/.local/share/pnpm/store \
  /home/ubuntu/.nuget/packages \
  /home/ubuntu/go/pkg/mod \
  && chown -R ubuntu:ubuntu \
  /home/ubuntu/.cache \
  /home/ubuntu/.local \
  /home/ubuntu/.nuget \
  /home/ubuntu/go

WORKDIR /app
CMD ["sleep", "infinity"]

#!/usr/bin/env bash
set -euo pipefail

if [ -n "${NVM_DIR:-}" ] && [ -s "${NVM_DIR}/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "${NVM_DIR}/nvm.sh"
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required. Ensure the Dev Container node feature installed pnpm." >&2
  exit 1
fi

user_home="$(getent passwd "$(id -u)" | cut -d: -f6)"
if [ -z "${user_home}" ]; then
  user_home="${HOME:-}"
fi
if [ -z "${user_home}" ]; then
  echo "Could not determine the current user's home directory." >&2
  exit 1
fi
export HOME="${user_home}"

if [ "$(id -u)" -eq 0 ]; then
  mkdir -p \
    "${HOME}/.cache/ms-playwright" \
    "${HOME}/.local/share/pnpm/store" \
    "${HOME}/.nuget/packages" \
    "${HOME}/go/pkg/mod"
else
  sudo mkdir -p \
    "${HOME}/.cache/ms-playwright" \
    "${HOME}/.local/share/pnpm/store" \
    "${HOME}/.nuget/packages" \
    "${HOME}/go/pkg/mod"
  sudo chown -R "$(id -u):$(id -g)" \
    "${HOME}/.cache" \
    "${HOME}/.local" \
    "${HOME}/.nuget" \
    "${HOME}/go"
fi

pnpm install --frozen-lockfile

if [ "$(id -u)" -eq 0 ]; then
  pnpm exec playwright install-deps chromium
else
  sudo env "PATH=${PATH}" "NVM_DIR=${NVM_DIR:-}" "PROJECT_DIR=$(pwd)" bash -lc \
    'cd "$PROJECT_DIR"; if [ -n "${NVM_DIR:-}" ] && [ -s "${NVM_DIR}/nvm.sh" ]; then . "${NVM_DIR}/nvm.sh"; fi; pnpm exec playwright install-deps chromium'
fi

if [ "$(id -u)" -eq 0 ]; then
  pnpm exec playwright install chrome
else
  sudo env "PATH=${PATH}" "NVM_DIR=${NVM_DIR:-}" "PROJECT_DIR=$(pwd)" bash -lc \
    'cd "$PROJECT_DIR"; if [ -n "${NVM_DIR:-}" ] && [ -s "${NVM_DIR}/nvm.sh" ]; then . "${NVM_DIR}/nvm.sh"; fi; pnpm exec playwright install chrome'
fi

pnpm exec playwright install chromium --only-shell

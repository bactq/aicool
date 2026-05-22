#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

VERSION="${DEFAULT_VERSION}"
IDENTIFIER="com.webcool.server"
SKIP_BUILD=0

while [ $# -gt 0 ]; do
  case "$1" in
    --version)
      VERSION="$2"
      shift 2
      ;;
    --identifier)
      IDENTIFIER="$2"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    *)
      echo "unknown option: $1" >&2
      exit 1
      ;;
  esac
done

require_cmd pkgbuild

if [ "$SKIP_BUILD" -eq 0 ]; then
  build_webcool_binary
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

stage_runtime_tree "${tmp_dir}/root"

mkdir -p "${PACKAGE_ROOT}/mac"
out_pkg="${PACKAGE_ROOT}/mac/webcool-${VERSION}-macos-$(uname -m).pkg"

log "building macOS package: ${out_pkg}"
pkgbuild \
  --root "${tmp_dir}/root" \
  --identifier "${IDENTIFIER}" \
  --version "${VERSION}" \
  "${out_pkg}"

log "done: ${out_pkg}"

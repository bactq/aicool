#!/usr/bin/env bash

set -euo pipefail

PACKAGE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBCOOL_ROOT="$(cd "${PACKAGE_ROOT}/.." && pwd)"
PROJECT_ROOT="$(cd "${WEBCOOL_ROOT}/.." && pwd)"
ACL_ROOT="${PROJECT_ROOT}/third-party/acl"
SQLITE_ROOT="${PROJECT_ROOT}/third-party/sqlite"
TOOLS_ROOT="${PROJECT_ROOT}/tools"

detect_default_version() {
  local fallback="1.0.0"
  local bin_path="${WEBCOOL_ROOT}/webcool"
  local ver

  if [ -x "$bin_path" ]; then
    ver="$($bin_path -v 2>/dev/null | head -n 1 | tr -d '[:space:]')"
    if [ -n "$ver" ]; then
      printf '%s\n' "$ver"
      return 0
    fi
  fi

  printf '%s\n' "$fallback"
}

DEFAULT_VERSION="$(detect_default_version)"
DEFAULT_RELEASE="1"

log() {
  printf '[package] %s\n' "$*"
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    printf 'missing command: %s\n' "$cmd" >&2
    exit 1
  fi
}

build_webcool_binary() {
  log "building webcool binary"
  make -C "${WEBCOOL_ROOT}" all
}

copy_if_exists() {
  local src="$1"
  local dst="$2"
  if [ -e "$src" ]; then
    cp -a "$src" "$dst"
  fi
}

copy_acl_runtime_libs() {
  local lib_dst="$1"
  mkdir -p "$lib_dst"

  local lib_dir
  for lib_dir in \
    "${ACL_ROOT}/lib_acl/lib" \
    "${ACL_ROOT}/lib_acl_cpp/lib" \
    "${ACL_ROOT}/lib_protocol/lib" \
    "${ACL_ROOT}/lib_fiber/lib"; do
    if [ -d "$lib_dir" ]; then
      find "$lib_dir" -maxdepth 1 -type f \( -name '*.so' -o -name '*.so.*' -o -name '*.dylib' \) -exec cp -a {} "$lib_dst" \;
    fi
  done
}

copy_sqlite_runtime_lib() {
  local lib_dst="$1"
  local sqlite_src="${SQLITE_ROOT}/lib/sqlite3.so"

  if [ ! -f "$sqlite_src" ]; then
    printf 'sqlite runtime library not found: %s\n' "$sqlite_src" >&2
    exit 1
  fi

  mkdir -p "$lib_dst"
  cp -a "$sqlite_src" "${lib_dst}/sqlite3.so"
}

create_launcher_script() {
  local launch_path="$1"
  cat > "$launch_path" <<'EOF'
#!/bin/sh

BASE_DIR="/opt/webcool"
if [ -d "$BASE_DIR/lib" ]; then
  export LD_LIBRARY_PATH="$BASE_DIR/lib:${LD_LIBRARY_PATH:-}"
  export DYLD_LIBRARY_PATH="$BASE_DIR/lib:${DYLD_LIBRARY_PATH:-}"
fi
if [ -x "$BASE_DIR/bin/ffmpeg" ] && [ -z "${AICOOL_FFMPEG:-}" ]; then
  export AICOOL_FFMPEG="$BASE_DIR/bin/ffmpeg"
fi
if [ -f "$BASE_DIR/lib/sqlite3.so" ] && [ -z "${AICOOL_SQLITE_LIB:-}" ]; then
  export AICOOL_SQLITE_LIB="$BASE_DIR/lib/sqlite3.so"
fi

cd "$BASE_DIR"
exec "$BASE_DIR/webcool" "$@"
EOF
  chmod 0755 "$launch_path"
}

copy_ffmpeg_runtime_bin() {
  local bin_dst="$1"
  local ffmpeg_src=""

  case "$(uname -s)" in
    Darwin)
      ffmpeg_src="${TOOLS_ROOT}/mac/ffmpeg"
      ;;
    Linux)
      ffmpeg_src="${TOOLS_ROOT}/linux/ffmpeg"
      ;;
    *)
      printf 'unsupported build host for ffmpeg packaging: %s\n' "$(uname -s)" >&2
      exit 1
      ;;
  esac

  if [ ! -f "$ffmpeg_src" ]; then
    printf 'ffmpeg runtime binary not found: %s\n' "$ffmpeg_src" >&2
    exit 1
  fi

  mkdir -p "$bin_dst"
  cp -a "$ffmpeg_src" "${bin_dst}/ffmpeg"
  chmod 0755 "${bin_dst}/ffmpeg"
}

stage_runtime_tree() {
  local stage_root="$1"
  local install_root="${stage_root}/opt/webcool"

  mkdir -p "$install_root" "${stage_root}/usr/local/bin"

  if [ ! -x "${WEBCOOL_ROOT}/webcool" ]; then
    printf 'webcool binary not found: %s\n' "${WEBCOOL_ROOT}/webcool" >&2
    printf 'run make in webcool directory first, or remove --skip-build\n' >&2
    exit 1
  fi

  cp -a "${WEBCOOL_ROOT}/webcool" "$install_root/webcool"
  copy_if_exists "${WEBCOOL_ROOT}/html" "$install_root/"

  mkdir -p "$install_root/uploads" "$install_root/lib" "$install_root/bin"
  copy_acl_runtime_libs "$install_root/lib"
  copy_sqlite_runtime_lib "$install_root/lib"
  copy_ffmpeg_runtime_bin "$install_root/bin"

  create_launcher_script "${stage_root}/usr/local/bin/webcool"
}

map_deb_arch() {
  local m
  m="$(uname -m)"
  case "$m" in
    x86_64) echo amd64 ;;
    aarch64|arm64) echo arm64 ;;
    *) echo "$m" ;;
  esac
}

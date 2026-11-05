#!/bin/zsh
set -e
WEBSITE_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
cd "$WEBSITE_DIR"
RUNTIME_DIR="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies"
if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
elif [[ -x "$RUNTIME_DIR/node/bin/node" ]]; then
  NODE_BIN="$RUNTIME_DIR/node/bin/node"
  export PATH="$RUNTIME_DIR/node/bin:$PATH"
else
  print '找不到Node.js。請安裝Node.js 22.12以上，再重新啟動。'
  exit 1
fi
if [[ ! -f node_modules/vite/bin/vite.js ]]; then
  if command -v pnpm >/dev/null 2>&1; then
    pnpm install
  elif [[ -x "$RUNTIME_DIR/bin/fallback/pnpm" ]]; then
    "$RUNTIME_DIR/bin/fallback/pnpm" install
  else
    print '請先在web資料夾執行pnpm install。'
    exit 1
  fi
fi
EXISTING_PAGE="$(/usr/bin/curl --silent --max-time 2 http://127.0.0.1:5173/ || true)"
if [[ "$EXISTING_PAGE" == *'<title>餘燼裡的第六人</title>'* ]]; then
  print '網站已啟動：http://127.0.0.1:5173/'
  /usr/bin/open 'http://127.0.0.1:5173/'
  exit 0
fi
"$NODE_BIN" scripts/prepare-assets.mjs
print '網站網址：http://127.0.0.1:5173/。保持此視窗開啟；按Control+C停止。'
"$NODE_BIN" node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort

#!/bin/bash
# Deploy klikalnego symulatora GLCRM na enklava.co/files/glcrm/ (bez basic — files/ jest noaidi-writable)
set -euo pipefail

REPO=/home/noaidi/greenleaf-crm
BASE=/files/glcrm
DEST=/var/www/enklava/files/glcrm

cd "$REPO"
echo "🔨 Build (basePath=$BASE)..."
NEXT_PUBLIC_BASE_PATH="$BASE" npm run build

echo "🚀 Deploy -> $DEST"
rm -rf "$DEST"
mkdir -p "$DEST"
cp -r out/. "$DEST/"
# Next static export nie tworzy .nojekyll, ale nginx serwuje _next/ bez problemu
echo "✅ Live: https://enklava.co${BASE}/"

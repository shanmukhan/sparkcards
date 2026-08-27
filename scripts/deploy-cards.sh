#!/bin/bash
# Pushes a freshly generated cards.json straight to the deployed Pi, without
# rebuilding or redeploying the rest of the app. Use this for a monthly
# content refresh: add/edit cards in src/data/*.ts, then run this script.
set -euo pipefail

cd "$(dirname "$0")/.."

PI_HOST="${PI_HOST:-lipi@192.168.1.13}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/html/sparkcards/cards.json}"

npm run generate:cards

echo "Uploading public/cards.json to $PI_HOST:$REMOTE_PATH ..."
scp public/cards.json "$PI_HOST:/home/lipi/cards.json"
ssh "$PI_HOST" "sudo cp /home/lipi/cards.json '$REMOTE_PATH' && sudo chown www-data:www-data '$REMOTE_PATH' && rm /home/lipi/cards.json"

echo "Done. Users will pick up the new content on their next visit (no rebuild needed)."

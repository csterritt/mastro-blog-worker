#!/bin/bash
set -euo pipefail

bun scripts/build-gallery.ts
bun run generate
rm -rf ../blog-worker/public/[agirs]*
mv generated/* ../blog-worker/public
cd ../blog-worker
npm run deploy
cd ../blog-and-gallery

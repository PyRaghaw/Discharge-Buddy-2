#!/bin/bash
set -e
pnpm install --frozen-lockfile
bash scripts/patch-expo-cors.sh
pnpm --filter db push

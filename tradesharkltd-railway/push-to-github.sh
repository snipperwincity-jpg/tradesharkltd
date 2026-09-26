#!/usr/bin/env bash
# One-step push of this project to GitHub so Railway can auto-deploy it.
# Usage:  bash push-to-github.sh https://github.com/<user>/<repo>.git
set -e
REPO_URL="${1:-https://github.com/olybless89-cyber/tradesharkltd.git}"
git init -q 2>/dev/null || true
git checkout -q -B main
git add -A
git commit -q -m "TradeShark: Railway-ready full-stack build" || echo "(nothing new to commit)"
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"
git push -u origin main --force
echo "Pushed to $REPO_URL (branch main). Railway will build and deploy automatically once the service is connected."

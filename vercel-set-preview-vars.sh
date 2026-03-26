#!/bin/bash

# inspired by conversation here: https://github.com/get-convex/convex-backend/issues/123
# and here: https://discord.com/channels/1019350475847499849/1019350478817079338/1467722898067292324

# Preview environment specific variables
if [ "$VERCEL_TARGET_ENV" = "preview" ]; then
  SITE_URL="https://$VERCEL_BRANCH_URL"
  echo "Setting SITE_URL to $SITE_URL"
  npx convex env set --preview-name $VERCEL_GIT_COMMIT_REF SITE_URL $SITE_URL

elif [ "$VERCEL_TARGET_ENV" = "production" ]; then
  SITE_URL="https://$VERCEL_PROJECT_PRODUCTION_URL"
  echo "Setting SITE_URL to $SITE_URL"
  npx convex env set --preview-name $VERCEL_GIT_COMMIT_REF SITE_URL $SITE_URL
fi

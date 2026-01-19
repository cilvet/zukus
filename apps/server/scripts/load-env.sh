#!/bin/bash
# Load environment variables from root .env file

if [ -f "../../.env" ]; then
  set -a
  source ../../.env
  set +a
fi

exec "$@"

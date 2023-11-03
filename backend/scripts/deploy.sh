#!/bin/bash

if [ "$1" != "dev" ] && [ "$1" != "prod" ]; then
  echo "----- ERR: \$1 should be either 'dev' or 'prod' -----"
  exit 1
fi

source .env.$1

if [ -z "$PROFILE" ]; then
  echo "----- ERR: PROFILE should be provided' -----"
  exit 1
fi

if [ -z "$STACK_NAME" ]; then
  echo "----- ERR: STACK_NAME should be provided' -----"
  exit 1
fi

echo "stack name: $STACK_NAME"
echo "profile: $PROFILE"

ENVIRONMENT=$1 cdk deploy -O exports.json --profile=$PROFILE --require-approval never

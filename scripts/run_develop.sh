#! /bin/bash -xe

git config --global --add safe.directory /code

yarn install --frozen-lockfile
yarn start

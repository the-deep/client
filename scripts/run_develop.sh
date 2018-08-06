#!/bin/bash -x

DEV_LANG_FILE=/code/src/redux/initial-state/dev-lang.json
STRING_SERVER_FILE=/code/src/utils/string_server.js
node $STRING_SERVER_FILE 5000 $DEV_LANG_FILE &

yarn add --force node-sass@4.7.2
yarn start

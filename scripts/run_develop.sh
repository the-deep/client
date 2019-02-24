#!/bin/bash -x

DEV_LANG_FILE=/code/src/redux/initial-state/dev-lang.json
STRING_SERVER_FILE=/code/src/utils/string_server.js

yarn install

node $STRING_SERVER_FILE 5000 $DEV_LANG_FILE &

yarn start

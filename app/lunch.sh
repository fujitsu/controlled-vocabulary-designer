#!/bin/bash

npm config -g set https-proxy ${HTTPS_PROXY}
npm install
npm run build
npm run watch &
npm run start
tail -f /dev/null

#!/bin/bash
yarn pkg ./build/app.js --no-bytecode --public-packages \"*\" --public --out-dir ./dist
cp config.example.jsonc ./dist/config.jsonc
mv ./dist/app-linux ./dist/thdownloader-linux-x64
mv ./dist/app-macos ./dist/thdownloader-macos-x64
mv ./dist/app-win.exe ./dist/thdownloader-windows-x64.exe
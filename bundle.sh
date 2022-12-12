#!/bin/bash
yarn pkg ./build/app.js --no-bytecode --public-packages \"*\" --public --out-dir ./dist
cp config.example.jsonc ./dist/config.jsonc

mv ./dist/app-linux ./dist/thdownloader-linux-x64
mv ./dist/app-macos ./dist/thdownloader-macos-x64
mv ./dist/app-win.exe ./dist/thdownloader-windows-x64.exe

cd dist 
zip thdownloader-linux-x64.zip thdownloader-linux-x64 config.jsonc
zip thdownloader-macos-x64.zip thdownloader-macos-x64 config.jsonc
zip thdownloader-windows-x64.zip thdownloader-windows-x64.exe config.jsonc

rm thdownloader-windows-x64.exe thdownloader-linux-x64 thdownloader-macos-x64 config.jsonc
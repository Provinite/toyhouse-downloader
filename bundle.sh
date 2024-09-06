#!/bin/bash
# Bundle the (already-built) application for distribution
# uses npm `pkg` package to create a standalone executable
# which bundles application code, node.js runtime, dependencies,
# and a few other static assets into a single executable file
# for each supported platform.
# This script is intended to be run after `compile.sh` script.
#
# Preconditions: A runnable instance of the app is already built
# in the `build` directory.
#
# Postconditions: The `dist` folder contains a zip file for each
# supported platform, containing the standalone executable and other
# external assets intended for humans to work with (readme, config file).
#
# Note: This script depends on several pkg config options defined in `package.json`
# Supported platforms: macos, linux, win
# Supported architecture: x64

# Generate the standalone executables for each platform
yarn pkg build/src/app.js \
  --config package.json   \
  --no-bytecode           \
  --public-packages \"*\" \
  --public

cd dist
# Create a zip file for each platform
for platform in linux macos win
do
  ext=
  if [ $platform = "win" ]; then
    ext=".exe"
  fi
  zip --junk-paths "toyhouse-downloader-$platform-x64.zip"  \
    "./@clovercoin/toyhouse-downloader-$platform$ext"       \
    "../config.example.jsonc"                               \
    "../README.md"
done
rm -rf "./@clovercoin"
# toyhouse-downloader

This application can be used to download the bulk of your character
information from toyhou.se to your local computer.

# Quick Start Guide

## Explanation of files

- `config.jsonc`
  - Settings for the application. Customize this file.
  - Note, if you want to work with multiple toyhouse accounts, you'll probably just want
    to have multiple copies of this entire app. Otherwise, ensure you remove the `cookies.json`,
    and `characters` directory after changing your username.
- `./lib`
  - Installation point for chromium

## Generated Files

- `output.log`
  - Full log of the entire run
- `cookies.json`
  - cached cookies storing your toyhouse session between runs.
  - Delete this file to log in fresh
- `characters/characters.json`
  - list of all of your characters ids, names, and links
  - Delete this file to reload the character list
- `characters/xxxx.json`
  - Each character will have a json file with its detailed profile information, and gallery image data
  - Delete one of these to re-fetch that character
- `characters/xxxx-profile.jpg`
  - Screenshot of character `xxxx`'s profile
- `characters/galleries/xxxx/*.png`
  - Gallery images from character `xxxx`'s gallery
  - Delete these to have them be re-downloaded

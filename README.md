<a href='https://ko-fi.com/clovercoin' target='_blank'>
  <img height='35' style='border:0px;height:46px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' alt='Buy Me a Coffee at ko-fi.com' />
</a>

# toyhouse-downloader

**USE AT YOUR OWN RISK**

Many people have a huge amount of value in their toyhouse accounts. Backing up your toyhouse
characters is too hard. This tool makes it easy to be sure that you won't lose your valuable
characters, profiles, and galleries.

This application can be used to download the bulk of your character information from toyhou.se
to your local computer.

# Quick Start Guide

- Download the appropriate zip file for your operating system [from the dist folder](https://github.com/Provinite/toyhouse-downloader/tree/main/dist)
  - [windows](https://github.com/Provinite/toyhouse-downloader/blob/main/dist/thdownloader-windows-x64.zip)
  - [linux](https://github.com/Provinite/toyhouse-downloader/blob/main/dist/thdownloader-linux-x64.zip)
  - [macos](https://github.com/Provinite/toyhouse-downloader/blob/main/dist/thdownloader-macos-x64.zip)
- Unzip the files to a folder of your choice
- Modify `config.jsonc` with a text editor (like notepad), setting your username and password
- Run the executable (the other file that isn't the config file)
- Check output.log if anything doesn't work
- See the [files section](https://github.com/Provinite/toyhouse-downloader#explanation-of-files) below for an explanation of output

## Notes

- **USE AT YOUR OWN RISK**
  - I do not know if toyhouse will start banning people for this kind of tool
  - I do not know if using this tool on toyhouse is against their rules
  - There is NO warranty on this software
  - There is NO gaurantee that this application will do anything useful, or work at all
- This might take a while. I have tested on an account with about 7500 images
  across 1500 characters, and it took 4 hours or so, consuming about 5GB of disk space.
- The application is intentionally a bit slow, and only downloads one thing at a time
  to minimize the impact on toyhouse's services, and minimize the risk to anyone using
  this tool that they would get rate-limited.
- If you want to use this with multiple toyhouse accounts, simply copy the executable
  and config files to another directory and repeat the initial steps.
- Your password is only used to log into toyhouse. None of your information is sent
  anywhere that isn't strictly necessary for the application to work. In practice,
  this means that data provided is only transmitted to toyhouse (like your login
  information).

### Explanation of files

- `config.jsonc`
  - Settings for the application. Customize this file.
  - Note, if you want to work with multiple toyhouse accounts, you'll probably just want
    to have multiple copies of this entire app. Otherwise, ensure you remove the `cookies.json`,
    and `characters` directory after changing your username.
- `./chromium`
  - Installation point for chromium, can be safely deleted. Will be downloaded when starting the app again

### Generated Files

These files are what will be generated when the tool is finished.

- `output.log`
  - Full log of the entire run
- `cookies.json`
  - cached cookies storing your toyhouse session between runs.
  - Delete this file to log in fresh
- `characters/folders.json`
  - A tree structure of all folders in your toyhouse account
  - Delete this file to reload the folders list
- `characters/characters.json`
  - list of all of your characters ids, names, and links
  - Delete this file to reload the character list
- `characters/xxxx.json`
  - Each character will have a json file with its detailed profile information, and gallery image data
  - Delete one of these to re-fetch that character
- `characters/xxxx-profile.jpg`
  - Screenshot of character `xxxx`'s profile
- `characters/galleries/xxxx/*`
  - Gallery images from character `xxxx`'s gallery
  - Delete any image to have them be re-downloaded

# Questions?

Have questions? App not working? Curious about some of the code? Have a code review or pull request for me? Reach out on the [issues tab](https://github.com/Provinite/toyhouse-downloader/issues).

# Tips?

Did this help you out? Want to support me making more cool free software? Check out
[my amazing wife's Ko-fi](https://ko-fi.com/clovercoin) that is already conveniently
set up and I'm too lazy to make one right now.

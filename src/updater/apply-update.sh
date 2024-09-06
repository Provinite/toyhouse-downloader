#!/bin/sh

archiveExtension="${1##*.}"
if [ $# -ne 2 ] | [ "$archiveExtension" != 'zip' ]; then
  echo "Usage: $0 <path_to_zip_file> <pid_to_wait_for>"
  exit 1
fi

zip_file="$1"

if [ ! -f "$zip_file" ]; then
  echo "Error: Update archive '$zip_file' not found."
  exit 1
fi

waitPid="$2"

echo "Waiting for process $2 to finish..."
while kill -0 "$2"; do 
    sleep 1
done
echo "Unzipping update archive '$zip_file'to '$PWD'"
unzip -o "$zip_file"
echo "Cleaning up archive"
rm "$zip_file"
echo "Update applied successfully. Relaunch toyhouse downloader to continue."
exit
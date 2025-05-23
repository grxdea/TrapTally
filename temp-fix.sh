#!/bin/bash
# Fix hardcoded URLs in SpotifyPlayerControls.tsx file
FILE_PATH="/Users/gradywilliams/TrapTally/frontend/src/components/SpotifyPlayerControls.tsx"

# Backup the file
cp "$FILE_PATH" "${FILE_PATH}.bak"

# Replace all occurrences of the hardcoded URL with the constant
sed -i '' "s|'https://api.spotify.com/v1/me/player'|SPOTIFY_PLAYER_STATE_URL|g" "$FILE_PATH"

echo "URL replacements completed"

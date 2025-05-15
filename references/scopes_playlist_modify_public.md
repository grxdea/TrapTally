# Scopes | Spotify for Developers

Announcement:**REMINDER : We are updating the criteria to be granted extended access to the Web API.**  
Submit your extended quota mode application by May 15th. For more information, read [here.](/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access)

# Scopes

Scopes provide Spotify users using third-party apps the confidence that only the information they choose to share will be shared, and nothing more.

## Pre-requisites

Scopes are needed when implementing some of the authorization grant types. Make sure you have read the [Authorization](/documentation/web-api/concepts/authorization) guide to understand the basics.

## List of Scopes

-   Images
    -   [ugc-image-upload](/documentation/web-api/concepts/scopes#ugc-image-upload)
-   Spotify Connect
    -   [user-read-playback-state](/documentation/web-api/concepts/scopes#user-read-playback-state)
    -   [user-modify-playback-state](/documentation/web-api/concepts/scopes#user-modify-playback-state)
    -   [user-read-currently-playing](/documentation/web-api/concepts/scopes#user-read-currently-playing)
-   Playback
    -   [app-remote-control](/documentation/web-api/concepts/scopes#app-remote-control)
    -   [streaming](/documentation/web-api/concepts/scopes#streaming)
-   Playlists
    -   [playlist-read-private](/documentation/web-api/concepts/scopes#playlist-read-private)
    -   [playlist-read-collaborative](/documentation/web-api/concepts/scopes#playlist-read-collaborative)
    -   [playlist-modify-private](/documentation/web-api/concepts/scopes#playlist-modify-private)
    -   [playlist-modify-public](/documentation/web-api/concepts/scopes#playlist-modify-public)
-   Follow
    -   [user-follow-modify](/documentation/web-api/concepts/scopes#user-follow-modify)
    -   [user-follow-read](/documentation/web-api/concepts/scopes#user-follow-read)
-   Listening History
    -   [user-read-playback-position](/documentation/web-api/concepts/scopes#user-read-playback-position)
    -   [user-top-read](/documentation/web-api/concepts/scopes#user-top-read)
    -   [user-read-recently-played](/documentation/web-api/concepts/scopes#user-read-recently-played)
-   Library
    -   [user-library-modify](/documentation/web-api/concepts/scopes#user-library-modify)
    -   [user-library-read](/documentation/web-api/concepts/scopes#user-library-read)
-   Users
    -   [user-read-email](/documentation/web-api/concepts/scopes#user-read-email)
    -   [user-read-private](/documentation/web-api/concepts/scopes#user-read-private)
-   Open Access
    -   [user-soa-link](/documentation/web-api/concepts/scopes#user-soa-link)
    -   [user-soa-unlink](/documentation/web-api/concepts/scopes#user-soa-unlink)
    -   [soa-manage-entitlements](/documentation/web-api/concepts/scopes#soa-manage-entitlements)
    -   [soa-manage-partner](/documentation/web-api/concepts/scopes#soa-manage-partner)
    -   [soa-create-partner](/documentation/web-api/concepts/scopes#soa-create-partner)

### `ugc-image-upload`

**Description**

Write access to user-provided images.

**Visible to users**

Upload images to Spotify on your behalf.

**Endpoints that require the `ugc-image-upload` scope**

-   [Add Custom Playlist Cover Image](/documentation/web-api/reference/upload-custom-playlist-cover)

### `user-read-playback-state`

**Description**

Read access to a user’s player state.

**Visible to users**

Read your currently playing content and Spotify Connect devices information.

**Endpoints that require the `user-read-playback-state` scope**

-   [Get a User's Available Devices](/documentation/web-api/reference/get-a-users-available-devices)
-   [Get Information About The User's Current Playback](/documentation/web-api/reference/get-information-about-the-users-current-playback)
-   [Get the User's Currently Playing Track](/documentation/web-api/reference/get-recently-played)

### `user-modify-playback-state`

**Description**

Write access to a user’s playback state

**Visible to users**

Control playback on your Spotify clients and Spotify Connect devices.

**Endpoints that require the `user-modify-playback-state` scope**

-   [Pause a User's Playback](/documentation/web-api/reference/pause-a-users-playback)
-   [Seek To Position In Currently Playing Track](/documentation/web-api/reference/seek-to-position-in-currently-playing-track)
-   [Set Repeat Mode On User’s Playback](/documentation/web-api/reference/set-repeat-mode-on-users-playback)
-   [Set Volume For User's Playback](/documentation/web-api/reference/set-volume-for-users-playback)
-   [Skip User’s Playback To Next Track](/documentation/web-api/reference/skip-users-playback-to-next-track)
-   [Skip User’s Playback To Previous Track](/documentation/web-api/reference/skip-users-playback-to-previous-track)
-   [Start/Resume a User's Playback](/documentation/web-api/reference/start-a-users-playback)
-   [Toggle Shuffle For User’s Playback](/documentation/web-api/reference/toggle-shuffle-for-users-playback)
-   [Transfer a User's Playback](/documentation/web-api/reference/transfer-a-users-playback)
-   [Add An Item To The End Of User's Current Playback Queue](/documentation/web-api/reference/seek-to-position-in-currently-playing-track)

### `user-read-currently-playing`

**Description**

Read access to a user’s currently playing content.

**Visible to users**

Read your currently playing content.

**Endpoints that require the `user-read-currently-playing` scope**

-   [Get the User's Currently Playing Track](/documentation/web-api/reference/get-recently-played)
-   [Get the User's Queue](/documentation/web-api/reference/get-queue)

### `app-remote-control`

**Description**

Remote control playback of Spotify. This scope is currently available to Spotify iOS and Android SDKs.

**Visible to users**

Communicate with the Spotify app on your device.

**Endpoints that require the `app-remote-control` scope**

-   [iOS SDK](/documentation/ios)
-   [Android SDK](/documentation/android)

### `streaming`

**Description**

Control playback of a Spotify track. This scope is currently available to the Web Playback SDK. The user must have a Spotify Premium account.

**Visible to users**

Play content and control playback on your other devices.

**Endpoints that require the `streaming` scope**

-   [Web Playback SDK](/documentation/web-playback-sdk)

### `playlist-read-private`

**Description**

Read access to user's private playlists.

**Visible to users**

Access your private playlists.

**Endpoints that require the `playlist-read-private` scope**

-   [Check if Users Follow a Playlist](/documentation/web-api/reference/check-if-user-follows-playlist)
-   [Get a List of Current User's Playlists](/documentation/web-api/reference/get-a-list-of-current-users-playlists)
-   [Get a List of a User's Playlists](/documentation/web-api/reference/get-list-users-playlists)

### `playlist-read-collaborative`

**Description**

Include collaborative playlists when requesting a user's playlists.

**Visible to users**

Access your collaborative playlists.

**Endpoints that require the `playlist-read-collaborative` scope**

-   [Get a List of Current User's Playlists](/documentation/web-api/reference/get-a-list-of-current-users-playlists)
-   [Get a List of a User's Playlists](/documentation/web-api/reference/get-list-users-playlists)

### `playlist-modify-private`

**Description**

Write access to a user's private playlists.

**Visible to users**

Manage your private playlists.

**Endpoints that require the `playlist-modify-private` scope**

-   [Follow a Playlist](/documentation/web-api/reference/follow-playlist)
-   [Unfollow a Playlist](/documentation/web-api/reference/unfollow-playlist)
-   [Add Items to a Playlist](/documentation/web-api/reference/add-tracks-to-playlist)
-   [Change a Playlist's Details](/documentation/web-api/reference/change-playlist-details)
-   [Create a Playlist](/documentation/web-api/reference/create-playlist)
-   [Remove Items from a Playlist](/documentation/web-api/reference/remove-tracks-playlist)
-   [Reorder a Playlist's Items](/documentation/web-api/reference/reorder-or-replace-playlists-tracks)
-   [Replace a Playlist's Items](/documentation/web-api/reference/reorder-or-replace-playlists-tracks)
-   [Upload a Custom Playlist Cover Image](/documentation/web-api/reference/upload-custom-playlist-cover)

### playlist-modify-public

**Description**

Write access to a user's public playlists.

**Visible to users**

Manage your public playlists.

**Endpoints that require the `playlist-modify-public` scope**

-   [Follow a Playlist](/documentation/web-api/reference/follow-playlist)
-   [Unfollow a Playlist](/documentation/web-api/reference/unfollow-playlist)
-   [Add Items to a Playlist](/documentation/web-api/reference/add-tracks-to-playlist)
-   [Change a Playlist's Details](/documentation/web-api/reference/change-playlist-details)
-   [Create a Playlist](/documentation/web-api/reference/create-playlist)
-   [Remove Items from a Playlist](/documentation/web-api/reference/remove-tracks-playlist)
-   [Reorder a Playlist's Items](/documentation/web-api/reference/reorder-or-replace-playlists-tracks)
-   [Replace a Playlist's Items](/documentation/web-api/reference/reorder-or-replace-playlists-tracks)
-   [Upload a Custom Playlist Cover Image](/documentation/web-api/reference/upload-custom-playlist-cover)

### `user-follow-modify`

**Description**

Write/delete access to the list of artists and other users that the user follows.

**Visible to users**

Manage who you are following.

**Endpoints that require the `user-follow-modify` scope**

-   [Follow Artists or Users](/documentation/web-api/reference/follow-artists-users)
-   [Unfollow Artists or Users](/documentation/web-api/reference/unfollow-artists-users)

### `user-follow-read`

**Description**

Read access to the list of artists and other users that the user follows.

**Visible to users**

Access your followers and who you are following.

**Endpoints that require the `user-follow-read` scope**

-   [Check if Current User Follows Artists or Users](/documentation/web-api/reference/check-current-user-follows)
-   [Get User's Followed Artists](/documentation/web-api/reference/get-followed)

### `user-read-playback-position`

**Description**

Read access to a user’s playback position in a content.

**Visible to users**

Read your position in content you have played.

**Endpoints that require the `user-read-playback-position` scope**

-   [Get an Episodes](/documentation/web-api/reference/get-an-episode)
-   [Get Several Episodes](/documentation/web-api/reference/get-multiple-episodes)
-   [Get a Show](/documentation/web-api/reference/get-a-show)
-   [Get Several Shows](/documentation/web-api/reference/get-multiple-shows)
-   [Get a Show's Episodes](/documentation/web-api/reference/get-a-shows-episodes)

### `user-top-read`

**Description**

Read access to a user's top artists and tracks.

**Visible to users**

Read your top artists and content.

**Endpoints that require the `user-top-read` scope**

-   [Get a User's Top Artists and Tracks](/documentation/web-api/reference/get-users-top-artists-and-tracks)

### `user-read-recently-played`

**Description**

Read access to a user’s recently played tracks.

**Visible to users**

Access your recently played items.

**Endpoints that require the `user-read-recently-played` scope**

-   [Get Current User's Recently Played Tracks](/documentation/web-api/reference/get-the-users-currently-playing-track)

### `user-library-modify`

**Description**

Write/delete access to a user's "Your Music" library.

**Visible to users**

Manage your saved content.

**Endpoints that require the `user-library-modify` scope**

-   [Remove Albums for Current User](/documentation/web-api/reference/remove-albums-user)
-   [Remove User's Saved Tracks](/documentation/web-api/reference/remove-tracks-user)
-   [Remove User's Saved Episodes](/documentation/web-api/reference/remove-episodes-user)
-   [Save Albums for Current User](/documentation/web-api/reference/save-albums-user)
-   [Save Tracks for User](/documentation/web-api/reference/save-tracks-user)
-   [Save Episodes for User](/documentation/web-api/reference/save-episodes-user)

### `user-library-read`

**Description**

Read access to a user's library.

**Visible to users**

Access your saved content.

**Endpoints that require the `user-library-read` scope**

-   [Check User's Saved Albums](/documentation/web-api/reference/check-users-saved-albums)
-   [Check User's Saved Tracks](/documentation/web-api/reference/check-users-saved-tracks)
-   [Get Current User's Saved Albums](/documentation/web-api/reference/get-users-saved-albums)
-   [Get a User's Saved Tracks](/documentation/web-api/reference/get-users-saved-tracks)
-   [Check User's Saved Episodes](/documentation/web-api/reference/check-users-saved-episodes)
-   [Get User's Saved Episodes](/documentation/web-api/reference/get-users-saved-episodes)

### `user-read-email`

**Description**

Read access to user’s email address.

**Visible to users**

Get your real email address.

**Endpoints that require the `user-read-email` scope**

-   [Get Current User's Profile](/documentation/web-api/reference/get-current-users-profile)

### `user-read-private`

**Description**

Read access to user’s subscription details (type of user account).

**Visible to users**

Access your subscription details.

**Endpoints that require the `user-read-private` scope**

-   [Search for an Item](/documentation/web-api/reference/search)
-   [Get Current User's Profile](/documentation/web-api/reference/get-current-users-profile)

### `user-soa-link`

**Description**

Link a partner user account to a Spotify user account

**Endpoints that require the `user-soa-link` scope**

-   [Register new user](/documentation/open-access/reference/register-user)

### `user-soa-unlink`

**Description**

Unlink a partner user account from a Spotify account

**Endpoints that require the `user-soa-unlink` scope**

-   [Unlink user](/documentation/open-access/reference/unlink-user)

### `soa-manage-entitlements`

**Description**

Modify entitlements for linked users

**Endpoints that require the `soa-manage-entitlements` scope**

-   [Add user entitlements](/documentation/open-access/reference/add-entitlements)
-   [Get user entitlements](/documentation/open-access/reference/get-entitlements)
-   [Removes user entitlements](/documentation/open-access/reference/delete-entitlements)
-   [Replace user entitlements](/documentation/open-access/reference/replace-entitlements)

### `soa-manage-partner`

**Description**

Update partner information

**Endpoints that require the `soa-manage-partner` scope**

-   [Set partner logo](/documentation/documentation/open-access/reference/upload-logo)

### `soa-create-partner`

**Description**

Create new partners, platform partners only

**Endpoints that require the `soa-create-partner` scope**

-   [Create new partner](/documentation/documentation/open-access/reference/create-partner)
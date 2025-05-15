# Web Playback SDK Reference | Spotify for Developers

# Web Playback SDK Reference

\[data-ch-theme="s4d"\] { --ch-t-colorScheme: dark;--ch-t-foreground: #ffffff;--ch-t-background: #1E073C;--ch-t-lighter-inlineBackground: #1e073ce6;--ch-t-editor-background: #1E073C;--ch-t-editor-foreground: #F8F8F2;--ch-t-editor-lineHighlightBackground: #3E3D32;--ch-t-editor-rangeHighlightBackground: #ffffff0b;--ch-t-editor-infoForeground: #3794FF;--ch-t-editor-selectionBackground: #49483E;--ch-t-focusBorder: #007FD4;--ch-t-tab-activeBackground: #1E073C;--ch-t-tab-activeForeground: #ffffff;--ch-t-tab-inactiveBackground: #2D2D2D;--ch-t-tab-inactiveForeground: #ffffff80;--ch-t-tab-border: #252526;--ch-t-tab-activeBorder: #1E073C;--ch-t-editorGroup-border: #444444;--ch-t-editorGroupHeader-tabsBackground: #252526;--ch-t-editorLineNumber-foreground: #858585;--ch-t-input-background: #3C3C3C;--ch-t-input-foreground: #F8F8F2;--ch-t-icon-foreground: #C5C5C5;--ch-t-sideBar-background: #252526;--ch-t-sideBar-foreground: #F8F8F2;--ch-t-sideBar-border: #252526;--ch-t-list-activeSelectionBackground: #094771;--ch-t-list-activeSelectionForeground: #fffffe;--ch-t-list-hoverBackground: #2A2D2E; }

Important policy notes

-   Streaming applications may not be commercial
    
    The Spotify Platform can not be used to develop commercial streaming integrations.
    
    [More information](/policy/#iv-streaming-and-commercial-use:~:text=Commercial use restrictions,Streaming SDA itself.)
    
-   Keep audio content in its original form
    
    The Spotify Platform can not be used to develop applications that alter Spotify Content.
    
    [More information](/policy/#iii-some-prohibited-applications:~:text=Do not permit any device or system to segue,.)
    
-   Do not synchronize Spotify content
    
    You may not synchronize any sound recordings with any visual media, including any advertising, film, television program, slideshow, video, or similar content
    
    [More information](/policy/#iii-some-prohibited-applications:~:text=Do not synchronize any sound recordings with any visual media,.)
    
-   Spotify content may not be broadcasted
    
    The Spotify Platform can not be used for non-interactive broadcasting.
    
    [More information](/policy/#iii-some-prohibited-applications:~:text=Do not create any product or service which includes any non,several simultaneous listeners.)
    

## Spotify.Player

### `Spotify.Player`

**Description**

The main constructor for initializing the Web Playback SDK. It should contain an object with the player name, volume and access token.

**Response**

`void`

**Code Example:**

`   1  window.onSpotifyWebPlaybackSDKReady = () => {    2  const token = '[My Spotify Web API access token]';    3  const player = new Spotify.Player({    4  name: 'Web Playback SDK Quick Start Player',    5  getOAuthToken: cb => { cb(token); }    6  });    7  }            `

Parameter Name

Type

Description

Required

`name`

String

The name of the Spotify Connect player. It will be visible in other Spotify apps

**Required**

`getOAuthToken`

Function

This will be called every time you run Spotify.Player#connect or when a user's access token has expired (maximum of 60 minutes). You will be provided with a `callback` parameter. You will need to execute this with a valid `access_token` string for a Spotify Premium user.

**Required**

`volume`

Float

The default volume of the player. Represented as a decimal between **0** and **1**. Default value is **1**.

_Optional_

`enableMediaSession`

Boolean

If set to true, the [Media Session API](https://www.w3.org/TR/mediasession/) will be set with metadata and action handlers. Default value is **false**.

_Optional_

### `Spotify.Player#connect`

**Description**

Connect our Web Playback SDK instance to Spotify with the credentials provided during initialization.

**Response**

Returns a `Promise` containing a `Boolean` (either `true` or `false`) with the success of the connection.

**Code Example:**

`   1  player.connect().then(success => {    2  if (success) {    3  console.log('The Web Playback SDK successfully connected to Spotify!');    4  }    5  })            `

### `Spotify.Player#disconnect`

**Description**

Closes the current session our Web Playback SDK has with Spotify.

**Response**

`Void`

**Code Example:**

`   1  player.disconnect()            `

### `Spotify.Player#addListener`

**Description**

Create a new event listener in the Web Playback SDK. Alias for Spotify.Player#on.

**Response**

Returns a `Boolean`. Returns `true` if the event listener for the `event_name` is unique. See [#removeListener](/documentation/web-playback-sdk/reference#spotifyplayerremovelistener) for removing existing listeners.

**Code Example:**

`   1  player.addListener('ready', ({ device_id }) => {    2  console.log('The Web Playback SDK is ready to play music!');    3  console.log('Device ID', device_id);    4  })            `

Parameter Name

Type

Description

Required

`event_name`

String

A valid event name. See Web Playback SDK Events.

**Required**

`callback`

Function

A callback function to be fired when the event has been executed.

**Required**

### `Spotify.Player#removeListener`

**Description**

Remove an event listener in the Web Playback SDK.

**Response**

Returns a `Boolean`. Returns `true` if the event name is valid with registered callbacks from [#addListener](/documentation/web-playback-sdk/reference#spotifyplayeraddlistener).

**Code Example:**

`   1  // Removes all "ready" events    2  player.removeListener('ready');    3  // Remove a specific "ready" listener    4  player.removeListener('ready', yourCallback)            `

Parameter Name

Type

Description

Required

`event_name`

String

A valid event name. See Web Playback SDK Events.

**Required**

`callback`

Function

The callback function you would like to remove from the listener. If not provided, it will remove all callbacks under the `event_name`.

_Optional_

### `Spotify.Player#getCurrentState`

**Description**

Collect metadata on local playback.

**Response**

Returns a `Promise`. It will return either a [WebPlaybackState](/documentation/web-playback-sdk/reference#webplaybackstate-object) object or null depending on if the user is successfully connected.

**Code Example:**

`   1  player.getCurrentState().then(state => {    2  if (!state) {    3  console.error('User is not playing music through the Web Playback SDK');    4  return;    5  }    6      7  var current_track = state.track_window.current_track;    8  var next_track = state.track_window.next_tracks[0];    9      10  console.log('Currently Playing', current_track);    11  console.log('Playing Next', next_track);    12  });            `

### `Spotify.Player#setName`

**Description**

Rename the Spotify Player device. This is visible across all Spotify Connect devices.

**Response**

Returns a `Promise`.

**Code Example:**

`   1  player.setName("My New Player Name").then(() => {    2  console.log('Player name updated!');    3  });            `

Parameter Name

Type

Description

Required

`name`

String

The new desired player name.

**Required**

### `Spotify.Player#getVolume`

**Description**

Get the local volume currently set in the Web Playback SDK.

**Response**

Returns a `Promise` containing the local volume (as a `Float` between **0** and **1**).

**Code Example:**

`   1  player.getVolume().then(volume => {    2  let volume_percentage = volume * 100;    3  console.log('The volume of the player is ${volume_percentage}%');    4  });            `

### `Spotify.Player#setVolume`

**Description**

Set the local volume for the Web Playback SDK.

**Response**

Returns an empty `Promise`

**Code Example:**

`   1  player.setVolume(0.5).then(() => {    2  console.log('Volume updated!');    3  });            `

Parameter Name

Type

Description

Required

`volume`

Float

The new desired volume for local playback. Between 0 and 1. Note: On iOS devices, the audio level is always under the user’s physical control. The volume property is not settable in JavaScript. Reading the volume property always returns 1. More details can be found in the [iOS-specific Considerations documentation page by Apple](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html).

**Required**

### `Spotify.Player#pause`

**Description**

Pause the local playback.

**Response**

Returns an empty `Promise`

**Code Example:**

`   1  player.pause().then(() => {    2  console.log('Paused!');    3  });            `

### `Spotify.Player#resume`

**Description**

Resume the local playback.

**Response**

Returns an empty `Promise`

**Code Example:**

`   1  player.resume().then(() => {    2  console.log('Resumed!');    3  });            `

### `Spotify.Player#togglePlay`

**Description**

Resume/pause the local playback.

**Response**

Returns an empty `Promise`

**Code Example:**

`   1  player.togglePlay().then(() => {    2  console.log('Toggled playback!');    3  });            `

### `Spotify.Player#seek`

**Description**

Seek to a position in the current track in local playback.

**Response**

Returns an empty `Promise`

**Code Example:**

`   1  // Seek to a minute into the track    2  player.seek(60 * 1000).then(() => {    3  console.log('Changed position!');    4  });            `

Parameter Name

Type

Description

Required

`position_ms`

Integer

The position in milliseconds to seek to.

**Required**

### `Spotify.Player#previousTrack`

**Description**

Switch to the previous track in local playback.

**Response**

Returns an empty `Promise`

**Code Example:**

`   1  player.previousTrack().then(() => {    2  console.log('Set to previous track!');    3  });            `

### `Spotify.Player#nextTrack`

**Description**

Skip to the next track in local playback.

**Response**

Returns an empty `Promise`

**Code Example:**

`   1  player.nextTrack().then(() => {    2  console.log('Skipped to next track!');    3  });            `

### `Spotify.Player#activateElement`

**Description**

Some browsers prevent autoplay of media by ensuring that all playback is triggered by synchronous event-paths originating from user interaction such as a click. In the autoplay disabled browser, to be able to keep the playing state during transfer from other applications to yours, this function needs to be called in advance. Otherwise it will be in pause state once it’s transferred.

**Response**

Returns an empty `Promise`

**Code Example:**

`   1  myActivateElementButton.addEventListener('click', () => {    2  // The player is activated. The player will keep the    3  // playing state once the state is transferred from other    4  // applications.    5  player.activateElement();    6  });    7  // Transfer your currently playing track into your    8  // application through device picker in Spotify APP.            `

## Events

### `ready`

**Description**

Emitted when the Web Playback SDK has successfully connected and is ready to stream content in the browser from Spotify.

**Response**

Returns a [WebPlaybackPlayer](/documentation/web-playback-sdk/reference#webplaybackplayer-object) object.

**Code Example:**

`   1  player.addListener('ready', ({ device_id }) => {    2  console.log('Connected with Device ID', device_id);    3  });            `

### `not_ready`

**Description**

Emitted when the Web Playback SDK is not ready to play content, typically due to no internet connection.

**Response**

Returns a [WebPlaybackPlayer](/documentation/web-playback-sdk/reference#webplaybackplayer-object) object.

**Code Example:**

`   1  player.addListener('not_ready', ({ device_id }) => {    2  console.log('Device ID is not ready for playback', device_id);    3  });            `

### `player_state_changed`

**Description**

Emitted when the state of the local playback has changed. It may be also executed in random intervals.

**Response**

Returns a [WebPlaybackPlayer](/documentation/web-playback-sdk/reference#webplaybackplayer-object) object.

**Code Example:**

`   1  player.addListener('player_state_changed', ({    2  position,    3  duration,    4  track_window: { current_track }    5  }) => {    6  console.log('Currently Playing', current_track);    7  console.log('Position in Song', position);    8  console.log('Duration of Song', duration);    9  });            `

### `autoplay_failed`

**Description**

Emitted when playback is prohibited by the browser’s autoplay rules. Check [Spotify.Player#activateElement](/documentation/web-playback-sdk/reference#spotifyplayeractivateelement) for more information.

**Response**

Returns `null`

**Code Example:**

`   1  player.addListener('autoplay_failed', () => {    2  console.log('Autoplay is not allowed by the browser autoplay rules');    3  });            `

## Errors

### `initialization_error`

**Description**

Emitted when the `Spotify.Player` fails to instantiate a player capable of playing content in the current environment. Most likely due to the browser not supporting EME protection.

**Code Example:**

`   1  player.on('initialization_error', ({ message }) => {    2  console.error('Failed to initialize', message);    3  });            `

### `authentication_error`

**Description**

Emitted when the `Spotify.Player` fails to instantiate a valid Spotify connection from the access token provided to `getOAuthToken`.

**Code Example:**

`   1  player.on('authentication_error', ({ message }) => {    2  console.error('Failed to authenticate', message);    3  });            `

### `account_error`

**Description**

Emitted when the user authenticated does not have a valid Spotify Premium subscription.

**Code Example:**

`   1  player.on('account_error', ({ message }) => {    2  console.error('Failed to validate Spotify account', message);    3  });            `

### `playback_error`

**Description**

Emitted when loading and/or playing back a track failed.

**Code Example:**

`   1  player.on('playback_error', ({ message }) => {    2  console.error('Failed to perform playback', message);    3  });            `

## Objects

### WebPlaybackPlayer Object

This is an object that is provided in the [ready](/documentation/web-playback-sdk/reference#ready) event as an argument. WebPlaybackPlayer objects contain information related to the current player instance of the Web Playback SDK.

`   1  { device_id: "c349add90ccf047f4e737492b69ba912bdc55f6a" }            `

### WebPlaybackState Object

This is an object that is provided every time [Spotify.Player#getCurrentState](/documentation/web-playback-sdk/reference#spotifyplayergetcurrentstate) is called. It contains information on context, permissions, playback state, the user’s session, and more.

``   1  {    2  context: {    3  uri: 'spotify:album:xxx', // The URI of the context (can be null)    4  metadata: {}, // Additional metadata for the context (can be null)    5  },    6  disallows: { // A simplified set of restriction controls for    7  pausing: false, // The current track. By default, these fields    8  peeking_next: false, // will either be set to false or undefined, which    9  peeking_prev: false, // indicates that the particular operation is    10  resuming: false, // allowed. When the field is set to `true`, this    11  seeking: false, // means that the operation is not permitted. For    12  skipping_next: false, // example, `skipping_next`, `skipping_prev` and    13  skipping_prev: false // `seeking` will be set to `true` when playing an    14  // ad track.    15  },    16  paused: false, // Whether the current track is paused.    17  position: 0, // The position_ms of the current track.    18  repeat_mode: 0, // The repeat mode. No repeat mode is 0,    19  // repeat context is 1 and repeat track is 2.    20  shuffle: false, // True if shuffled, false otherwise.    21  track_window: {    22  current_track: <WebPlaybackTrack>, // The track currently on local playback    23  previous_tracks: [<WebPlaybackTrack>, <WebPlaybackTrack>, ...], // Previously played tracks. Number can vary.    24  next_tracks: [<WebPlaybackTrack>, <WebPlaybackTrack>, ...] // Tracks queued next. Number can vary.    25  }    26  }            ``

### WebPlaybackTrack Object

This is an object that is provided inside `track_window` from the [WebPlaybackState Object](/documentation/web-playback-sdk/reference#webplaybackstate-object). Track objects are [Spotify Web API](/documentation/web-api) compatible objects containing metadata on Spotify content.

`   1  {    2  uri: "spotify:track:xxxx", // Spotify URI    3  id: "xxxx", // Spotify ID from URI (can be null)    4  type: "track", // Content type: can be "track", "episode" or "ad"    5  media_type: "audio", // Type of file: can be "audio" or "video"    6  name: "Song Name", // Name of content    7  is_playable: true, // Flag indicating whether it can be played    8  album: {    9  uri: 'spotify:album:xxxx', // Spotify Album URI    10  name: 'Album Name',    11  images: [    12  { url: "https://image/xxxx" }    13  ]    14  },    15  artists: [    16  { uri: 'spotify:artist:xxxx', name: "Artist Name" }    17  ]    18  }            `

### WebPlaybackError Object

This is an object that is provided in all error handlers from the Web Playback SDK. It is referred to as e and looks like this:

`   1  { message: "This will contain a message explaining the error." }            `
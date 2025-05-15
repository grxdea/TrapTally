# Getting Started with Web Playback SDK | Spotify for Developers

# Getting Started with Web Playback SDK

\[data-ch-theme="s4d"\] { --ch-t-colorScheme: dark;--ch-t-foreground: #ffffff;--ch-t-background: #1E073C;--ch-t-lighter-inlineBackground: #1e073ce6;--ch-t-editor-background: #1E073C;--ch-t-editor-foreground: #F8F8F2;--ch-t-editor-lineHighlightBackground: #3E3D32;--ch-t-editor-rangeHighlightBackground: #ffffff0b;--ch-t-editor-infoForeground: #3794FF;--ch-t-editor-selectionBackground: #49483E;--ch-t-focusBorder: #007FD4;--ch-t-tab-activeBackground: #1E073C;--ch-t-tab-activeForeground: #ffffff;--ch-t-tab-inactiveBackground: #2D2D2D;--ch-t-tab-inactiveForeground: #ffffff80;--ch-t-tab-border: #252526;--ch-t-tab-activeBorder: #1E073C;--ch-t-editorGroup-border: #444444;--ch-t-editorGroupHeader-tabsBackground: #252526;--ch-t-editorLineNumber-foreground: #858585;--ch-t-input-background: #3C3C3C;--ch-t-input-foreground: #F8F8F2;--ch-t-icon-foreground: #C5C5C5;--ch-t-sideBar-background: #252526;--ch-t-sideBar-foreground: #F8F8F2;--ch-t-sideBar-border: #252526;--ch-t-list-activeSelectionBackground: #094771;--ch-t-list-activeSelectionForeground: #fffffe;--ch-t-list-hoverBackground: #2A2D2E; }

The following tutorial will lead you step by step to create a simple client-side page to host a new Spotify player based on the **Web Playback SDK** to stream content along with the rest of devices from your home.

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
    

## Authenticating with Spotify

The Web Playback SDK needs an access token from your personal Spotify Premium account, so the first thing we need to do is to create an application. The application contains your credentials needed to request an access token.

Go to [Dashboard](/dashboard) and click on the _Create app_ button. Go ahead and provide a name and a short description to your new app and select "Web Playback SDK" for the question asking which APIs are you planning to use. Finally, accept the terms and conditions and click on _Save_.

Your new app has a _Client Id_ and _Client Secret_ needed to authorize the application we are about to code!

Since this tutorial doesn't cover the authorization flow, we will provide your access token here:

Remember this access token expires in **1 hour**. But no worries! Feel free to come back here and generate a new one!

## Installation

We are going to start creating a simple HTML template to host the SDK:

`   1  <!DOCTYPE html>    2  <html>    3  <head>    4  <title>Spotify Web Playback SDK Quick Start</title>    5  </head>    6  <body>    7  <h1>Spotify Web Playback SDK Quick Start</h1>    8  </body>    9  </html>            `

To install the Web Playback SDK, we need to embed the SDK. Right after the `h1` tag, insert the following code:

`   1  <script src="https://sdk.scdn.co/spotify-player.js"></script>            `

## Initialization

Once the Web Playback SDK has been correctly embedded, we can initialize the player immediately. Let's add a new `script` tag with the following content (don't forget to replace the `token` variable's value with your previously generated access token):

`   1  window.onSpotifyWebPlaybackSDKReady = () => {    2  const token = '[My access token]';    3  const player = new Spotify.Player({    4  name: 'Web Playback SDK Quick Start Player',    5  getOAuthToken: cb => { cb(token); },    6  volume: 0.5    7  });            `

The `onSpotifyWebPlaybackSDKReady` method will be automatically called once the Web Playback SDK has successfully loaded. It creates the instance of the Player and receives the following parameters:

-   `name` of the Spotify instance.
-   The callback `getOAuthToken` expected to provide a valid access\_token.
-   The `volume` of the player represented as a decimal value between 0 and 1.

## Events

The SDK will emit events to our browser to notify about changes to its internal state. We can use the [addListener](/documentation/web-playback-sdk/reference#spotifyplayeraddlistener) method to listen and subscribe to those events. You can find detailed information about the events supported by the SDK on the [SDK reference page](/documentation/web-playback-sdk/reference)

The first two events we want to get notified are [ready](/documentation/web-playback-sdk/reference#ready), emitted when the SDK is connected and ready to stream content, and [not\_ready](/documentation/web-playback-sdk/reference#not_ready), in case the connection is broken. In the following example, we will print them out on console once the events are received:

`   1  // Ready    2  player.addListener('ready', ({ device_id }) => {    3  console.log('Ready with Device ID', device_id);    4  });    5      6  // Not Ready    7  player.addListener('not_ready', ({ device_id }) => {    8  console.log('Device ID has gone offline', device_id);    9  });            `

Let's add some listeners to get notified in case something happens during the SDK initialization:

`   1  player.addListener('initialization_error', ({ message }) => {    2  console.error(message);    3  });    4      5  player.addListener('authentication_error', ({ message }) => {    6  console.error(message);    7  });    8      9  player.addListener('account_error', ({ message }) => {    10  console.error(message);    11  });            `

Finally, let's call [connect](/documentation/web-playback-sdk/reference#api-spotify-player-connect) method to perform the connection of our new Spotify instance:

`   1  player.connect();            `

At that point you should have initialized and connected a new client called _Web Playback SDK Quick Start Player_ in [Spotify Connect](https://www.spotify.com/connect/). You can also check the JavaScript console to see the messages emitted by the SDK events.

## Controlling playback

The Web Playback SDK allows you to control playback so let's add a button to enable users to toggle play. Let's add a button:

`   1  <button id="togglePlay">Toggle Play</button>            `

Inside the `onSpotifyWebPlaybackSDKReady` method we can add an `onclick` listener and have it interact with the `Player` object:

`   1  document.getElementById('togglePlay').onclick = function() {    2  player.togglePlay();    3  };            `

You can see a list of all the playback controls available in the [Web Playback API Reference](/documentation/web-playback-sdk/reference#spotifyplayer).

## Mobile support

Safari on iOS and other mobile browsers have restrictions for autoplay behaviour. When the playing state is transferred from other applications to yours, the browser sees the command as coming from Spotify servers and not from the user, which will be classified as autoplay behaviour and often gets blocked.

To be able to keep the playing state during transfer, the `activateElement()` function needs to be called in advance. Otherwise it will be in pause state once it's transferred. Check out the [activateElement](/documentation/web-playback-sdk/reference#spotifyplayeractivateelement) reference.

## Transferring the playback to the browser

To play a track inside your browser, connect to the _Web Playback SDK Quick Start Player_ player using any of the official Spotify clients (desktop or mobile). Then play a song and you should hear it playing in your browser. If you're testing on a mobile browser you may have to click the Toggle Play button.

![Spotify Connect](https://developer-assets.spotifycdn.com/images/documentation/web-playback-sdk/spotify_connect.png)

**Congratulations!** You've interacted with the Web Playback SDK for the first time. Time to celebrate, you did a great job! 👏

Want more? Here's what you can do next:

-   Learn how to add local playback controls through the [Web Playback API Reference](/documentation/web-playback-sdk/reference).
-   Learn how to control remote Spotify devices through the [Spotify Connect Web API](/documentation/web-api/reference/start-a-users-playback).

## Source Code

For your convenience, here is the full source code of the example:

`   1      2  <!DOCTYPE html>    3  <html>    4  <head>    5  <title>Spotify Web Playback SDK Quick Start</title>    6  </head>    7  <body>    8  <h1>Spotify Web Playback SDK Quick Start</h1>    9  <button id="togglePlay">Toggle Play</button>    10      11  <script src="https://sdk.scdn.co/spotify-player.js"></script>    12  <script>    13  window.onSpotifyWebPlaybackSDKReady = () => {    14  const token = '[My access token]';    15  const player = new Spotify.Player({    16  name: 'Web Playback SDK Quick Start Player',    17  getOAuthToken: cb => { cb(token); },    18  volume: 0.5    19  });    20      21  // Ready    22  player.addListener('ready', ({ device_id }) => {    23  console.log('Ready with Device ID', device_id);    24  });    25      26  // Not Ready    27  player.addListener('not_ready', ({ device_id }) => {    28  console.log('Device ID has gone offline', device_id);    29  });    30      31  player.addListener('initialization_error', ({ message }) => {    32  console.error(message);    33  });    34      35  player.addListener('authentication_error', ({ message }) => {    36  console.error(message);    37  });    38      39  player.addListener('account_error', ({ message }) => {    40  console.error(message);    41  });    42      43  document.getElementById('togglePlay').onclick = function() {    44  player.togglePlay();    45  };    46      47  player.connect();    48  }    49  </script>    50  </body>    51  </html>            `
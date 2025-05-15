# Web API Reference | Spotify for Developers

Announcement:**REMINDER : We are updating the criteria to be granted extended access to the Web API.**  
Submit your extended quota mode application by May 15th. For more information, read [here.](/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access)

Web API •References / Player / Start/Resume Playback

# Start/Resume Playback

OAuth 2.0

Start a new context or resume current playback on the user's active device. This API only works for users who have Spotify Premium. The order of execution is not guaranteed when you use this API with other Player API endpoints.

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
    

Authorization scopes

-   user-modify-playback-state
    
    Control playback on your Spotify clients and Spotify Connect devices.
    
    [Read more](/documentation/web-api/concepts/scopes#user-modify-playback-state)
    

## Request

PUT

/me/player/play

-   device\_id
    
    string
    
    The id of the device this command is targeting. If not supplied, the user's currently active device is the target.
    
    Example: `device_id=0d1841b0976bae2a3a310dd74c0f3df354899bc8`
    

Body application/json

supports free form additional properties

-   context\_uri
    
    string
    
    Optional. Spotify URI of the context to play. Valid contexts are albums, artists & playlists. `{context_uri:"spotify:album:1Je1IMUlBXcx1Fz0WE7oPT"}`
    
-   uris
    
    array of strings
    
    Optional. A JSON array of the Spotify track URIs to play. For example: `{"uris": ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh", "spotify:track:1301WleyT98MSxVHPZCA6M"]}`
    
-   offset
    
    object
    
    Optional. Indicates from where in the context playback should start. Only available when context\_uri corresponds to an album or playlist object "position" is zero based and can’t be negative. Example: `"offset": {"position": 5}` "uri" is a string representing the uri of the item to start at. Example: `"offset": {"uri": "spotify:track:1301WleyT98MSxVHPZCA6M"}`
    
    supports free form additional properties
    
-   position\_ms
    
    integer
    
    integer
    

## Response

-   204
-   401
-   403
-   429

Playback started

endpointhttps://api.spotify.com/v1/me/player/playdevice\_id

* * *

### Request body

```
{
    "context\_uri": "spotify:album:5ht7ItJgpBH7W6vJ5BqpPr",
    "offset": {
        "position": 5
    },
    "position\_ms": 0
}  

```
{ "context\_uri": "spotify:album:5ht7ItJgpBH7W6vJ5BqpPr", "offset": { "position": 5 }, "position\_ms": 0 } /\*\* \* Reset the text fill color so that placeholder is visible \*/ .npm\_\_react-simple-code-editor\_\_textarea:empty { -webkit-text-fill-color: inherit !important; } /\*\* \* Hack to apply on some CSS on IE10 and IE11 \*/ @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) { /\*\* \* IE doesn't support '-webkit-text-fill-color' \* So we use 'color: transparent' to make the text transparent on IE \* Unlike other browsers, it doesn't affect caret color in IE \*/ .npm\_\_react-simple-code-editor\_\_textarea { color: transparent !important; } .npm\_\_react-simple-code-editor\_\_textarea::selection { background-color: #accef7 !important; color: transparent !important; } }

Try it

* * *

## Request sample

cURLWgetHTTPie

```
curl --request PUT \
  --url https://api.spotify.com/v1/me/player/play \
  --header 'Authorization: Bearer 1POdFZRZbvb...qqillRxMr2z' \
  --header 'Content-Type: application/json' \
  --data '{
    "context_uri": "spotify:album:5ht7ItJgpBH7W6vJ5BqpPr",
    "offset": {
        "position": 5
    },
    "position_ms": 0
}'
```

* * *

## Response sample

```
empty response
```
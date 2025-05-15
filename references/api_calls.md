# API calls | Spotify for Developers

Announcement:**REMINDER : We are updating the criteria to be granted extended access to the Web API.**  
Submit your extended quota mode application by May 15th. For more information, read [here.](/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access)

# API calls

\[data-ch-theme="s4d"\] { --ch-t-colorScheme: dark;--ch-t-foreground: #ffffff;--ch-t-background: #1E073C;--ch-t-lighter-inlineBackground: #1e073ce6;--ch-t-editor-background: #1E073C;--ch-t-editor-foreground: #F8F8F2;--ch-t-editor-lineHighlightBackground: #3E3D32;--ch-t-editor-rangeHighlightBackground: #ffffff0b;--ch-t-editor-infoForeground: #3794FF;--ch-t-editor-selectionBackground: #49483E;--ch-t-focusBorder: #007FD4;--ch-t-tab-activeBackground: #1E073C;--ch-t-tab-activeForeground: #ffffff;--ch-t-tab-inactiveBackground: #2D2D2D;--ch-t-tab-inactiveForeground: #ffffff80;--ch-t-tab-border: #252526;--ch-t-tab-activeBorder: #1E073C;--ch-t-editorGroup-border: #444444;--ch-t-editorGroupHeader-tabsBackground: #252526;--ch-t-editorLineNumber-foreground: #858585;--ch-t-input-background: #3C3C3C;--ch-t-input-foreground: #F8F8F2;--ch-t-icon-foreground: #C5C5C5;--ch-t-sideBar-background: #252526;--ch-t-sideBar-foreground: #F8F8F2;--ch-t-sideBar-border: #252526;--ch-t-list-activeSelectionBackground: #094771;--ch-t-list-activeSelectionForeground: #fffffe;--ch-t-list-hoverBackground: #2A2D2E; }

The Spotify Web API is a restful API with different endpoints which return JSON metadata about music artists, albums, and tracks, directly from the Spotify Data Catalogue.

## Base URL

The base address of Web API is `https://api.spotify.com`.

## Authorization

All requests to Spotify Web API require authorization. Make sure you have read the [authorization](/documentation/web-api/concepts/authorization) guide to understand the basics.

To access private data through the Web API, such as user profiles and playlists, an application must get the user’s permission to access the data.

## Requests

Data resources are accessed via standard HTTP requests in UTF-8 format to an API endpoint. The Web API uses the following HTTP verbs:

Method

Action

GET

Retrieves resources

POST

Creates resources

PUT

Changes and/or replaces resources or collections

DELETE

Deletes resources

## Responses

Web API normally returns JSON in the response body. Some endpoints (e.g [Change Playlist Details](/documentation/web-api/reference/change-playlist-details)) don't return JSON but the HTTP status code

### Response Status Codes

Web API uses the following response status codes, as defined in the [RFC 2616](https://www.ietf.org/rfc/rfc2616.txt) and [RFC 6585](https://www.ietf.org/rfc/rfc6585.txt):

Status Code

Description

200

OK - The request has succeeded. The client can read the result of the request in the body and the headers of the response.

201

Created - The request has been fulfilled and resulted in a new resource being created.

202

Accepted - The request has been accepted for processing, but the processing has not been completed.

204

No Content - The request has succeeded but returns no message body.

304

Not Modified. See [Conditional requests](/documentation/web-api/concepts/api-calls#conditional-requests).

400

Bad Request - The request could not be understood by the server due to malformed syntax. The message body will contain more information; see [Response Schema](/documentation/web-api/concepts/api-calls#response-schema).

401

Unauthorized - The request requires user authentication or, if the request included authorization credentials, authorization has been refused for those credentials.

403

Forbidden - The server understood the request, but is refusing to fulfill it.

404

Not Found - The requested resource could not be found. This error can be due to a temporary or permanent condition.

429

Too Many Requests - [Rate limiting](/documentation/web-api/concepts/rate-limits) has been applied.

500

Internal Server Error. You should never receive this error because our clever coders catch them all ... but if you are unlucky enough to get one, please report it to us through a comment at the bottom of this page.

502

Bad Gateway - The server was acting as a gateway or proxy and received an invalid response from the upstream server.

503

Service Unavailable - The server is currently unable to handle the request due to a temporary condition which will be alleviated after some delay. You can choose to resend the request again.

### Response Error

Web API uses two different formats to describe an error:

-   Authentication Error Object
-   Regular Error Object

#### Authentication Error Object

Whenever the application makes requests related to authentication or authorization to Web API, such as retrieving an access token or refreshing an access token, the error response follows [RFC 6749](https://tools.ietf.org/html/rfc6749) on the OAuth 2.0 Authorization Framework.

Key

Value Type

Value Description

error

string

A high level description of the error as specified in [RFC 6749 Section 5.2](https://tools.ietf.org/html/rfc6749#section-5.2).

error\_description

string

A more detailed description of the error as specified in [RFC 6749 Section 4.1.2.1](https://tools.ietf.org/html/rfc6749#section-4.1.2.1).

Here is an example of a failing request to refresh an access token.

`   1  $ curl -H "Authorization: Basic Yjc...cK" -d grant_type=refresh_token -d refresh_token=AQD...f0 "https://accounts.spotify.com/api/token"    2      3  {    4  "error": "invalid_client",    5  "error_description": "Invalid client secret"    6  }            `

#### Regular Error Object

Apart from the response code, unsuccessful responses return a JSON object containing the following information:

Key

Value Type

Value Description

status

integer

The HTTP status code that is also returned in the response header. For further information, see [Response Status Codes](/documentation/web-api/concepts/api-calls#response-status-codes).

message

string

A short description of the cause of the error.

Here, for example is the error that occurs when trying to fetch information for a non-existent track:

`   1  $ curl -i "https://api.spotify.com/v1/tracks/2KrxsD86ARO5beq7Q0Drfqa"    2      3  HTTP/1.1 400 Bad Request    4  {    5  "error": {    6  "status": 400,    7  "message": "invalid id"    8  }    9  }            `

## Conditional Requests

Most API responses contain appropriate cache-control headers set to assist in client-side caching:

-   If you have cached a response, do not request it again until the response has expired.
-   If the response contains an ETag, set the If-None-Match request header to the ETag value.
-   If the response has not changed, the Spotify service responds quickly with **304 Not Modified** status, meaning that your cached version is still good and your application should use it.

## Timestamps

Timestamps are returned in [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601) format as [Coordinated Universal Time (UTC)](http://en.wikipedia.org/wiki/Offset_to_Coordinated_Universal_Time) with a zero offset: `YYYY-MM-DDTHH:MM:SSZ`. If the time is imprecise (for example, the date/time of an album release), an additional field indicates the precision; see for example, `release_date` in an [Album Object](/documentation/web-api/reference/get-an-album).

## Pagination

Some endpoints support a way of paging the dataset, taking an offset and limit as query parameters:

`   1  $ curl    2  https://api.spotify.com/v1/artists/1vCWHaC5f2uS3yhpwWbIA6/albums?album_type=SINGLE&offset=20&limit=10            `

In this example, in a list of 50 (`total`) singles by the specified artist : From the twentieth (`offset`) single, retrieve the next 10 (`limit`) singles.
# Refreshing tokens | Spotify for Developers

Announcement:**REMINDER : We are updating the criteria to be granted extended access to the Web API.**  
Submit your extended quota mode application by May 15th. For more information, read [here.](/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access)

# Refreshing tokens

\[data-ch-theme="s4d"\] { --ch-t-colorScheme: dark;--ch-t-foreground: #ffffff;--ch-t-background: #1E073C;--ch-t-lighter-inlineBackground: #1e073ce6;--ch-t-editor-background: #1E073C;--ch-t-editor-foreground: #F8F8F2;--ch-t-editor-lineHighlightBackground: #3E3D32;--ch-t-editor-rangeHighlightBackground: #ffffff0b;--ch-t-editor-infoForeground: #3794FF;--ch-t-editor-selectionBackground: #49483E;--ch-t-focusBorder: #007FD4;--ch-t-tab-activeBackground: #1E073C;--ch-t-tab-activeForeground: #ffffff;--ch-t-tab-inactiveBackground: #2D2D2D;--ch-t-tab-inactiveForeground: #ffffff80;--ch-t-tab-border: #252526;--ch-t-tab-activeBorder: #1E073C;--ch-t-editorGroup-border: #444444;--ch-t-editorGroupHeader-tabsBackground: #252526;--ch-t-editorLineNumber-foreground: #858585;--ch-t-input-background: #3C3C3C;--ch-t-input-foreground: #F8F8F2;--ch-t-icon-foreground: #C5C5C5;--ch-t-sideBar-background: #252526;--ch-t-sideBar-foreground: #F8F8F2;--ch-t-sideBar-border: #252526;--ch-t-list-activeSelectionBackground: #094771;--ch-t-list-activeSelectionForeground: #fffffe;--ch-t-list-hoverBackground: #2A2D2E; }

A refresh token is a security credential that allows client applications to obtain new access tokens without requiring users to reauthorize the application.

[Access tokens](/documentation/web-api/concepts/access-token) are intentionally configured to have a limited lifespan (1 hour), at the end of which, new tokens can be obtained by providing the original refresh token acquired during the authorization token request response:

`   1  {    2  "access_token": "NgCXRK...MzYjw",    3  "token_type": "Bearer",    4  "scope": "user-read-private user-read-email",    5  "expires_in": 3600,    6  "refresh_token": "NgAagA...Um_SHo"    7  }            `

## Request

To refresh an access token, we must send a `POST` request with the following parameters:

Body Parameter

Relevance

Value

grant\_type

_Required_

Set it to `refresh_token`.

refresh\_token

_Required_

The refresh token returned from the authorization token request.

client\_id

**Only required for the** [PKCE extension](/documentation/web-api/tutorials/code-pkce-flow)

The client ID for your app, available from the developer dashboard.

And the following headers:

Header Parameter

Relevance

Value

Content-Type

_Required_

Always set to `application/x-www-form-urlencoded`.

Authorization

**Only required for the** [Authorization Code](/documentation/web-api/tutorials/code-flow)

Base 64 encoded string that contains the client ID and client secret key. The field must have the format: `Authorization: Basic <base64 encoded client_id:client_secret>`

### Example

The following code snippets represent two examples:

-   A client side (browser) JavaScript function to refresh tokens issued following the [Authorization Code with PKCE extension flow](/documentation/web-api/tutorials/code-pkce-flow).
-   A server side (nodeJS with express) Javascript method to refresh tokens issued under the [Authorization Code flow](/documentation/web-api/tutorials/code-flow).

browser

nodeJS

`   1  const getRefreshToken = async () => {    2      3  // refresh token that has been previously stored    4  const refreshToken = localStorage.getItem('refresh_token');    5  const url = "https://accounts.spotify.com/api/token";    6      7  const payload = {    8  method: 'POST',    9  headers: {    10  'Content-Type': 'application/x-www-form-urlencoded'    11  },    12  body: new URLSearchParams({    13  grant_type: 'refresh_token',    14  refresh_token: refreshToken,    15  client_id: clientId    16  }),    17  }    18  const body = await fetch(url, payload);    19  const response = await body.json();    20      21  localStorage.setItem('access_token', response.access_token);    22  if (response.refresh_token) {    23  localStorage.setItem('refresh_token', response.refresh_token);    24  }    25  }            `

## Response

If everything goes well, you'll receive a `200 OK` response which is very similar to the response when issuing an access token:

`   1  {    2  access_token: 'BQBLuPRYBQ...BP8stIv5xr-Iwaf4l8eg',    3  token_type: 'Bearer',    4  expires_in: 3600,    5  refresh_token: 'AQAQfyEFmJJuCvAFh...cG_m-2KTgNDaDMQqjrOa3',    6  scope: 'user-read-email user-read-private'    7  }            `

The refresh token contained in the response, can be used to request new tokens. Depending on the grant used to get the initial refresh token, a refresh token might not be included in each response. When a refresh token is not returned, continue using the existing token.
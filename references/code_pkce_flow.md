# Authorization Code with PKCE Flow | Spotify for Developers

Announcement:**REMINDER : We are updating the criteria to be granted extended access to the Web API.**  
Submit your extended quota mode application by May 15th. For more information, read [here.](/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access)

# Authorization Code with PKCE Flow

\[data-ch-theme="s4d"\] { --ch-t-colorScheme: dark;--ch-t-foreground: #ffffff;--ch-t-background: #1E073C;--ch-t-lighter-inlineBackground: #1e073ce6;--ch-t-editor-background: #1E073C;--ch-t-editor-foreground: #F8F8F2;--ch-t-editor-lineHighlightBackground: #3E3D32;--ch-t-editor-rangeHighlightBackground: #ffffff0b;--ch-t-editor-infoForeground: #3794FF;--ch-t-editor-selectionBackground: #49483E;--ch-t-focusBorder: #007FD4;--ch-t-tab-activeBackground: #1E073C;--ch-t-tab-activeForeground: #ffffff;--ch-t-tab-inactiveBackground: #2D2D2D;--ch-t-tab-inactiveForeground: #ffffff80;--ch-t-tab-border: #252526;--ch-t-tab-activeBorder: #1E073C;--ch-t-editorGroup-border: #444444;--ch-t-editorGroupHeader-tabsBackground: #252526;--ch-t-editorLineNumber-foreground: #858585;--ch-t-input-background: #3C3C3C;--ch-t-input-foreground: #F8F8F2;--ch-t-icon-foreground: #C5C5C5;--ch-t-sideBar-background: #252526;--ch-t-sideBar-foreground: #F8F8F2;--ch-t-sideBar-border: #252526;--ch-t-list-activeSelectionBackground: #094771;--ch-t-list-activeSelectionForeground: #fffffe;--ch-t-list-hoverBackground: #2A2D2E; }

The authorization code flow with PKCE is the recommended authorization flow if you’re implementing authorization in a mobile app, single page web apps, or any other type of application where the client secret can’t be safely stored.

The implementation of the PKCE extension consists of the following steps:

-   [Code Challenge](/documentation/web-api/tutorials/code-pkce-flow#code-challenge) generation from a [Code Verifier](/documentation/web-api/tutorials/code-pkce-flow#code-verifier).
-   [Request authorization](/documentation/web-api/tutorials/code-pkce-flow#request-user-authorization) from the user and retrieve the authorization code.
-   [Request an access token](/documentation/web-api/tutorials/code-pkce-flow#request-an-access-token) from the authorization code.
-   Finally, use the access token to make API calls.

#### Pre-requisites

This guide assumes that:

-   You have read the [authorization guide](/documentation/web-api/concepts/authorization).
-   You have created an app following the [apps guide](/documentation/web-api/concepts/apps).

#### Example

You can find an example app implementing Authorization Code flow with PKCE extension on GitHub in the [web-api-examples](https://github.com/spotify/web-api-examples/tree/master/authorization/authorization_code_pkce) repository.

## Code Verifier

The PKCE authorization flow starts with the creation of a code verifier. According to the [PKCE standard](https://datatracker.ietf.org/doc/html/rfc7636#section-4.1), a code verifier is a high-entropy cryptographic random string with a length between 43 and 128 characters (the longer the better). It can contain letters, digits, underscores, periods, hyphens, or tildes.

The code verifier could be implemented using the following JavaScript function:

`   1  const generateRandomString = (length) => {    2  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';    3  const values = crypto.getRandomValues(new Uint8Array(length));    4  return values.reduce((acc, x) => acc + possible[x % possible.length], "");    5  }    6      7  const codeVerifier = generateRandomString(64);            `

## Code Challenge

Once the code verifier has been generated, we must transform (hash) it using the SHA256 algorithm. This is the value that will be sent within the user authorization request.

Let's use [window.crypto.subtle.digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest) to generate the value using the SHA256 algorithm from the given data:

`   1  const sha256 = async (plain) => {    2  const encoder = new TextEncoder()    3  const data = encoder.encode(plain)    4  return window.crypto.subtle.digest('SHA-256', data)    5  }            `

Next, we will implement a function `base64encode` that returns the `base64` representation of the digest we just calculated with the `sha256` function:

`   1  const base64encode = (input) => {    2  return btoa(String.fromCharCode(...new Uint8Array(input)))    3  .replace(/=/g, '')    4  .replace(/\+/g, '-')    5  .replace(/\//g, '_');    6  }            `

Let's put all the pieces together to implement the code challenge generation:

`   1  const hashed = await sha256(codeVerifier)    2  const codeChallenge = base64encode(hashed);            `

## Request User Authorization

To request authorization from the user, a `GET` request must be made to the `/authorize` endpoint. This request should include the same parameters as the [authorization code flow](/documentation/web-api/tutorials/code-flow), along with two additional parameters: `code_challenge` and `code_challenge_method`:

Query Parameter

Relevance

Value

client\_id

_Required_

The Client ID generated after registering your application.

response\_type

_Required_

Set to `code`.

redirect\_uri

_Required_

The URI to redirect to after the user grants or denies permission. This URI needs to have been entered in the Redirect URI allowlist that you specified when you registered your application (See the [app guide](/documentation/web-api/concepts/apps)). The value of `redirect_uri` here must exactly match one of the values you entered when you registered your application, including upper or lowercase, terminating slashes, and such.

state

_Optional, but strongly recommended_

This provides protection against attacks such as cross-site request forgery. See [RFC-6749](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1).

scope

_Optional_

A space-separated list of [scopes](/documentation/web-api/concepts/scopes). If no scopes are specified, authorization will be granted only to access publicly available information: that is, only information normally visible in the Spotify desktop, web, and mobile players.

code\_challenge\_method

_Required_

Set to `S256`.

code\_challenge

_Required_

Set to the code challenge that your app calculated in the previous step.

The code for requesting user authorization looks as follows:

`   1  const clientId = 'YOUR_CLIENT_ID';    2  const redirectUri = 'http://127.0.0.1:8080';    3      4  const scope = 'user-read-private user-read-email';    5  const authUrl = new URL("https://accounts.spotify.com/authorize")    6      7  // generated in the previous step    8  window.localStorage.setItem('code_verifier', codeVerifier);    9      10  const params = {    11  response_type: 'code',    12  client_id: clientId,    13  scope,    14  code_challenge_method: 'S256',    15  code_challenge: codeChallenge,    16  redirect_uri: redirectUri,    17  }    18      19  authUrl.search = new URLSearchParams(params).toString();    20  window.location.href = authUrl.toString();            `

The app generates a PKCE code challenge and redirects to the Spotify authorization server login page by updating the `window.location` object value. This allows the user to grant permissions to our application

Please note that the code verifier value is stored locally using the `localStorage` JavaScript property for use in the next step of the authorization flow.

### Response

If the user accepts the requested permissions, the OAuth service redirects the user back to the URL specified in the `redirect_uri` field. This callback contains two query parameters within the URL:

Query Parameter

Value

code

An authorization code that can be exchanged for an access token.

state

The value of the `state` parameter supplied in the request.

We must then parse the URL to retrieve the `code` parameter:

`   1  const urlParams = new URLSearchParams(window.location.search);    2  let code = urlParams.get('code');            `

The `code` will be necessary to request the access token in the next step.

If the user does not accept your request or if an error has occurred, the response query string contains the following parameters:

Query Parameter

Value

error

The reason authorization failed, for example: "access\_denied"

state

The value of the `state` parameter supplied in the request.

## Request an access token

After the user accepts the authorization request of the previous step, we can exchange the authorization code for an access token. We must send a `POST` request to the `/api/token` endpoint with the following parameters:

Body Parameters

Relevance

Value

grant\_type

_Required_

This field must contain the value `authorization_code`.

code

_Required_

The authorization code returned from the previous request.

redirect\_uri

_Required_

This parameter is used for validation only (there is no actual redirection). The value of this parameter must exactly match the value of `redirect_uri` supplied when requesting the authorization code.

client\_id

_Required_

The client ID for your app, available from the developer dashboard.

code\_verifier

_Required_

The value of this parameter must match the value of the `code_verifier` that your app generated in the previous step.

The request must include the following HTTP header:

Header Parameter

Relevance

Value

Content-Type

_Required_

Set to `application/x-www-form-urlencoded`.

The request of the token could be implemented with the following JavaScript function:

`   1  const getToken = async code => {    2      3  // stored in the previous step    4  const codeVerifier = localStorage.getItem('code_verifier');    5      6  const url = "https://accounts.spotify.com/api/token";    7  const payload = {    8  method: 'POST',    9  headers: {    10  'Content-Type': 'application/x-www-form-urlencoded',    11  },    12  body: new URLSearchParams({    13  client_id: clientId,    14  grant_type: 'authorization_code',    15  code,    16  redirect_uri: redirectUri,    17  code_verifier: codeVerifier,    18  }),    19  }    20      21  const body = await fetch(url, payload);    22  const response = await body.json();    23      24  localStorage.setItem('access_token', response.access_token);    25  }            `

### Response

On success, the response will have a `200 OK` status and the following JSON data in the response body:

key

Type

Description

access\_token

string

An access token that can be provided in subsequent calls, for example to Spotify Web API services.

token\_type

string

How the access token may be used: always "Bearer".

scope

string

A space-separated list of scopes which have been granted for this `access_token`

expires\_in

int

The time period (in seconds) for which the access token is valid.

refresh\_token

string

See [refreshing tokens](/documentation/web-api/tutorials/refreshing-tokens).

### What's next?

-   Great! We have the access token. Now you might be wondering: _what do I do with it?_ Take a look at to the [access token](/documentation/web-api/concepts/access-token) guide to learn how to make an API call using your new fresh access token.
    
-   If your access token has expired, you can learn how to issue a new one without requiring users to reauthorize your application by reading the [refresh token](/documentation/web-api/tutorials/refreshing-tokens) guide.
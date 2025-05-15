# Authorization | Spotify for Developers

Announcement:**REMINDER : We are updating the criteria to be granted extended access to the Web API.**  
Submit your extended quota mode application by May 15th. For more information, read [here.](/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access)

# Authorization

Authorization refers to the process of granting a user or application access permissions to Spotify data and features (e.g your application needs permission from a user to access their playlists).

Spotify implements the [OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749) authorization framework:

![Auth Intro](https://developer-assets.spotifycdn.com/images/documentation/web-api/auth_intro.png)

Where:

-   _End User_ corresponds to the Spotify user. The _End User_ grants access to the protected resources (e.g. playlists, personal information, etc.)
    
-   _My App_ is the client that requests access to the protected resources (e.g. a mobile or web app).
    
-   _Server_ which hosts the protected resources and provides authentication and authorization via OAuth 2.0.
    

The access to the protected resources is determined by one or several _scopes_. Scopes enable your application to access specific functionality (e.g. read a playlist, modify your library or just streaming) on behalf of a user. The set of scopes you set during the authorization, determines the access permissions that the user is asked to grant. You can find detailed information about scopes in the [scopes documentation](/documentation/web-api/concepts/scopes).

The authorization process requires valid _client credentials_: a client ID and a client secret. You can follow the [Apps guide](/documentation/web-api/concepts/apps) to learn how to generate them.

Once the authorization is granted, the authorization server issues an access token, which is used to make API calls on behalf the user or application.

The OAuth2 standard defines four grant types (or flows) to request and get an access token. Spotify implements the following ones:

-   [Authorization code](/documentation/web-api/tutorials/code-flow)
-   [Authorization code with PKCE extension](/documentation/web-api/tutorials/code-pkce-flow)
-   [Client credentials](/documentation/web-api/tutorials/client-credentials-flow)
-   [Implicit grant](/documentation/web-api/tutorials/implicit-flow)

Info:

The implicit grant is deprecated and will be removed in the future. To learn more about the deprecation, see this [blog post](/blog/2025-02-12-increasing-the-security-requirements-for-integrating-with-spotify) .

### Which OAuth flow should I use?

Choosing one flow over the rest depends on the application you are building:

-   If you are developing a long-running application (e.g. web app running on the server) in which the user grants permission only once, and the client secret can be safely stored, then the [authorization code flow](/documentation/web-api/tutorials/code-flow) is the recommended choice.
    
-   In scenarios where storing the client secret is not safe (e.g. desktop, mobile apps or JavaScript web apps running in the browser), you can use the [authorization code with PKCE](/documentation/web-api/tutorials/code-pkce-flow), as it provides protection against attacks where the authorization code may be intercepted.
    
-   For some applications running on the backend, such as CLIs or daemons, the system authenticates and authorizes the app rather than a user. For these scenarios, [Client credentials](/documentation/web-api/tutorials/client-credentials-flow) is the typical choice. This flow does not include user authorization, so only endpoints that do not request user information (e.g. user profile data) can be accessed.
    
-   The [implicit grant](/documentation/web-api/tutorials/implicit-flow) has some important downsides: it returns the token in the URL instead of a trusted channel, and does not support refresh token. Thus, we don't recommend using this flow.
    

The following table summarizes the flows' behaviors:

FLOW

Access User Resources

Requires Secret Key (Server-Side)

Access Token Refresh

Authorization code

Yes

Yes

Yes

Authorization code with PKCE

Yes

No

Yes

Client credentials

No

Yes

No

Implicit grant

Yes

No

No
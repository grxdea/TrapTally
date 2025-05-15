# Redirect URIs | Spotify for Developers

Announcement:**REMINDER : We are updating the criteria to be granted extended access to the Web API.**  
Submit your extended quota mode application by May 15th. For more information, read [here.](/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access)

# Redirect URIs

\[data-ch-theme="s4d"\] { --ch-t-colorScheme: dark;--ch-t-foreground: #ffffff;--ch-t-background: #1E073C;--ch-t-lighter-inlineBackground: #1e073ce6;--ch-t-editor-background: #1E073C;--ch-t-editor-foreground: #F8F8F2;--ch-t-editor-lineHighlightBackground: #3E3D32;--ch-t-editor-rangeHighlightBackground: #ffffff0b;--ch-t-editor-infoForeground: #3794FF;--ch-t-editor-selectionBackground: #49483E;--ch-t-focusBorder: #007FD4;--ch-t-tab-activeBackground: #1E073C;--ch-t-tab-activeForeground: #ffffff;--ch-t-tab-inactiveBackground: #2D2D2D;--ch-t-tab-inactiveForeground: #ffffff80;--ch-t-tab-border: #252526;--ch-t-tab-activeBorder: #1E073C;--ch-t-editorGroup-border: #444444;--ch-t-editorGroupHeader-tabsBackground: #252526;--ch-t-editorLineNumber-foreground: #858585;--ch-t-input-background: #3C3C3C;--ch-t-input-foreground: #F8F8F2;--ch-t-icon-foreground: #C5C5C5;--ch-t-sideBar-background: #252526;--ch-t-sideBar-foreground: #F8F8F2;--ch-t-sideBar-border: #252526;--ch-t-list-activeSelectionBackground: #094771;--ch-t-list-activeSelectionForeground: #fffffe;--ch-t-list-hoverBackground: #2A2D2E; }

Error:

Beginning on the 9th of April 2025 we will enforce the subsequent validations to all newly created apps.

  

We expect **all clients** to migrate to the new redirect URI validation by **November 2025**.

  

To know more please refer to the [Spotify Developer Blog](/documentation/blog/2025-02-12-increasing-the-security-requirements-for-integrating-with-spotify).

When you create an app, you need to specify a redirect URI. This is the URI to which Spotify redirects the user after they have granted or denied permission to your app. The redirect URI is required for the authorization code flow and implicit grant flow. The definition of the redirect URI must exactly match the redirect URI you provide when you create your app. The only exception is for loopback IP literals, which can dynamically be assigned ports.

## Requirements

Since we at Spotify, take security very seriously you must follow these requirements when defining your redirect URI:

-   Use HTTPS for your redirect URI, unless you are using a loopback address, when HTTP is permitted.
-   If you are using a loopback address, use the explicit IPv4 or IPv6, like `http://127.0.0.1:PORT` or `http://[::1]:PORT` as your redirect URI.
-   `localhost` is not allowed as redirect URI.

### Loopback addresses and port numbers

When using a loopback IP literal, you might not know the port number used in advance if it can be assigned dynamically. If you don't know the port number in advance, register your redirect URI with a loopback IP literal, but without any port number. You can add the dynamically assigned port number to the redirect URI in the authorization request. Please note that this is only supported for loopback IP literals, and not for other redirect URIs. This is on-par with the [IETF recommendations](https://www.rfc-editor.org/rfc/rfc8252.html#section-7.3).

## Examples

Here are some examples of redirect URIs:

`   1  https://example.com/callback    2  http://127.0.0.1:8000/callback    3  http://[::1]:8000/callback            `
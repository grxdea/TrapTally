# Web API Reference | Spotify for Developers

Announcement:**REMINDER : We are updating the criteria to be granted extended access to the Web API.**  
Submit your extended quota mode application by May 15th. For more information, read [here.](/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access)

Web API •References / Artists / Get Artist

# Get Artist

OAuth 2.0

Get Spotify catalog information for a single artist identified by their unique Spotify ID.

Important policy notes

-   Spotify content may not be downloaded
    
    You may not facilitate downloads of Spotify content or enable “stream ripping”
    
    [More information](/terms/#section-iv-restrictions:~:text=facilitating,make permanent copies of Spotify Content.)
    
-   Keep visual content in its original form
    
    Spotify visual content must be kept in its original form, e.g. you can not crop album artwork, overlay images on album artwork, place a brand/logo on album artwork
    
    [More information](/documentation/design#using-our-content)
    
-   Ensure content attribution
    
    Please keep in mind that metadata, cover art and artist images must be accompanied by a link back to the applicable artist, album, track, or playlist on the Spotify Service. You must also attribute content from Spotify with the logo.
    
    [More information](/policy/#ii-respect-content-and-creators:~:text=If you display any Spotify Content,on the Spotify Service.)
    

## Request

GET

/artists/{id}

-   id
    
    string
    
    Required
    
    The [Spotify ID](/documentation/web-api/concepts/spotify-uris-ids) of the artist.
    
    Example: `0TnOYISbd1XYRBk9myaseg`
    

## Response

-   200
-   401
-   403
-   429

An artist

-   external\_urls
    
    object
    
    Known external URLs for this artist.
    
    -   spotify
        
        string
        
        The [Spotify URL](/documentation/web-api/concepts/spotify-uris-ids) for the object.
        
    
-   followers
    
    object
    
    Information about the followers of the artist.
    
    -   href
        
        string
        
        Nullable
        
        This will always be set to null, as the Web API does not support it at the moment.
        
    -   total
        
        integer
        
        The total number of followers.
        
    
-   genres
    
    array of strings
    
    A list of the genres the artist is associated with. If not yet classified, the array is empty.
    
    Example: `["Prog rock","Grunge"]`
    
-   href
    
    string
    
    A link to the Web API endpoint providing full details of the artist.
    
-   id
    
    string
    
    The [Spotify ID](/documentation/web-api/concepts/spotify-uris-ids) for the artist.
    
-   images
    
    array of ImageObject
    
    Images of the artist in various sizes, widest first.
    
    -   url
        
        string
        
        Required
        
        The source URL of the image.
        
        Example: `"https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228"`
        
    -   height
        
        integer
        
        Required
        
        Nullable
        
        The image height in pixels.
        
        Example: `300`
        
    -   width
        
        integer
        
        Required
        
        Nullable
        
        The image width in pixels.
        
        Example: `300`
        
    
-   name
    
    string
    
    The name of the artist.
    
-   popularity
    
    integer
    
    The popularity of the artist. The value will be between 0 and 100, with 100 being the most popular. The artist's popularity is calculated from the popularity of all the artist's tracks.
    
-   type
    
    string
    
    The object type.
    
    Allowed values: `"artist"`
    
-   uri
    
    string
    
    The [Spotify URI](/documentation/web-api/concepts/spotify-uris-ids) for the artist.
    

endpointhttps://api.spotify.com/v1/artists/{id}id

Try it

* * *

## Request sample

cURLWgetHTTPie

```
curl --request GET \
  --url https://api.spotify.com/v1/artists/0TnOYISbd1XYRBk9myaseg \
  --header 'Authorization: Bearer 1POdFZRZbvb...qqillRxMr2z'
```

* * *

## Response sample

```
{  "external\_urls": {    "spotify": "string"  },  "followers": {    "href": "string",    "total": 0  },  "genres": \["Prog rock", "Grunge"\],  "href": "string",  "id": "string",  "images": \[    {      "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",      "height": 300,      "width": 300    }  \],  "name": "string",  "popularity": 0,  "type": "artist",  "uri": "string"}
```
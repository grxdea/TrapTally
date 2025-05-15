# Web API Reference | Spotify for Developers

Announcement:**REMINDER : We are updating the criteria to be granted extended access to the Web API.**  
Submit your extended quota mode application by May 15th. For more information, read [here.](/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access)

Web API •References / Artists / Get Artist's Albums

# Get Artist's Albums

OAuth 2.0

Get Spotify catalog information about an artist's albums.

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

/artists/{id}/albums

-   id
    
    string
    
    Required
    
    The [Spotify ID](/documentation/web-api/concepts/spotify-uris-ids) of the artist.
    
    Example: `0TnOYISbd1XYRBk9myaseg`
    
-   include\_groups
    
    string
    
    A comma-separated list of keywords that will be used to filter the response. If not supplied, all album types will be returned.  
    Valid values are:  
    \- `album`  
    \- `single`  
    \- `appears_on`  
    \- `compilation`  
    For example: `include_groups=album,single`.
    
    Example: `include_groups=single,appears_on`
    
-   market
    
    string
    
    An [ISO 3166-1 alpha-2 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2). If a country code is specified, only content that is available in that market will be returned.  
    If a valid user access token is specified in the request header, the country associated with the user account will take priority over this parameter.  
    _**Note**: If neither market or user country are provided, the content is considered unavailable for the client._  
    Users can view the country that is associated with their account in the [account settings](https://www.spotify.com/account/overview/).
    
    Example: `market=ES`
    
-   limit
    
    integer
    
    The maximum number of items to return. Default: 20. Minimum: 1. Maximum: 50.
    
    Default: `limit=20`Range: `0` \- `50`Example: `limit=10`
    
-   offset
    
    integer
    
    The index of the first item to return. Default: 0 (the first item). Use with limit to get the next set of items.
    
    Default: `offset=0`Example: `offset=5`
    

## Response

-   200
-   401
-   403
-   429

Pages of albums

-   href
    
    string
    
    Required
    
    A link to the Web API endpoint returning the full result of the request
    
    Example: `"https://api.spotify.com/v1/me/shows?offset=0&limit=20"`
    
-   limit
    
    integer
    
    Required
    
    The maximum number of items in the response (as set in the query or by default).
    
    Example: `20`
    
-   next
    
    string
    
    Required
    
    Nullable
    
    URL to the next page of items. ( `null` if none)
    
    Example: `"https://api.spotify.com/v1/me/shows?offset=1&limit=1"`
    
-   offset
    
    integer
    
    Required
    
    The offset of the items returned (as set in the query or by default)
    
    Example: `0`
    
-   previous
    
    string
    
    Required
    
    Nullable
    
    URL to the previous page of items. ( `null` if none)
    
    Example: `"https://api.spotify.com/v1/me/shows?offset=1&limit=1"`
    
-   total
    
    integer
    
    Required
    
    The total number of items available to return.
    
    Example: `4`
    
-   items
    
    array of SimplifiedAlbumObject
    
    Required
    
    -   album\_type
        
        string
        
        Required
        
        The type of the album.
        
        Allowed values: `"album"`, `"single"`, `"compilation"`Example: `"compilation"`
        
    -   total\_tracks
        
        integer
        
        Required
        
        The number of tracks in the album.
        
        Example: `9`
        
    -   available\_markets
        
        array of strings
        
        Required
        
        The markets in which the album is available: [ISO 3166-1 alpha-2 country codes](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2). _**NOTE**: an album is considered available in a market when at least 1 of its tracks is available in that market._
        
        Example: `["CA","BR","IT"]`
        
    -   external\_urls
        
        object
        
        Required
        
        Known external URLs for this album.
        
        -   spotify
            
            string
            
            The [Spotify URL](/documentation/web-api/concepts/spotify-uris-ids) for the object.
            
        
    -   href
        
        string
        
        Required
        
        A link to the Web API endpoint providing full details of the album.
        
    -   id
        
        string
        
        Required
        
        The [Spotify ID](/documentation/web-api/concepts/spotify-uris-ids) for the album.
        
        Example: `"2up3OPMp9Tb4dAKM2erWXQ"`
        
    -   images
        
        array of ImageObject
        
        Required
        
        The cover art for the album in various sizes, widest first.
        
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
        
        Required
        
        The name of the album. In case of an album takedown, the value may be an empty string.
        
    -   release\_date
        
        string
        
        Required
        
        The date the album was first released.
        
        Example: `"1981-12"`
        
    -   release\_date\_precision
        
        string
        
        Required
        
        The precision with which `release_date` value is known.
        
        Allowed values: `"year"`, `"month"`, `"day"`Example: `"year"`
        
    -   restrictions
        
        object
        
        Included in the response when a content restriction is applied.
        
        -   reason
            
            string
            
            The reason for the restriction. Albums may be restricted if the content is not available in a given market, to the user's subscription type, or when the user's account is set to not play explicit content. Additional reasons may be added in the future.
            
            Allowed values: `"market"`, `"product"`, `"explicit"`
            
        
    -   type
        
        string
        
        Required
        
        The object type.
        
        Allowed values: `"album"`
        
    -   uri
        
        string
        
        Required
        
        The [Spotify URI](/documentation/web-api/concepts/spotify-uris-ids) for the album.
        
        Example: `"spotify:album:2up3OPMp9Tb4dAKM2erWXQ"`
        
    -   artists
        
        array of SimplifiedArtistObject
        
        Required
        
        The artists of the album. Each artist object includes a link in `href` to more detailed information about the artist.
        
        -   external\_urls
            
            object
            
            Known external URLs for this artist.
            
            -   spotify
                
                string
                
                The [Spotify URL](/documentation/web-api/concepts/spotify-uris-ids) for the object.
                
            
        -   href
            
            string
            
            A link to the Web API endpoint providing full details of the artist.
            
        -   id
            
            string
            
            The [Spotify ID](/documentation/web-api/concepts/spotify-uris-ids) for the artist.
            
        -   name
            
            string
            
            The name of the artist.
            
        -   type
            
            string
            
            The object type.
            
            Allowed values: `"artist"`
            
        -   uri
            
            string
            
            The [Spotify URI](/documentation/web-api/concepts/spotify-uris-ids) for the artist.
            
        
    -   album\_group
        
        string
        
        Required
        
        This field describes the relationship between the artist and the album.
        
        Allowed values: `"album"`, `"single"`, `"compilation"`, `"appears_on"`Example: `"compilation"`
        
    

endpointhttps://api.spotify.com/v1/artists/{id}/albumsidinclude\_groupsmarketlimitoffset

Try it

* * *

## Request sample

cURLWgetHTTPie

```
curl --request GET \
  --url https://api.spotify.com/v1/artists/0TnOYISbd1XYRBk9myaseg/albums \
  --header 'Authorization: Bearer 1POdFZRZbvb...qqillRxMr2z'
```

* * *

## Response sample

```
{  "href": "https://api.spotify.com/v1/me/shows?offset=0&limit=20",  "limit": 20,  "next": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",  "offset": 0,  "previous": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",  "total": 4,  "items": \[    {      "album\_type": "compilation",      "total\_tracks": 9,      "available\_markets": \["CA", "BR", "IT"\],      "external\_urls": {        "spotify": "string"      },      "href": "string",      "id": "2up3OPMp9Tb4dAKM2erWXQ",      "images": \[        {          "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",          "height": 300,          "width": 300        }      \],      "name": "string",      "release\_date": "1981-12",      "release\_date\_precision": "year",      "restrictions": {        "reason": "market"      },      "type": "album",      "uri": "spotify:album:2up3OPMp9Tb4dAKM2erWXQ",      "artists": \[        {          "external\_urls": {            "spotify": "string"          },          "href": "string",          "id": "string",          "name": "string",          "type": "artist",          "uri": "string"        }      \],      "album\_group": "compilation"    }  \]}
```
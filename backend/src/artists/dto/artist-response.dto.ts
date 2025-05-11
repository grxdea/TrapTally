        // src/artists/dto/artist-response.dto.ts

        /**
         * Defines the structure of the artist data returned by the API.
         * This matches the data needed by the ArtistTableRow component on the frontend.
         */
        export class ArtistResponseDto {
            id: string; // The internal ID of the artist
            name: string; // Artist's name
            monthlyFeatures: number; // Count of features in monthly playlists
            yearlyFeatures: number; // Count of features in yearly playlists
            bestOfSongs: number; // Count of songs in their "Best Of" playlist
            // spotifyArtistId: string; // Optional: if frontend needs to link to Spotify artist page directly
            // spotifyUrl?: string; // Optional: direct link to artist on Spotify
            // imageUrl?: string; // Optional: if you plan to store/serve artist images
          }
          
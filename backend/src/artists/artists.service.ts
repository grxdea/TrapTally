// src/artists/artists.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Artist, PlaylistType } from '@prisma/client'; // Import relevant types
import { ArtistResponseDto } from './dto/artist-response.dto'; // Base DTO for list view
import { HttpService } from '@nestjs/axios';
import { AuthService } from '../auth/auth.service';
import axios from 'axios'; // Import axios for type guard

// Define DTO for the detailed artist view, including songs
export class ArtistDetailDto extends ArtistResponseDto {
    songs: ArtistDetailSongDto[]; // Add a list of songs
}

// Define DTO for songs shown on the artist detail page
export class ArtistDetailSongDto {
    id: string; // Song ID
    title: string;
    coverImageUrl: string;
    spotifyUrl: string;
    releaseYear: number;
    releaseMonth?: number | null;
    spotifyTrackId: string; // For playback
    // Include other artists on the same song
    artists: { id: string; name: string }[];
    // Include playlists this song appears on within our curated set
    playlists: { id: string; name: string; type: PlaylistType }[];
}

@Injectable()
export class ArtistsService {
  private readonly logger = new Logger(ArtistsService.name);

  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService, 
    private readonly authService: AuthService, 
  ) {}

  /**
   * Fetches all artists from the database and maps them to the DTO.
   * @returns A promise that resolves to an array of ArtistResponseDto.
   */
  async findAll(): Promise<ArtistResponseDto[]> {
    const artists = await this.prisma.artist.findMany({
      orderBy: { name: 'asc' }, // Order artists alphabetically
      select: {
        id: true,
        name: true,
        artistImageUrl: true,
        monthlyFeatureCount: true,
        yearlyFeatureCount: true,
        bestOfPlaylistSongCount: true,
      },
    });

    // Map Prisma's Artist model to our ArtistResponseDto
    return artists.map(artist => ({
      id: artist.id,
      name: artist.name,
      artistImageUrl: artist.artistImageUrl,
      monthlyFeatures: artist.monthlyFeatureCount,
      yearlyFeatures: artist.yearlyFeatureCount,
      bestOfSongs: artist.bestOfPlaylistSongCount,
    }));
  }

  /**
   * Fetches detailed information for a single artist by their ID,
   * including the songs they are featured on within the curated playlists.
   * @param id The ID of the artist to fetch.
   * @returns A promise that resolves to an ArtistDetailDto.
   * @throws NotFoundException if no artist with the given ID is found.
   */
  async findOne(id: string): Promise<ArtistDetailDto> {
    // Fetch the artist and include their related songs via the SongArtist join table
    const artist = await this.prisma.artist.findUnique({
      where: { id },
      select: { 
        id: true,
        name: true,
        artistImageUrl: true,
        monthlyFeatureCount: true,
        yearlyFeatureCount: true,
        bestOfPlaylistSongCount: true,
        // Include songs associated with this artist
        songs: { 
          include: {
            // From SongArtist, include the actual Song details
            song: {
              include: {
                // From Song, include its artists (to show collaborators)
                artists: {
                  include: {
                    artist: { 
                      select: { id: true, name: true },
                    },
                  },
                  orderBy: { artist: { name: 'asc' } }, 
                },
                // From Song, include its playlists (to show where it's featured)
                playlists: {
                  include: {
                    playlist: { 
                      select: { id: true, name: true, type: true },
                    },
                  },
                   orderBy: { playlist: { name: 'asc' } }, 
                },
              },
            },
          },
          // Optional: Order the songs shown on the artist's page, e.g., by release year
          orderBy: { song: { releaseYear: 'desc' } },
        },
      },
    });

    if (!artist) {
      throw new NotFoundException(`Artist with ID "${id}" not found`);
    }

    // Map the fetched data to the ArtistDetailDto structure
    const artistSongs: ArtistDetailSongDto[] = artist.songs.map(({ song }) => ({
        id: song.id,
        title: song.title,
        coverImageUrl: song.coverImageUrl,
        spotifyUrl: song.spotifyUrl,
        releaseYear: song.releaseYear,
        releaseMonth: song.releaseMonth,
        spotifyTrackId: song.spotifyTrackId,
        // Map collaborators
        artists: song.artists.map(({ artist: songArtist }) => ({
            id: songArtist.id,
            name: songArtist.name,
        })),
        // Map playlists the song appears on
        playlists: song.playlists.map(({ playlist }) => ({
            id: playlist.id,
            name: playlist.name,
            type: playlist.type,
        })),
    }));


    return {
      id: artist.id,
      name: artist.name,
      artistImageUrl: artist.artistImageUrl,
      monthlyFeatures: artist.monthlyFeatureCount,
      yearlyFeatures: artist.yearlyFeatureCount,
      bestOfSongs: artist.bestOfPlaylistSongCount,
      // Include the mapped songs
      songs: artistSongs,
    };
  }

  /**
   * Fetches an artist's image URL from Spotify using their spotifyArtistId
   * and updates the artist record in the database.
   * @param internalArtistId The internal ID of the artist to update.
   * @returns The updated Artist object or null if an error occurred or no update was needed.
   */
  async updateArtistSpotifyImage(internalArtistId: string): Promise<Artist | null> {
    this.logger.log(`Attempting to update Spotify image for artist ID: ${internalArtistId}`);
    const artist = await this.prisma.artist.findUnique({
      where: { id: internalArtistId },
    });

    if (!artist) {
      this.logger.warn(`Artist with internal ID "${internalArtistId}" not found.`);
      throw new NotFoundException(`Artist with internal ID "${internalArtistId}" not found`);
    }

    if (!artist.spotifyArtistId) {
      this.logger.warn(`Artist ${artist.name} (ID: ${internalArtistId}) does not have a spotifyArtistId. Cannot fetch image.`);
      return artist; // Return artist as is, no update possible
    }

    try {
      const spotifyToken = await this.authService.getClientCredentialsToken();
      const spotifyApiUrl = `https://api.spotify.com/v1/artists/${artist.spotifyArtistId}`;

      this.logger.log(`Fetching Spotify artist data from: ${spotifyApiUrl}`);
      const response = await this.httpService.get(spotifyApiUrl, {
        headers: { 'Authorization': `Bearer ${spotifyToken}` },
      }).toPromise();

      if (!response || !response.data) {
        this.logger.error(`No response or invalid response data received from Spotify API for artist ID: ${internalArtistId} at URL: ${spotifyApiUrl}`);
        return artist; // Return artist as is, preventing access to undefined response.data
      }

      const spotifyArtistData = response.data;
      let newImageUrl: string | null = null;

      if (spotifyArtistData.images && spotifyArtistData.images.length > 0) {
        // Prefer a medium-sized image if available (e.g., around 300-320px width)
        // Spotify usually provides images in descending order of size (largest first)
        const preferredImage = 
          spotifyArtistData.images.find(img => img.width >= 300 && img.width <= 400) || 
          spotifyArtistData.images.find(img => img.width >= 160 && img.width < 300) || // fallback to smaller
          spotifyArtistData.images[0]; // fallback to largest/first if specific sizes not found
        
        newImageUrl = preferredImage ? preferredImage.url : null;
        this.logger.log(`Found image URL for ${artist.name}: ${newImageUrl}`);
      } else {
        this.logger.log(`No images found on Spotify for artist ${artist.name} (Spotify ID: ${artist.spotifyArtistId})`);
      }

      if (newImageUrl && newImageUrl !== artist.artistImageUrl) {
        this.logger.log(`Updating artist ${artist.name} with new image URL: ${newImageUrl}`);
        return this.prisma.artist.update({
          where: { id: internalArtistId },
          data: { artistImageUrl: newImageUrl },
        });
      } else if (!newImageUrl && artist.artistImageUrl) {
        // If Spotify has no image now, but we had one, clear it (optional behavior)
        this.logger.log(`Clearing existing image URL for artist ${artist.name} as Spotify returned no images.`);
        return this.prisma.artist.update({
            where: { id: internalArtistId },
            data: { artistImageUrl: null },
        });
      } else {
        this.logger.log(`Image URL for ${artist.name} is already up-to-date or no new image found. No update performed.`);
        return artist; // No change needed
      }
    } catch (error) {
      let finalErrorMessage: string;

      if (axios.isAxiosError(error)) {
        const axiosError = error; // Explicitly typed variable for clarity
        if (axiosError.response) {
          const data = axiosError.response.data;
          const statusText = axiosError.response.statusText;
          let parsedDataMessage: string | null = null;

          if (data) {
            const errorData = data as any; // Using 'as any' for flexibility with diverse error shapes
            if (errorData.error && typeof errorData.error === 'object' && typeof errorData.error.message === 'string') {
              parsedDataMessage = errorData.error.message;
            } else if (typeof errorData.error_description === 'string') {
              parsedDataMessage = errorData.error_description;
            } else if (typeof errorData.error === 'string') {
              parsedDataMessage = errorData.error;
            }
          }

          if (parsedDataMessage) finalErrorMessage = parsedDataMessage;
          else if (statusText) finalErrorMessage = statusText;
          else finalErrorMessage = axiosError.message; // Fallback to axiosError.message if data/statusText don't yield a message
        } else {
          finalErrorMessage = axiosError.message;
        }
      } else if (error instanceof Error) {
        finalErrorMessage = error.message;
      } else {
        finalErrorMessage = 'An unknown, non-standard error occurred.';
      }

      this.logger.error(
        `Failed to fetch or update Spotify image for artist ${artist.name} (ID: ${internalArtistId}): ${finalErrorMessage}`,
        error instanceof Error ? error.stack : 'Stack trace not available for non-Error type',
      );
      // Depending on policy, you might re-throw or just return null/artist
      // For now, let's not crash the whole process if one artist image update fails.
      return null; 
    }
  }

  /**
   * Finds an artist on Spotify by their name, stores their Spotify Artist ID,
   * and then attempts to update their artist image URL.
   * @param internalArtistId The internal ID of the artist to process.
   * @returns The updated Artist object or null if an error occurred.
   */
  async findAndStoreSpotifyArtistId(internalArtistId: string): Promise<Artist | null> {
    this.logger.log(`Attempting to find and store Spotify ID for artist ID: ${internalArtistId}`);
    const artist = await this.prisma.artist.findUnique({ where: { id: internalArtistId } });

    if (!artist) {
      this.logger.warn(`Artist with internal ID "${internalArtistId}" not found during Spotify ID search.`);
      throw new NotFoundException(`Artist with internal ID "${internalArtistId}" not found`);
    }

    if (artist.spotifyArtistId) {
      this.logger.log(`Artist ${artist.name} (ID: ${internalArtistId}) already has Spotify ID: ${artist.spotifyArtistId}. Skipping search, but will attempt image update.`);
      // Even if ID exists, image might be missing or need refresh
      await this.updateArtistSpotifyImage(internalArtistId);
      return this.prisma.artist.findUnique({ where: { id: internalArtistId } });
    }

    if (!artist.name) {
      this.logger.warn(`Artist ID ${internalArtistId} has no name. Cannot search Spotify.`);
      return artist; // Return artist as is, no update possible
    }

    try {
      const spotifyToken = await this.authService.getClientCredentialsToken();
      const searchUrl = `https://api.spotify.com/v1/search`;
      
      this.logger.log(`Searching Spotify for artist: "${artist.name}"`);
      const searchResponse = await this.httpService.get(searchUrl, {
        headers: { 'Authorization': `Bearer ${spotifyToken}` },
        params: {
          q: artist.name,
          type: 'artist',
          limit: 1 // Take the top result for now
        }
      }).toPromise();

      if (!searchResponse || !searchResponse.data || !searchResponse.data.artists) {
        this.logger.warn(`Spotify search for "${artist.name}" (ID: ${internalArtistId}) returned an unexpected response structure or no data.`);
        return artist; // Return original artist, as we can't process this response
      }
      const searchResults = searchResponse.data.artists.items;

      if (searchResults && searchResults.length > 0) {
        const spotifyArtist = searchResults[0];
        // Basic name check (case-insensitive partial match)
        const localNameLower = artist.name.toLowerCase();
        const spotifyNameLower = spotifyArtist.name.toLowerCase();

        if (spotifyNameLower.includes(localNameLower) || localNameLower.includes(spotifyNameLower)) {
          this.logger.log(`Found Spotify artist: ${spotifyArtist.name} (ID: ${spotifyArtist.id}) for local artist: ${artist.name}. Storing ID.`);
          
          await this.prisma.artist.update({
            where: { id: internalArtistId },
            data: { spotifyArtistId: spotifyArtist.id },
          });
          
          // Now that spotifyArtistId is stored, fetch the image.
          this.logger.log(`Spotify ID stored for ${artist.name}. Now attempting to fetch image.`);
          await this.updateArtistSpotifyImage(internalArtistId); // This will re-fetch the artist from DB internally
          
          // Return the fully updated artist record
          return this.prisma.artist.findUnique({ where: { id: internalArtistId } });

        } else {
          this.logger.warn(`Spotify search top result "${spotifyArtist.name}" (ID: ${spotifyArtist.id}) did not sufficiently match local artist "${artist.name}". Spotify ID not stored.`);
          return artist; // Return original artist, no ID stored
        }
      } else {
        this.logger.warn(`No Spotify artist found for name: "${artist.name}"`);
        return artist; // Return original artist, no ID found
      }

    } catch (error) {
      let finalErrorMessage: string;
      if (axios.isAxiosError(error)) {
        const axiosError = error; // Explicitly typed variable for clarity
        if (axiosError.response) {
          const data = axiosError.response.data;
          const statusText = axiosError.response.statusText;
          let parsedDataMessage: string | null = null;
          if (data) {
            const errorData = data as any;
            if (errorData.error && typeof errorData.error === 'object' && typeof errorData.error.message === 'string') {
              parsedDataMessage = errorData.error.message;
            } else if (typeof errorData.error_description === 'string') {
              parsedDataMessage = errorData.error_description;
            } else if (typeof errorData.error === 'string') {
              parsedDataMessage = errorData.error;
            }
          }
          if (parsedDataMessage) finalErrorMessage = parsedDataMessage;
          else if (statusText) finalErrorMessage = statusText;
          else finalErrorMessage = axiosError.message; // Fallback to axiosError.message if data/statusText don't yield a message
        } else {
          finalErrorMessage = axiosError.message;
        }
      } else if (error instanceof Error) {
        finalErrorMessage = error.message;
      } else {
        finalErrorMessage = 'An unknown, non-standard error occurred while searching for Spotify ID.';
      }
      this.logger.error(
        `Failed during Spotify ID search or update for artist ${artist.name} (ID: ${internalArtistId}): ${finalErrorMessage}`,
        error instanceof Error ? error.stack : 'Stack trace not available for non-Error type',
      );
      return null; // Indicate an error occurred during the process
    }
  }

  /**
   * Processes all artists in the database to find and store their Spotify Artist ID and image URL.
   * @returns A summary of the batch operation.
   */
  async batchFindAndStoreSpotifyInfoForAllArtists(): Promise<any> { // Consider defining a specific DTO for the summary
    this.logger.log('Starting batch process to find and store Spotify info for all artists.');
    const allArtists = await this.prisma.artist.findMany();
    
    let processedCount = 0;
    let successCount = 0;
    let skippedCount = 0; // For artists already having Spotify ID or no name
    let errorCount = 0;
    const errorDetails: { artistId: string; artistName: string | null; error: string }[] = [];

    for (const artist of allArtists) {
      processedCount++;
      this.logger.log(`Batch processing artist: ${artist.name || 'Unnamed Artist'} (ID: ${artist.id})`);
      try {
        // Check if we should skip (already has ID or no name)
        if (artist.spotifyArtistId) {
          this.logger.log(`Artist ${artist.name} (ID: ${artist.id}) already has Spotify ID. Attempting image update only.`);
          // We still call findAndStoreSpotifyArtistId as it handles image updates if ID exists
          const result = await this.findAndStoreSpotifyArtistId(artist.id);
          if (result && result.artistImageUrl) {
            // If image was updated or confirmed, count as success for this context
            successCount++; 
          } else if (result) {
            // ID was present, image might not have been updated or was already there
            skippedCount++; // Or a more nuanced count if needed
          } else {
            // An error occurred during the image update part for an artist with existing ID
            errorCount++;
            errorDetails.push({
              artistId: artist.id,
              artistName: artist.name,
              error: 'Error during image update for artist with existing Spotify ID.',
            });
          }
          continue; // Move to next artist
        }
        if (!artist.name) {
          this.logger.warn(`Artist ID ${artist.id} has no name. Skipping Spotify search.`);
          skippedCount++;
          continue; // Move to next artist
        }

        const updatedArtist = await this.findAndStoreSpotifyArtistId(artist.id);
        if (updatedArtist && updatedArtist.spotifyArtistId && updatedArtist.artistImageUrl) {
          successCount++;
          this.logger.log(`Successfully updated Spotify info for ${updatedArtist.name}`);
        } else if (updatedArtist && updatedArtist.spotifyArtistId && !updatedArtist.artistImageUrl) {
          // ID found, but image not (could be Spotify API has no image, or our logic failed for image part)
          this.logger.warn(`Spotify ID found for ${updatedArtist.name}, but no image URL was stored.`);
          // Decide if this counts as partial success or error for batch summary
          successCount++; // Counting as success for ID finding for now
        } else if (updatedArtist && !updatedArtist.spotifyArtistId) {
          // This case implies findAndStoreSpotifyArtistId returned the artist without storing an ID (e.g. no match)
           this.logger.log(`No Spotify ID found or stored for ${artist.name}.`);
           skippedCount++; // Or a 'notFound' count
        } else {
          // This means findAndStoreSpotifyArtistId returned null (an error occurred)
          throw new Error('findAndStoreSpotifyArtistId returned null, indicating an internal error.');
        }
      } catch (e) {
        errorCount++;
        const errorMessage = e instanceof Error ? e.message : 'Unknown error during batch processing for artist.';
        this.logger.error(`Error processing artist ${artist.name} (ID: ${artist.id}) in batch: ${errorMessage}`);
        errorDetails.push({ artistId: artist.id, artistName: artist.name, error: errorMessage });
      }
    }

    const summary = {
      totalArtistsProcessed: processedCount,
      successfulUpdates: successCount,
      skipped: skippedCount,
      errors: errorCount,
      errorDetails: errorDetails,
    };

    this.logger.log('Batch Spotify info update process completed.');
    this.logger.log(`Summary: ${JSON.stringify(summary)}`);

    return summary;
  }
}

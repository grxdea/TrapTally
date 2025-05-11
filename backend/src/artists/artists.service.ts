// src/artists/artists.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Artist, PlaylistType } from '@prisma/client'; // Import relevant types
import { ArtistResponseDto } from './dto/artist-response.dto'; // Base DTO for list view

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
  constructor(private prisma: PrismaService) {}

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
        monthlyFeatureCount: true,
        yearlyFeatureCount: true,
        bestOfPlaylistSongCount: true,
      },
    });

    // Map Prisma's Artist model to our ArtistResponseDto
    return artists.map(artist => ({
      id: artist.id,
      name: artist.name,
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
      include: {
        // Include songs associated with this artist
        songs: { // This refers to the 'songs' relation field on the Artist model (linking to SongArtist)
          include: {
            // From SongArtist, include the actual Song details
            song: {
              include: {
                // From Song, include its artists (to show collaborators)
                artists: {
                  include: {
                    artist: { // Include the actual Artist record for collaborators
                      select: { id: true, name: true },
                    },
                  },
                  orderBy: { artist: { name: 'asc' } }, // Order collaborators alphabetically
                },
                // From Song, include its playlists (to show where it's featured)
                playlists: {
                  include: {
                    playlist: { // Include the actual Playlist record
                      select: { id: true, name: true, type: true },
                    },
                  },
                   orderBy: { playlist: { name: 'asc' } }, // Order playlists alphabetically
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
      monthlyFeatures: artist.monthlyFeatureCount,
      yearlyFeatures: artist.yearlyFeatureCount,
      bestOfSongs: artist.bestOfPlaylistSongCount,
      // Include the mapped songs
      songs: artistSongs,
    };
  }

  // Placeholder for create, update, delete methods if needed later
}

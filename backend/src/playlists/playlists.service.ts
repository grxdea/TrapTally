// src/playlists/playlists.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Playlist, PlaylistType } from '@prisma/client';

// Define the structure for returning a list of playlists
export interface PlaylistSummaryDto {
  id: string;
  name: string;
  coverImageUrl: string;
  spotifyUrl: string;
  associatedYear?: number | null;
  associatedMonth?: number | null;
  // Add other summary fields if needed
}

// Define the structure for returning songs within a playlist
export interface PlaylistSongDto {
  id: string; // Song ID
  title: string;
  coverImageUrl: string;
  spotifyUrl: string;
  releaseYear: number;
  releaseMonth?: number | null;
  artists: { id: string; name: string }[]; // List of artists on the song
  spotifyTrackId: string; // Needed for playback URI
  album?: { // Album information
    id: string;
    name: string;
    url?: string;
  } | null;
}

@Injectable()
export class PlaylistsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Fetches playlists of a specific type (e.g., Yearly).
   * @param type The type of playlist to fetch (Yearly, Monthly, Artist).
   * @returns A promise resolving to an array of PlaylistSummaryDto.
   */
  async findByType(type: PlaylistType): Promise<PlaylistSummaryDto[]> {
    const playlists = await this.prisma.playlist.findMany({
      where: { type: type },
      select: {
        id: true,
        name: true,
        coverImageUrl: true,
        spotifyUrl: true,
        associatedYear: true,
        associatedMonth: true,
      },
      // Optional: Add ordering, e.g., by year/month
      orderBy: [
        { associatedYear: 'desc' },
        { associatedMonth: 'desc' },
        { name: 'asc' },
      ],
    });

    return playlists; // The selected fields already match PlaylistSummaryDto
  }

  /**
   * Fetches all songs associated with a specific playlist ID.
   * @param playlistId The internal ID of the playlist.
   * @returns A promise resolving to an array of PlaylistSongDto.
   * @throws NotFoundException if the playlist ID doesn't exist.
   */
  async findSongsByPlaylistId(playlistId: string): Promise<PlaylistSongDto[]> {
    // Retrieve the playlist with songs
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        songs: {
          orderBy: { orderInPlaylist: 'asc' },
          include: {
            song: {
              include: {
                artists: {
                  include: {
                    artist: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!playlist) {
      throw new NotFoundException(`Playlist with ID "${playlistId}" not found.`);
    }

    // Map the nested structure to the flat PlaylistSongDto
    return playlist.songs.map(playlistSong => {
      const song = playlistSong.song;
      
      return {
        id: song.id,
        title: song.title,
        coverImageUrl: song.coverImageUrl,
        spotifyUrl: song.spotifyUrl,
        releaseYear: song.releaseYear,
        releaseMonth: song.releaseMonth,
        artists: song.artists.map(songArtist => ({
          id: songArtist.artist.id,
          name: songArtist.artist.name
        })),
        spotifyTrackId: song.spotifyTrackId,
        // Only include album info if albumName exists
        album: song.albumName ? {
          id: song.albumId || '',
          name: song.albumName,
          url: song.albumUrl || undefined
        } : null
      };
    });
  }

  // Placeholder for other methods (findOne, create, update, remove) if needed
}
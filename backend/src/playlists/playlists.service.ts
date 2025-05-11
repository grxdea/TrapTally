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
        const playlistWithSongs = await this.prisma.playlist.findUnique({
          where: { id: playlistId },
          include: {
            songs: { // Include the related PlaylistSong records
              orderBy: { orderInPlaylist: 'asc' }, // Order songs by their position in the playlist
              include: {
                song: { // Include the actual Song record from PlaylistSong
                  include: {
                    artists: { // Include the related SongArtist records
                      include: {
                        artist: { // Include the actual Artist record from SongArtist
                          select: { id: true, name: true }, // Select only needed artist fields
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!playlistWithSongs) {
          throw new NotFoundException(`Playlist with ID "${playlistId}" not found.`);
        }

        // Map the nested structure to the flat PlaylistSongDto
        return playlistWithSongs.songs.map(playlistSong => ({
          id: playlistSong.song.id,
          title: playlistSong.song.title,
          coverImageUrl: playlistSong.song.coverImageUrl,
          spotifyUrl: playlistSong.song.spotifyUrl,
          releaseYear: playlistSong.song.releaseYear,
          releaseMonth: playlistSong.song.releaseMonth,
          artists: playlistSong.song.artists.map(songArtist => songArtist.artist),
          spotifyTrackId: playlistSong.song.spotifyTrackId, // Pass the Spotify Track ID
        }));
      }

      // Placeholder for other methods (findOne, create, update, remove) if needed
    }
    
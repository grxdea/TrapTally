    // src/playlists/playlists.controller.ts
    import { Controller, Get, Param, ParseUUIDPipe, NotFoundException } from '@nestjs/common';
    import { PlaylistsService, PlaylistSummaryDto, PlaylistSongDto } from './playlists.service';
    import { PlaylistType } from '@prisma/client';

    @Controller('playlists') // Base path /api/playlists
    export class PlaylistsController {
      constructor(private readonly playlistsService: PlaylistsService) {}

      /**
       * Handles GET requests to /playlists/yearly.
       * Retrieves all playlists marked as 'Yearly'.
       * @returns An array of PlaylistSummaryDto.
       */
      @Get('yearly')
      async findYearlyPlaylists(): Promise<PlaylistSummaryDto[]> {
        return this.playlistsService.findByType(PlaylistType.Yearly);
      }

      /**
       * Handles GET requests to /playlists/monthly.
       * Retrieves all playlists marked as 'Monthly'.
       * @returns An array of PlaylistSummaryDto.
       */
      @Get('monthly')
      async findMonthlyPlaylists(): Promise<PlaylistSummaryDto[]> {
        return this.playlistsService.findByType(PlaylistType.Monthly);
      }

      /**
       * Handles GET requests to /playlists/artist.
       * Retrieves all playlists marked as 'Artist' (Best Of).
       * @returns An array of PlaylistSummaryDto.
       */
      @Get('artist') // Or maybe 'best-of'? Choose a consistent name.
      async findArtistPlaylists(): Promise<PlaylistSummaryDto[]> {
        return this.playlistsService.findByType(PlaylistType.Artist);
      }


      /**
       * Handles GET requests to /playlists/:id/songs.
       * Retrieves all songs for a specific playlist.
       * @param id The UUID of the playlist.
       * @returns An array of PlaylistSongDto.
       * @throws NotFoundException if the playlist is not found.
       */
      @Get(':id/songs')
      async findSongsByPlaylistId(
        @Param('id', ParseUUIDPipe) id: string, // Validate that id is a UUID
      ): Promise<PlaylistSongDto[]> {
        try {
          const songs = await this.playlistsService.findSongsByPlaylistId(id);
          return songs;
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new NotFoundException(error.message); // Re-throw to ensure correct HTTP status
          }
          throw error; // Re-throw other unexpected errors
        }
      }

      // Placeholder for other playlist routes (e.g., GET /playlists/:id for playlist details)
    }
    
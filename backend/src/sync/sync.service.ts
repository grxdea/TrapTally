// src/sync/sync.service.ts
import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import SpotifyWebApi from 'spotify-web-api-node'; // Import type if needed, actual instance from AuthService
import { PlaylistType, Prisma, Artist } from '@prisma/client'; // Import Prisma types

// Define the structure for your curated playlist configuration
interface CuratedPlaylistConfig {
  spotifyPlaylistId: string;
  type: PlaylistType; // 'Monthly', 'Yearly', or 'Artist'
  nameOverride?: string; // Optional: if you want to name it differently in your DB
  associatedYear?: number; // For 'Monthly' or 'Yearly'
  associatedMonth?: number; // For 'Monthly'
}

// Helper function to convert month name to number
const monthNameToNumber = (monthName: string): number | undefined => {
  const months: { [key: string]: number } = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  };
  return months[monthName.toLowerCase()];
};

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  // CURATED_PLAYLIST_CONFIGS populated with the user's provided list
  private readonly CURATED_PLAYLIST_CONFIGS: CuratedPlaylistConfig[] = [
    { spotifyPlaylistId: '7lVJnC9RxgH4G0gd0Y9rGl', type: PlaylistType.Artist, nameOverride: "Best of Doe B" },
    { spotifyPlaylistId: '0ZOxI2tN9fkaouL5Z10qfN', type: PlaylistType.Artist, nameOverride: "Best of Rylo Rodriguez" },
    { spotifyPlaylistId: '0nH4TC46BaaSkOdagAlHbB', type: PlaylistType.Artist, nameOverride: "Best of Trapland Pat" },
    { spotifyPlaylistId: '187JSTloqJ9xh3oShx0BYZ', type: PlaylistType.Artist, nameOverride: "Best of Tre Savage" },
    { spotifyPlaylistId: '2RfluDhX9i2sDNQFtdYFvi', type: PlaylistType.Artist, nameOverride: "Best of Montana 700" },
    { spotifyPlaylistId: '1vrYvdwa1ziPQyyY6SrqpW', type: PlaylistType.Artist, nameOverride: "Best of YFN Lucci" },
    { spotifyPlaylistId: '4hTK8wOhIWZYK5MH79GQH8', type: PlaylistType.Artist, nameOverride: "Best of Yak Gotti" },
    { spotifyPlaylistId: '46s6obIkvLrd37k3zFNvpP', type: PlaylistType.Artist, nameOverride: "Best of Slimelife Shawty" },
    { spotifyPlaylistId: '5EVPbN0brTN56JFA75cH44', type: PlaylistType.Artist, nameOverride: "Best of Johnny Cinco" },
    { spotifyPlaylistId: '37Q9DCMDVSqVOZhAklHHYL', type: PlaylistType.Artist, nameOverride: "Best of Hunxho" },
    { spotifyPlaylistId: '7y9nrcjvHCmQuqyOq6JsJq', type: PlaylistType.Artist, nameOverride: "Best of Eli Fross" },
    { spotifyPlaylistId: '2OwmVNZ3dJD6PGRrzfxU1i', type: PlaylistType.Artist, nameOverride: "Best of Travis Scott" },
    { spotifyPlaylistId: '0kBj7LSWcKrXWOkkt1KIIo', type: PlaylistType.Artist, nameOverride: "Best of The Weeknd" },
    { spotifyPlaylistId: '5puJg7hgNxIuw4Sxtw0oTH', type: PlaylistType.Artist, nameOverride: "Best of Sleepy Hallow" },
    { spotifyPlaylistId: '6jZy7J1703UQquykK3nCIB', type: PlaylistType.Artist, nameOverride: "Best of Ant200" },
    { spotifyPlaylistId: '4xaHubUgct8R1iJ79Rkeoc', type: PlaylistType.Artist, nameOverride: "Best of Pooh Shiesty" },
    { spotifyPlaylistId: '2v428ggNc9vmG4QAs41mqF', type: PlaylistType.Artist, nameOverride: "Best of Migos" },
    { spotifyPlaylistId: '5NqZnhzN9kvsJgVDayTOMg', type: PlaylistType.Artist, nameOverride: "Best of Freddie Gibbs" },
    { spotifyPlaylistId: '0KRO3Gj5FwSFc597FMdXmA', type: PlaylistType.Artist, nameOverride: "Best of Shy Glizzy" },
    { spotifyPlaylistId: '3kT2zWV2QtL5k7faDyvJ7g', type: PlaylistType.Artist, nameOverride: "Best of Gunna" },
    { spotifyPlaylistId: '2wu1upE1s1ELdOrps4QMiH', type: PlaylistType.Artist, nameOverride: "Best of Fat Trel" },
    { spotifyPlaylistId: '48T3easHrYVA8CsQTsOLSV', type: PlaylistType.Artist, nameOverride: "Best of 21 Savage" },
    { spotifyPlaylistId: '79Zo9NyPcKMMzV87xJDuE1', type: PlaylistType.Artist, nameOverride: "Best of Rxalu Loaded" },
    { spotifyPlaylistId: '0QBJpBPnMU5GlNKQRzNpEL', type: PlaylistType.Artist, nameOverride: "Best of Eddie Valero" },
    { spotifyPlaylistId: '6cxUtLtHCsno6s7KEZents', type: PlaylistType.Artist, nameOverride: "Best of Lil Uzi Vert" },
    { spotifyPlaylistId: '7G5DtUU54TQaOm6RnTzR82', type: PlaylistType.Artist, nameOverride: "Best of Lil Reese" },
    { spotifyPlaylistId: '69fluqieJCATWQz86kzlrA', type: PlaylistType.Artist, nameOverride: "Best of Young Scooter" },
    { spotifyPlaylistId: '67ornKzLrEp283heSkeiaq', type: PlaylistType.Artist, nameOverride: "Best of Yo Gotti" },
    { spotifyPlaylistId: '3g9G8rCHb4prlVCm4QlV85', type: PlaylistType.Artist, nameOverride: "Best of Gucci Mane" },
    { spotifyPlaylistId: '5cj8P8uR67BK2tfsOVVIlS', type: PlaylistType.Artist, nameOverride: "Best of OMB Peezy" },
    { spotifyPlaylistId: '3B0q6bPRLPmRuFGG7MBgNi', type: PlaylistType.Artist, nameOverride: "Best of Hotboii" },
    { spotifyPlaylistId: '6pNEG3cCkM0uTnxtJxrcw6', type: PlaylistType.Artist, nameOverride: "Best of A Boogie Wit Da Hoodie" },
    { spotifyPlaylistId: '0tH1IpR7cqO3Qgw52qHKTZ', type: PlaylistType.Artist, nameOverride: "Best of Key Glock" },
    { spotifyPlaylistId: '28ddG4J8mDM47zD9VAUOu9', type: PlaylistType.Artist, nameOverride: "Best of Pooh Shiesty" },
    { spotifyPlaylistId: '1JetEWmEgc3BDTxvawlLZ5', type: PlaylistType.Artist, nameOverride: "Best of Moneybagg Yo" },
    { spotifyPlaylistId: '5D05v19XDTxDKaRhsf1dUK', type: PlaylistType.Artist, nameOverride: "Best of Lil Durk" },
    { spotifyPlaylistId: '0evwIXktsCYtHdqukvnEJs', type: PlaylistType.Artist, nameOverride: "Best of Young Thug" },
    { spotifyPlaylistId: '3Y0UYOOiVI51iSzSZs1v0k', type: PlaylistType.Artist, nameOverride: "Best of Future" },
    { spotifyPlaylistId: '2n9gUatQ71Pv8Fx5hTZNZq', type: PlaylistType.Artist, nameOverride: "Best of Polo G" },
    { spotifyPlaylistId: '58hyDlT9913qrL53l7j8Im', type: PlaylistType.Artist, nameOverride: "Best of EST Gee" },
    { spotifyPlaylistId: '3HiOOYsZwLLsHSA13W16mI', type: PlaylistType.Artist, nameOverride: "Best of Smiley" },
    { spotifyPlaylistId: '7bG1sjaCcWPLZgRNH9usHf', type: PlaylistType.Artist, nameOverride: "Best of King Von" },
    { spotifyPlaylistId: '2EsPV2tE11va8SA3Bukd7q', type: PlaylistType.Artist, nameOverride: "Best of Don Trip" },
    { spotifyPlaylistId: '7ozuCHFLcfuxmrm7UKnofk', type: PlaylistType.Artist, nameOverride: "Best of Starlito" },
    { spotifyPlaylistId: '2jOgjpSxJ3tfOxbhGZJGP8', type: PlaylistType.Artist, nameOverride: "Best of Blac Youngsta" },
    { spotifyPlaylistId: '2Y9MLrQmsvUkfwG31TNjBX', type: PlaylistType.Artist, nameOverride: "Best of NBA YoungBoy" },
    { spotifyPlaylistId: '0bGbmUaL1XrtAVHBdRPmiR', type: PlaylistType.Artist, nameOverride: "Best of Lil Keed" },
    { spotifyPlaylistId: '79vXDRsUTwP8uCPdZFh7r0', type: PlaylistType.Artist, nameOverride: "Best of Lil Gotit" },
    { spotifyPlaylistId: '2UxzlQ0YSDRIc4USgdt83v', type: PlaylistType.Artist, nameOverride: "Best of 42 Dugg" },
    { spotifyPlaylistId: '0IZ7LsHxFGl0nzjJQiq9ew', type: PlaylistType.Artist, nameOverride: "Best of Trapperman Dale" },
    { spotifyPlaylistId: '2YBQud5Mo88SZMUR9bZgVE', type: PlaylistType.Artist, nameOverride: "Best of Offset" },
    { spotifyPlaylistId: '2S37XVdzk1YvzUPLlB03t6', type: PlaylistType.Artist, nameOverride: "Best of Lil Baby" },
    { spotifyPlaylistId: '7lmAE1XUoq8GfA9kOvFLZX', type: PlaylistType.Artist, nameOverride: "Best of Young Dolph" },
    { spotifyPlaylistId: '2uIw01hr2xyTthDcIRbgfa', type: PlaylistType.Artist, nameOverride: "Best of Drake" },
    { spotifyPlaylistId: '20XLfLepW17ZG6r4zzVQPC', type: PlaylistType.Artist, nameOverride: "Best of Money Man" },
    { spotifyPlaylistId: '5xQhGMb5FQouPCGRFtCniS', type: PlaylistType.Artist, nameOverride: "Best of Peewee Longway" },
    { spotifyPlaylistId: '6h8fc4VLzKhVdPYR3RB6Np', type: PlaylistType.Yearly, associatedYear: 2010, nameOverride: "Best of 2010", associatedMonth: 12 },
    { spotifyPlaylistId: '6WABHoJAwnChtBUCr4vFJj', type: PlaylistType.Yearly, associatedYear: 2012, nameOverride: "Best of 2012", associatedMonth: 12 },
    { spotifyPlaylistId: '3dGCQGuTZVc0qGi3AtN7Cb', type: PlaylistType.Yearly, associatedYear: 2013, nameOverride: "Best of 2013", associatedMonth: 12 },
    { spotifyPlaylistId: '27agptQOyI1TpB4XxOr3S6', type: PlaylistType.Yearly, associatedYear: 2014, nameOverride: "Best of 2014", associatedMonth: 12 },
    { spotifyPlaylistId: '2RjT57kegPUQFjUBkWEpUQ', type: PlaylistType.Yearly, associatedYear: 2015, nameOverride: "Best of 2015", associatedMonth: 12 },
    { spotifyPlaylistId: '6VxF21D7gK2p6cheFZh8Uv', type: PlaylistType.Yearly, associatedYear: 2016, nameOverride: "Best of 2016", associatedMonth: 12 },
    { spotifyPlaylistId: '7njxTYEQ27xJPjyXZIcIjw', type: PlaylistType.Yearly, associatedYear: 2017, nameOverride: "Best of 2017", associatedMonth: 12 },
    { spotifyPlaylistId: '43Rx79pAYvaZ9goVelnHz0', type: PlaylistType.Yearly, associatedYear: 2018, nameOverride: "Best of 2018", associatedMonth: 12 },
    { spotifyPlaylistId: '7B6agaYPg317C4cDqJ4A4g', type: PlaylistType.Yearly, associatedYear: 2019, nameOverride: "Best of 2019", associatedMonth: 12 },
    { spotifyPlaylistId: '71P2RSNRRkxnoMnzlDwuTc', type: PlaylistType.Yearly, associatedYear: 2020, nameOverride: "Best of 2020", associatedMonth: 12 },
    { spotifyPlaylistId: '0eN0nj3aAwOmzyiXUvsr7x', type: PlaylistType.Yearly, associatedYear: 2021, nameOverride: "Best of 2021", associatedMonth: 12 },
    { spotifyPlaylistId: '2oukZkEKPok3iprucoxVyI', type: PlaylistType.Yearly, associatedYear: 2022, nameOverride: "Best of 2022", associatedMonth: 12 },
    { spotifyPlaylistId: '5BSzzcDQnOO1tk7fjShAbV', type: PlaylistType.Yearly, associatedYear: 2023, nameOverride: "Best of 2023", associatedMonth: 12 },
    { spotifyPlaylistId: '69LRNPhv8kdFSqBKamCn8O', type: PlaylistType.Monthly, associatedYear: 2022, associatedMonth: monthNameToNumber("November"), nameOverride: "2022 November" },
    { spotifyPlaylistId: '5e3XuEUk2zane7Im1LwGIM', type: PlaylistType.Monthly, associatedYear: 2022, associatedMonth: monthNameToNumber("December"), nameOverride: "2022 December" },
    { spotifyPlaylistId: '3GENxWMI2b2opjcc34GIJG', type: PlaylistType.Monthly, associatedYear: 2023, associatedMonth: monthNameToNumber("January"), nameOverride: "2023 January" },
    { spotifyPlaylistId: '6pK7tN41XUmmtehNC4FajJ', type: PlaylistType.Monthly, associatedYear: 2023, associatedMonth: monthNameToNumber("February"), nameOverride: "2023 February" },
    { spotifyPlaylistId: '50UAc8a3bqwUbQ4mtQz7ig', type: PlaylistType.Monthly, associatedYear: 2023, associatedMonth: monthNameToNumber("March"), nameOverride: "2023 March" },
    { spotifyPlaylistId: '7lV2397S32XF29ZlOB7hhp', type: PlaylistType.Monthly, associatedYear: 2023, associatedMonth: monthNameToNumber("April"), nameOverride: "2023 April" },
    { spotifyPlaylistId: '1FDyJylubmE8FA3qaNYTTW', type: PlaylistType.Monthly, associatedYear: 2023, associatedMonth: monthNameToNumber("May"), nameOverride: "2023 May" },
    { spotifyPlaylistId: '5T09esQMaM3ofeYMFnLAfH', type: PlaylistType.Monthly, associatedYear: 2023, associatedMonth: monthNameToNumber("June"), nameOverride: "2023 June" },
    { spotifyPlaylistId: '4h24ns8Ag3Vh89GsWTwGk8', type: PlaylistType.Monthly, associatedYear: 2023, associatedMonth: monthNameToNumber("July"), nameOverride: "2023 July" },
    { spotifyPlaylistId: '7onOujcPyGLjb5TNERZo9R', type: PlaylistType.Monthly, associatedYear: 2023, associatedMonth: monthNameToNumber("August"), nameOverride: "2023 August" },
    { spotifyPlaylistId: '5nsXZq6ZPOXW3XUcFvvYTz', type: PlaylistType.Monthly, associatedYear: 2023, associatedMonth: monthNameToNumber("September"), nameOverride: "2023 September" },
    { spotifyPlaylistId: '5FANSr6wtrTVRaC8AJGFde', type: PlaylistType.Monthly, associatedYear: 2023, associatedMonth: monthNameToNumber("November"), nameOverride: "2023 November" },
    { spotifyPlaylistId: '2qhr8r98Ldl1NXntj5cUU0', type: PlaylistType.Monthly, associatedYear: 2023, associatedMonth: monthNameToNumber("December"), nameOverride: "2023 December" },
    { spotifyPlaylistId: '4QN9lbAqGjcnG9sXTZnYTc', type: PlaylistType.Monthly, associatedYear: 2024, associatedMonth: monthNameToNumber("January"), nameOverride: "2024 January" },
    { spotifyPlaylistId: '5y4F3FxWi8qyTqe2XaoHIZ', type: PlaylistType.Monthly, associatedYear: 2024, associatedMonth: monthNameToNumber("February"), nameOverride: "2024 February" },
    { spotifyPlaylistId: '0vXt8uHLFXuSPkzmdHabFX', type: PlaylistType.Monthly, associatedYear: 2024, associatedMonth: monthNameToNumber("April"), nameOverride: "2024 April" },
    { spotifyPlaylistId: '5CODySQoU5MnvPvZIvsgyp', type: PlaylistType.Monthly, associatedYear: 2024, associatedMonth: monthNameToNumber("May"), nameOverride: "2024 May" },
    { spotifyPlaylistId: '2nhwlkuzHA2e1FFTOBq58L', type: PlaylistType.Monthly, associatedYear: 2024, associatedMonth: monthNameToNumber("June"), nameOverride: "2024 June" },
    { spotifyPlaylistId: '625I0DRvbnUGz7lc0U9f43', type: PlaylistType.Monthly, associatedYear: 2024, associatedMonth: monthNameToNumber("July"), nameOverride: "2024 July" },
    { spotifyPlaylistId: '3IV3VbfThOavPaqvBI30uk', type: PlaylistType.Monthly, associatedYear: 2024, associatedMonth: monthNameToNumber("August"), nameOverride: "2024 August" },
    { spotifyPlaylistId: '3rz16lYfrZabLK0GTQRSNO', type: PlaylistType.Monthly, associatedYear: 2024, associatedMonth: monthNameToNumber("November"), nameOverride: "2024 November" },
  ];

  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  private async getSpotifyApi(): Promise<SpotifyWebApi> {
    const spotifyApi = this.authService.getSpotifyApiInstance();
    if (!spotifyApi.getAccessToken()) {
      this.logger.warn('Spotify access token not set on API instance. Attempting refresh or re-initialization.');
      try {
        await this.authService.refreshAndStoreSpotifyToken();
        this.logger.log('Token refreshed successfully during getSpotifyApi call.');
      } catch (refreshError) {
        this.logger.error('Failed to refresh token during getSpotifyApi call. Curator may need to re-authenticate.', refreshError.message);
        const tokens = await this.authService.getCuratorTokens();
        if (tokens?.accessToken) {
          spotifyApi.setAccessToken(tokens.accessToken);
          if (tokens.refreshToken) {
            spotifyApi.setRefreshToken(tokens.refreshToken);
          }
        } else {
          throw new InternalServerErrorException('Spotify API client not authorized. Please authenticate the curator.');
        }
      }
    }
    return spotifyApi;
  }

  async triggerFullSync(): Promise<string> {
    this.logger.log('Starting full data sync process...');
    if (this.CURATED_PLAYLIST_CONFIGS.length === 0) {
        this.logger.warn('No curated playlist IDs configured. Sync process will not run.');
        return 'No curated playlist IDs configured. Sync aborted.';
    }

    const spotifyApi = await this.getSpotifyApi();
    let playlistsProcessed = 0;
    let tracksProcessed = 0;
    let artistsProcessed = 0;

    for (const playlistConfig of this.CURATED_PLAYLIST_CONFIGS) {
      // ... (rest of the playlist processing loop from previous version) ...
      // This part remains largely the same: fetch playlist, upsert playlist,
      // loop through tracks, upsert artists, upsert songs, link songs to playlist, link songs to artists.
      // Ensure to use fallback images like 'https://placehold.co/300x300/060708/FFFFFF?text=No+Art'
      // and handle release date parsing carefully.
      try {
        this.logger.log(`Fetching playlist: ${playlistConfig.spotifyPlaylistId} (${playlistConfig.type})`);
        const { body: spotifyPlaylist } = await spotifyApi.getPlaylist(playlistConfig.spotifyPlaylistId, {
          fields: 'id,name,description,images,external_urls,owner.display_name,tracks.items(track(id,name,artists(id,name,external_urls),album(id,name,images,release_date,release_date_precision,album_type,total_tracks),external_urls,duration_ms,popularity,preview_url,is_local))',
        });

        if (!spotifyPlaylist) {
          this.logger.warn(`Playlist ${playlistConfig.spotifyPlaylistId} not found or API error.`);
          continue;
        }
        
        const playlistName = playlistConfig.nameOverride || spotifyPlaylist.name;
        this.logger.log(`Processing playlist: ${playlistName}`);

        const dbPlaylist = await this.prisma.playlist.upsert({
          where: { spotifyPlaylistId: spotifyPlaylist.id },
          update: {
            name: playlistName,
            description: spotifyPlaylist.description || '',
            coverImageUrl: spotifyPlaylist.images?.[0]?.url || 'https://placehold.co/300x300/060708/FFFFFF?text=No+Art',
            spotifyUrl: spotifyPlaylist.external_urls?.spotify || '',
            type: playlistConfig.type,
            associatedYear: playlistConfig.associatedYear,
            associatedMonth: playlistConfig.associatedMonth,
          },
          create: {
            spotifyPlaylistId: spotifyPlaylist.id,
            name: playlistName,
            description: spotifyPlaylist.description || '',
            coverImageUrl: spotifyPlaylist.images?.[0]?.url || 'https://placehold.co/300x300/060708/FFFFFF?text=No+Art',
            spotifyUrl: spotifyPlaylist.external_urls?.spotify || '',
            type: playlistConfig.type,
            associatedYear: playlistConfig.associatedYear,
            associatedMonth: playlistConfig.associatedMonth,
          },
        });
        playlistsProcessed++;
        
        const trackItems = spotifyPlaylist.tracks.items.filter(item => item.track && item.track.id && !item.track.is_local);
        
        for (const [index, item] of trackItems.entries()) {
          const track = item.track;
          tracksProcessed++;
          const trackArtistInternalIds: string[] = [];
          for (const spotifyArtist of track.artists) {
            if (!spotifyArtist || !spotifyArtist.id) continue;
            const dbArtist = await this.prisma.artist.upsert({
              where: { spotifyArtistId: spotifyArtist.id },
              update: { name: spotifyArtist.name, spotifyUrl: spotifyArtist.external_urls?.spotify || '' },
              create: { spotifyArtistId: spotifyArtist.id, name: spotifyArtist.name, spotifyUrl: spotifyArtist.external_urls?.spotify || '' },
            });
            trackArtistInternalIds.push(dbArtist.id);
            artistsProcessed++;
          }
          let releaseYear: number | null = null;
          let releaseMonth: number | null = null;
          if (track.album.release_date) {
            const releaseDateParts = track.album.release_date.split('-');
            releaseYear = parseInt(releaseDateParts[0], 10);
            if (track.album.release_date_precision === 'day' || track.album.release_date_precision === 'month') {
              if (releaseDateParts.length > 1) releaseMonth = parseInt(releaseDateParts[1], 10);
            }
          }
          const dbSong = await this.prisma.song.upsert({
            where: { spotifyTrackId: track.id },
            update: {
              title: track.name,
              coverImageUrl: track.album.images?.[0]?.url || 'https://placehold.co/100x100/060708/FFFFFF?text=No+Art',
              spotifyUrl: track.external_urls?.spotify || '',
              releaseYear: releaseYear as number,
              releaseMonth: releaseMonth,
            },
            create: {
              spotifyTrackId: track.id,
              title: track.name,
              coverImageUrl: track.album.images?.[0]?.url || 'https://placehold.co/100x100/060708/FFFFFF?text=No+Art',
              spotifyUrl: track.external_urls?.spotify || '',
              releaseYear: releaseYear as number,
              releaseMonth: releaseMonth,
            },
          });
          await this.prisma.playlistSong.upsert({
            where: { playlistId_songId: { playlistId: dbPlaylist.id, songId: dbSong.id } },
            update: { orderInPlaylist: index },
            create: { playlistId: dbPlaylist.id, songId: dbSong.id, orderInPlaylist: index },
          });
          for (const artistId of trackArtistInternalIds) {
            await this.prisma.songArtist.upsert({
              where: { songId_artistId: { songId: dbSong.id, artistId: artistId } },
              update: {},
              create: { songId: dbSong.id, artistId: artistId },
            });
          }
        }
        this.logger.log(`Finished processing playlist: ${dbPlaylist.name}. Tracks processed from this playlist: ${trackItems.length}`);
      } catch (error) {
        this.logger.error(`Error processing playlist ${playlistConfig.spotifyPlaylistId} (${playlistConfig.nameOverride || 'N/A'}): ${error.message}`, error.stack);
        if (error.statusCode === 401 || (error.body && error.body.error?.status === 401)) {
            this.logger.error('Spotify API token might be invalid or expired. Attempting refresh...');
            try {
                await this.authService.refreshAndStoreSpotifyToken();
                this.logger.log('Token refreshed. Consider re-running the sync for the failed playlist or the entire sync.');
            } catch (refreshError) {
                this.logger.error('Failed to refresh token. Curator needs to re-authenticate.', refreshError.message);
            }
        } else if (error.statusCode === 404 || (error.body && error.body.error?.status === 404)) {
            this.logger.warn(`Playlist ${playlistConfig.spotifyPlaylistId} not found on Spotify. Skipping.`);
        }
      }
    }

    // NEW STEP: Associate "Artist" type playlists with artists
    await this.associateArtistPlaylists();

    // Update Artist Feature Counts (this will now include accurate Best Of counts)
    await this.updateAllArtistFeatureCounts();

    const summary = `Sync completed. Playlists processed: ${playlistsProcessed}. Tracks iterated: ${tracksProcessed}. Artist link operations: ${artistsProcessed}.`;
    this.logger.log(summary);
    return summary;
  }

  /**
   * NEW METHOD: Associates "Artist" type playlists with their corresponding artists in the database.
   * This method should be called after all playlists and artists have been initially synced.
   */
  async associateArtistPlaylists(): Promise<void> {
    this.logger.log('Starting association of "Artist" type playlists with artists...');
    const artistPlaylists = await this.prisma.playlist.findMany({
      where: {
        type: PlaylistType.Artist,
        associatedArtistId: null, // Only process those not yet associated
      },
      // Select the 'name' field as it's needed for parsing
      select: {
        id: true,
        name: true, // Ensure 'name' is selected from the database
        spotifyPlaylistId: true,
        // No need for nameOverride here as we are reading the name stored in DB
      }
    });

    if (artistPlaylists.length === 0) {
      this.logger.log('No "Artist" type playlists found needing association.');
      return;
    }

    let associationsMade = 0;
    for (const playlist of artistPlaylists) {
      // CORRECTED: Use playlist.name directly as this is the name stored in the database
      // which would have already incorporated any nameOverride during the initial sync.
      const playlistNameFromDb = playlist.name;
      const nameParts = playlistNameFromDb.split('Best of ');
      if (nameParts.length < 2) {
        this.logger.warn(`Could not parse artist name from playlist "${playlistNameFromDb}" (ID: ${playlist.spotifyPlaylistId}). Skipping association.`);
        continue;
      }
      const parsedArtistName = nameParts[1].trim();

      if (!parsedArtistName) {
        this.logger.warn(`Parsed artist name is empty for playlist "${playlistNameFromDb}". Skipping association.`);
        continue;
      }

      const foundArtist = await this.prisma.artist.findFirst({
        where: {
          name: {
            equals: parsedArtistName,
            mode: 'insensitive', 
          },
        },
      });

      if (foundArtist) {
        try {
          await this.prisma.playlist.update({
            where: { id: playlist.id },
            data: { associatedArtistId: foundArtist.id },
          });
          this.logger.log(`Associated playlist "${playlistNameFromDb}" with artist "${foundArtist.name}" (ID: ${foundArtist.id})`);
          associationsMade++;
        } catch (updateError) {
          this.logger.error(`Failed to update playlist ${playlist.id} with artist association: ${updateError.message}`);
        }
      } else {
        this.logger.warn(`Artist "${parsedArtistName}" (parsed from playlist "${playlistNameFromDb}") not found in database. Cannot associate.`);
      }
    }
    this.logger.log(`Finished associating "Artist" type playlists. Associations made: ${associationsMade}/${artistPlaylists.length}.`);
  }


  async updateAllArtistFeatureCounts(): Promise<void> {
    this.logger.log('Updating all artist feature counts...');
    const allArtists = await this.prisma.artist.findMany({ select: { id: true } });

    for (const artist of allArtists) {
      const monthlyFeaturedSongs = await this.prisma.song.findMany({
        where: {
          artists: { some: { artistId: artist.id } },
          playlists: {
            some: {
              playlist: {
                type: PlaylistType.Monthly,
              },
            },
          },
        },
        distinct: ['id'],
      });
      const monthlyFeatures = monthlyFeaturedSongs.length;

      const yearlyFeaturedSongs = await this.prisma.song.findMany({
        where: {
          artists: { some: { artistId: artist.id } },
          playlists: {
            some: {
              playlist: {
                type: PlaylistType.Yearly,
              },
            },
          },
        },
        distinct: ['id'],
      });
      const yearlyFeatures = yearlyFeaturedSongs.length;
      
      const bestOfPlaylist = await this.prisma.playlist.findFirst({
          where: {
              type: PlaylistType.Artist,
              associatedArtistId: artist.id, 
          },
          select: { id: true }
      });

      let bestOfSongs = 0;
      if (bestOfPlaylist) {
          bestOfSongs = await this.prisma.playlistSong.count({
              where: { playlistId: bestOfPlaylist.id }
          });
      }

      await this.prisma.artist.update({
        where: { id: artist.id },
        data: {
          monthlyFeatureCount: monthlyFeatures,
          yearlyFeatureCount: yearlyFeatures,
          bestOfPlaylistSongCount: bestOfSongs,
        },
      });
    }
    this.logger.log('Finished updating artist feature counts.');
  }
}

    // src/artists/artists.controller.ts
import { Controller, Get, Param, ParseUUIDPipe, NotFoundException, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { ArtistResponseDto } from './dto/artist-response.dto';

@Controller('artists') // Base path for all routes in this controller will be '/api/artists' (due to global prefix)
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {} // Inject ArtistsService

  /**
   * Handles GET requests to /artists.
   * Retrieves all artists.
   * @returns An array of ArtistResponseDto.
   */
  @Get()
  async findAll(): Promise<ArtistResponseDto[]> {
    return this.artistsService.findAll();
  }

  /**
   * Handles GET requests to /artists/:id.
   * Retrieves a single artist by their ID.
   * @param id The UUID of the artist to retrieve.
   * @returns An ArtistResponseDto.
   * @throws NotFoundException if the artist is not found.
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ArtistResponseDto> {
    // ParseUUIDPipe validates that 'id' is a valid UUID string
    try {
      const artist = await this.artistsService.findOne(id);
      return artist;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message); // Re-throw to ensure correct HTTP status
      }
      throw error; // Re-throw other unexpected errors
    }
  }

  /**
   * Handles POST requests to /artists/batch-update-spotify-info.
   * Iterates through all artists, attempts to find their Spotify ID and image,
   * and updates the database.
   * @returns A summary of the batch operation.
   */
  @Post('batch-update-spotify-info')
  @HttpCode(HttpStatus.OK)
  async batchUpdateSpotifyInfo(): Promise<any> { // Define a more specific return type later
    // This will call a new method in ArtistsService to handle the batch logic
    const result = await this.artistsService.batchFindAndStoreSpotifyInfoForAllArtists();
    return result;
  }

  // Placeholder for POST, PATCH, DELETE routes if needed later
  // @Post()
  // create(@Body() createArtistDto: any) { return this.artistsService.create(createArtistDto); }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateArtistDto: any) { return this.artistsService.update(id, updateArtistDto); }

  // @Delete(':id')
  // remove(@Param('id') id: string) { return this.artistsService.remove(id); }
}
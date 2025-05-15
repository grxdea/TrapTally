// src/sync/sync.controller.ts
import { Controller, Post, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync') // Base path will be /api/sync
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(private readonly syncService: SyncService) {}

  /**
   * Endpoint to trigger the full data synchronization process.
   * Route: POST /api/sync/trigger
   * TODO: Secure this endpoint in a production environment!
   */
  @Post('trigger')
  @HttpCode(HttpStatus.ACCEPTED) // Respond with 202 Accepted as sync can take time
  async triggerFullSync(): Promise<{ message: string; details?: string }> {
    this.logger.log('Received request to trigger full data sync.');
    // Don't await this if it's a very long process, to avoid request timeout.
    // For now, we'll await to get the summary.
    // In a production app, you might return immediately and process in background.
    try {
      const summary = await this.syncService.triggerFullSync();
      return { message: 'Sync process initiated successfully.', details: summary };
    } catch (error) {
      this.logger.error('Error during sync process trigger:', error.message, error.stack);
      // Return a more generic error to the client for security
      return { message: 'Failed to initiate sync process. Check server logs for details.' };
    }
  }

  /**
   * Endpoint to update album information for songs that are missing this data
   * Route: POST /api/sync/update-albums
   */
  @Post('update-albums')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateAlbumInformation(): Promise<{ message: string; details?: string }> {
    this.logger.log('Received request to update album information for songs.');
    try {
      const summary = await this.syncService.updateAlbumInformation();
      return { message: 'Album information update completed successfully.', details: summary };
    } catch (error) {
      this.logger.error('Error during album information update:', error.message, error.stack);
      return { message: 'Failed to update album information. Check server logs for details.' };
    }
  }
}

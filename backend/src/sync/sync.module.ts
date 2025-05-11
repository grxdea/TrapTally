    // src/sync/sync.module.ts
    import { Module } from '@nestjs/common';
    import { SyncService } from './sync.service';
    import { SyncController } from './sync.controller';
    import { AuthModule } from '../auth/auth.module'; // Import AuthModule

    @Module({
      imports: [AuthModule], // Add AuthModule here so SyncService can use AuthService
      controllers: [SyncController],
      providers: [SyncService],
    })
    export class SyncModule {}
    
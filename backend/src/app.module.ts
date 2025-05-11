// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArtistsModule } from './artists/artists.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SyncModule } from './sync/sync.module'; // Import the new SyncModule
import { PlaylistsModule } from './playlists/playlists.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ArtistsModule,
    AuthModule,
    SyncModule,
    PlaylistsModule, // Add SyncModule here
    // Add other modules here as your application grows
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ArtistsService } from './artists.service';
import { ArtistsController } from './artists.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [ArtistsController],
  providers: [ArtistsService],
})
export class ArtistsModule {}

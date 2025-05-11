// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config'; // ConfigModule is often needed by services that use ConfigService
import { HttpModule } from '@nestjs/axios'; // Import HttpModule

@Module({
  imports: [
    ConfigModule, // Import ConfigModule if AuthService depends on ConfigService directly
    HttpModule,   // Add HttpModule here
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], // Add AuthService to the exports array
})
export class AuthModule {}

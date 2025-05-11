            // src/prisma/prisma.module.ts
            import { Module, Global } from '@nestjs/common';
            import { PrismaService } from './prisma.service';

            @Global() // Makes PrismaService available application-wide without importing PrismaModule everywhere
            @Module({
              providers: [PrismaService],
              exports: [PrismaService], // Export PrismaService so other modules can use it
            })
            export class PrismaModule {}
            
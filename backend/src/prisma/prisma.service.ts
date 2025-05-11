            // src/prisma/prisma.service.ts
            import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
            import { PrismaClient } from '@prisma/client';

            @Injectable()
            export class PrismaService extends PrismaClient
              implements OnModuleInit, OnModuleDestroy {
              constructor() {
                super({
                  // Optional: add logging configuration for Prisma
                  // log: ['query', 'info', 'warn', 'error'],
                });
              }

              async onModuleInit() {
                // Prisma's connect method is called automatically by the constructor,
                // but explicitly calling it ensures the connection is established.
                await this.$connect();
              }

              async onModuleDestroy() {
                // Gracefully disconnect Prisma when the NestJS module is destroyed
                await this.$disconnect();
              }
            }
            
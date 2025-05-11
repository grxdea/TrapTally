    // src/main.ts
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';
    import { ValidationPipe } from '@nestjs/common'; // For class-validator

    async function bootstrap() {
      const app = await NestFactory.create(AppModule);

      // Enable CORS (Cross-Origin Resource Sharing)
      // Configure this more strictly for production
      app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://127.0.0.1:3000', // Allow requests from your frontend
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
      });

      // Set a global prefix for all API routes (e.g., /api/artists)
      app.setGlobalPrefix('api');

      // Use global pipes for validation (e.g., class-validator)
      app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // Strip properties that do not have any decorators
        forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
        transform: true, // Automatically transform payloads to DTO instances
      }));

      const port = process.env.PORT || 8080; // Use port from .env or default to 8080
      await app.listen(port);
      console.log(`Application is running on: ${await app.getUrl()}`);
      console.log(`Backend accepting requests from: ${process.env.FRONTEND_URL || 'http://127.0.0.1:3000'}`);
    }
    bootstrap();
    
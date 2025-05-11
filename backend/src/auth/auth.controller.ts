    // src/auth/auth.controller.ts
import { Controller, Get, Query, Res, Logger, HttpException, HttpStatus, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express'; // Import Response from express
import { ConfigService } from '@nestjs/config';

@Controller('auth') // Base path will be /api/auth
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Initiates the Spotify login process by redirecting the user to Spotify's authorization page.
   * Route: GET /api/auth/spotify/login
   */
  @Get('spotify/login')
  spotifyLogin(@Res() res: Response) {
    const authUrl = this.authService.createSpotifyAuthUrl();
    this.logger.log(`Redirecting curator to Spotify for authorization: ${authUrl}`);
    res.redirect(authUrl); // Redirect the response to the Spotify URL
  }

  /**
   * Handles the callback from Spotify after the user grants or denies permission.
   * Route: GET /api/auth/spotify/callback
   * @param code The authorization code provided by Spotify if successful.
   * @param error The error provided by Spotify if unsuccessful.
   * @param res The Express response object.
   */
  @Get('spotify/callback')
  async spotifyCallback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Query('state') state: string, // Optional: verify state if you used one
    @Res() res: Response,
  ) {
    this.logger.log(`Received callback from Spotify. Code: ${code ? code.substring(0,10)+'...' : 'N/A'}, Error: ${error}`);

    if (error) {
      this.logger.error(`Error from Spotify callback: ${error}`);
      // Redirect to a frontend error page or display an error
      const frontendErrorUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth-error?error=${encodeURIComponent(error)}`;
      return res.redirect(frontendErrorUrl);
    }

    if (!code) {
      this.logger.warn('No authorization code received from Spotify.');
      const frontendErrorUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth-error?error=missing_code`;
      return res.redirect(frontendErrorUrl);
    }

    // Optional: Verify 'state' parameter here if you implemented CSRF protection

    try {
      const tokens = await this.authService.handleSpotifyCallback(code);
      // TODO: Securely store tokens and associate with the curator.
      // For now, redirect to a success page on the frontend.
      this.logger.log('Spotify tokens received successfully.');
      const frontendSuccessUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth-success?message=Spotify+authentication+successful`; // You might pass tokens via query params if frontend needs them immediately, but be careful with security.
      return res.redirect(frontendSuccessUrl);

    } catch (err) {
      this.logger.error('Error handling Spotify callback in controller:', err);
      const frontendErrorUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth-error?error=token_exchange_failed`;
      return res.redirect(frontendErrorUrl);
    }
  }

  /**
   * Exchanges an authorization code and PKCE code_verifier for Spotify API tokens.
   * Route: POST /api/auth/token
   * @param body Contains code, code_verifier, and redirect_uri.
   */
  @Post('token')
  @HttpCode(HttpStatus.OK)
  async exchangeCodeForTokenPkce(@Body() body: { code: string; code_verifier: string; redirect_uri: string }) {
    this.logger.log(`Received request to exchange code for token (PKCE). Code: ${body.code ? body.code.substring(0,10)+'...' : 'N/A'}`);
    if (!body.code || !body.code_verifier || !body.redirect_uri) {
      this.logger.warn('Missing parameters for PKCE token exchange.');
      throw new HttpException('Missing required parameters: code, code_verifier, or redirect_uri.', HttpStatus.BAD_REQUEST);
    }
    try {
      const tokens = await this.authService.exchangeCodeForTokensPkce(
        body.code,
        body.code_verifier,
        body.redirect_uri,
      );
      this.logger.log('PKCE Token exchange successful.');
      return tokens; // access_token, refresh_token, expires_in etc.
    } catch (err) {
      this.logger.error('Error during PKCE token exchange in controller:', err.message);
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(`Failed to exchange PKCE token with Spotify: ${err.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Checks if the user has valid authentication tokens and returns status
   * Route: GET /api/auth/status
   */
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async checkAuthStatus() {
    try {
      const tokens = await this.authService.getCuratorTokens();
      if (tokens && tokens.accessToken) {
        this.logger.log('Auth status checked: User has valid tokens');
        return { 
          authenticated: true,
          // Include the actual access token for web playback, but keep refresh token secure
          tokenInfo: {
            hasAccessToken: true,
            hasRefreshToken: !!tokens.refreshToken,
            tokenType: 'Bearer', // CuratorToken model doesn't have tokenType field
            accessToken: tokens.accessToken // Include the actual token for Web Playback SDK
          }
        };
      } else {
        this.logger.log('Auth status checked: No valid tokens found');
        return { authenticated: false };
      }
    } catch (err) {
      this.logger.error('Error checking auth status:', err.message);
      throw new HttpException('Failed to check authentication status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
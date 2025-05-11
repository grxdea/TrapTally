// src/auth/auth.service.ts
import { Injectable, InternalServerErrorException, Logger, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SpotifyWebApi = require('spotify-web-api-node');
import { PrismaService } from '../prisma/prisma.service'; // Import PrismaService
import { CuratorToken } from '@prisma/client'; // Import Prisma-generated type
import { HttpService } from '@nestjs/axios'; // Import HttpService
import { firstValueFrom } from 'rxjs'; // Required for HttpService
import { AxiosRequestConfig } from 'axios'; // For Axios types

const CURATOR_ID = 'TRAP_TALLY_CURATOR'; // Fixed ID for the single curator

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private spotifyApi: SpotifyWebApi;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService, // Inject PrismaService
    private readonly httpService: HttpService, // Inject HttpService
  ) {
    const clientId = this.configService.get<string>('SPOTIFY_CLIENT_ID');
    const clientSecret = this.configService.get<string>('SPOTIFY_CLIENT_SECRET');
    const apiBaseUrlFromEnv = this.configService.get<string>('API_BASE_URL', 'http://127.0.0.1:8080/api');
    let spotifyRedirectUriHost = 'http://127.0.0.1';
    try {
      const parsedApiBaseUrl = new URL(apiBaseUrlFromEnv);
      const port = parsedApiBaseUrl.port || '8080';
      const pathname = parsedApiBaseUrl.pathname.endsWith('/') ? parsedApiBaseUrl.pathname.slice(0, -1) : parsedApiBaseUrl.pathname;
      spotifyRedirectUriHost = `http://127.0.0.1:${port}${pathname}`;
    } catch (e) {
      this.logger.warn(`Could not parse API_BASE_URL "${apiBaseUrlFromEnv}". Defaulting Spotify redirect host construction.`);
      spotifyRedirectUriHost = 'http://127.0.0.1:8080/api';
    }
    const redirectUri = `${spotifyRedirectUriHost}/auth/spotify/callback`;

    if (!clientId || !clientSecret) {
      this.logger.error('Spotify Client ID or Client Secret is missing in .env file.');
      throw new InternalServerErrorException('Spotify API credentials are not configured.');
    }
    
    this.spotifyApi = new SpotifyWebApi({
      clientId: clientId,
      clientSecret: clientSecret,
      redirectUri: redirectUri,
    });
    this.logger.log(`Spotify Client ID loaded: ${clientId ? 'OK' : 'MISSING'}`);
    this.logger.log(`Spotify Redirect URI configured for internal SDK use: ${this.spotifyApi.getRedirectURI()}`);
    
    // Initialize Spotify API with stored tokens on service startup if available
    this.initializeSpotifyApiWithStoredTokens().catch(error => {
        this.logger.warn('Failed to initialize Spotify API with stored tokens on startup:', error.message);
    });
  }

  /**
   * Tries to load stored tokens and set them on the Spotify API instance.
   * If tokens are expired, it attempts to refresh them.
   */
  private async initializeSpotifyApiWithStoredTokens(): Promise<void> {
    const storedTokens = await this.getCuratorTokens();
    if (storedTokens) {
      this.spotifyApi.setAccessToken(storedTokens.accessToken);
      this.spotifyApi.setRefreshToken(storedTokens.refreshToken);
      this.logger.log('Spotify API initialized with stored access token.');

      // Check if the token is expired or close to expiring (e.g., within 5 minutes)
      // Note: Prisma stores expiresAt as DateTime, Spotify gives expires_in in seconds
      // For simplicity, we'll rely on API calls failing to trigger refresh,
      // or implement a more robust check here.
      // A more robust check would involve comparing storedTokens.expiresAt with current time.
      // If (new Date(storedTokens.expiresAt) < new Date(Date.now() + 5 * 60 * 1000)) {
      //   this.logger.log('Access token might be expired or nearing expiration, attempting refresh.');
      //   await this.refreshAndStoreSpotifyToken();
      // }
    } else {
        this.logger.log('No stored Spotify tokens found to initialize API instance.');
    }
  }


  createSpotifyAuthUrl(): string {
    const scopes = [
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-library-read',
    ];
    return this.spotifyApi.createAuthorizeURL(scopes, 'some-state-value', true);
  }

  async handleSpotifyCallback(code: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    try {
      const data = await this.spotifyApi.authorizationCodeGrant(code);
      const { access_token, refresh_token, expires_in } = data.body;

      this.logger.log('Received Spotify Tokens from authorization grant:');
      this.logger.log(`Access Token: ${access_token ? access_token.substring(0, 10) + '...' : 'N/A'}`);
      this.logger.log(`Refresh Token: ${refresh_token ? refresh_token.substring(0, 10) + '...' : 'N/A'}`);
      this.logger.log(`Expires In: ${expires_in} seconds`);

      if (!access_token || !refresh_token) {
        throw new Error('Failed to retrieve valid tokens from Spotify.');
      }

      // Calculate expiration timestamp
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      // Store/update tokens in the database
      await this.prisma.curatorToken.upsert({
        where: { curatorId: CURATOR_ID },
        update: {
          accessToken: access_token, // In a real app, encrypt this
          refreshToken: refresh_token, // In a real app, encrypt this
          expiresAt: expiresAt,
        },
        create: {
          curatorId: CURATOR_ID,
          accessToken: access_token, // In a real app, encrypt this
          refreshToken: refresh_token, // In a real app, encrypt this
          expiresAt: expiresAt,
        },
      });
      this.logger.log(`Curator tokens stored/updated in database for curatorId: ${CURATOR_ID}`);

      // Set tokens on the current Spotify API instance
      this.spotifyApi.setAccessToken(access_token);
      this.spotifyApi.setRefreshToken(refresh_token);

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
      };
    } catch (error) {
      const errorMessage = error.body?.error_description || error.body?.error || error.message || 'Unknown error during token exchange';
      this.logger.error(`Error during Spotify token exchange: ${errorMessage}`, error.stack);
      this.logger.error(`Error details: ${JSON.stringify(error.body, null, 2)}`);
      throw new InternalServerErrorException(`Failed to exchange Spotify authorization code for tokens: ${errorMessage}`);
    }
  }

  /**
   * Retrieves the stored curator tokens from the database.
   * @returns The CuratorToken object or null if not found.
   */
  async getCuratorTokens(): Promise<CuratorToken | null> {
    return this.prisma.curatorToken.findUnique({
      where: { curatorId: CURATOR_ID },
    });
  }

  /**
   * Refreshes the Spotify access token using the stored refresh token and updates it in the DB.
   * Also updates the token on the current spotifyApi instance.
   * @returns The new access token.
   * @throws Error if refresh token is not found or refresh fails.
   */
  async refreshAndStoreSpotifyToken(): Promise<string> {
    this.logger.log('Attempting to refresh Spotify access token...');
    const storedTokens = await this.getCuratorTokens();
    if (!storedTokens || !storedTokens.refreshToken) {
      this.logger.error('No refresh token found to refresh Spotify access token.');
      throw new NotFoundException('Refresh token not found. Please re-authenticate.');
    }

    this.spotifyApi.setRefreshToken(storedTokens.refreshToken); // Ensure refresh token is set on the instance

    try {
      const data = await this.spotifyApi.refreshAccessToken();
      const newAccessToken = data.body['access_token'];
      const newExpiresIn = data.body['expires_in'];
      // Spotify might also return a new refresh_token in some cases, handle if necessary
      const newRefreshToken = data.body['refresh_token'] || storedTokens.refreshToken;


      this.logger.log(`New Access Token received: ${newAccessToken ? newAccessToken.substring(0, 10) + '...' : 'N/A'}`);
      this.logger.log(`New Refresh Token (if any): ${newRefreshToken && newRefreshToken !== storedTokens.refreshToken ? newRefreshToken.substring(0, 10) + '...' : 'No new refresh token'}`);
      this.logger.log(`New token expires in: ${newExpiresIn} seconds`);

      const newExpiresAt = new Date(Date.now() + newExpiresIn * 1000);

      await this.prisma.curatorToken.update({
        where: { curatorId: CURATOR_ID },
        data: {
          accessToken: newAccessToken, // In a real app, encrypt this
          refreshToken: newRefreshToken, // Update if a new one was provided
          expiresAt: newExpiresAt,
        },
      });
      this.logger.log('Refreshed Spotify tokens stored in database.');

      // Update the current Spotify API instance with the new token
      this.spotifyApi.setAccessToken(newAccessToken);
      if (newRefreshToken) {
          this.spotifyApi.setRefreshToken(newRefreshToken);
      }


      return newAccessToken;
    } catch (error) {
      const errorMessage = error.body?.error_description || error.body?.error || error.message || 'Unknown error during token refresh';
      this.logger.error(`Error refreshing Spotify access token: ${errorMessage}`, error.stack);
      this.logger.error(`Error details: ${JSON.stringify(error.body, null, 2)}`);
      // If refresh fails (e.g., invalid refresh token), curator might need to re-authenticate.
      // Consider clearing the invalid refresh token from DB or marking it.
      throw new InternalServerErrorException(`Failed to refresh Spotify access token: ${errorMessage}`);
    }
  }

  /**
   * Exchanges an authorization code and PKCE code_verifier for Spotify API tokens.
   * This is used by the frontend after a successful PKCE-based login.
   * @param code The authorization code from Spotify.
   * @param codeVerifier The PKCE code_verifier generated by the frontend.
   * @param frontendRedirectUri The redirect_uri used by the frontend in the initial auth request.
   * @returns Spotify API tokens (access_token, refresh_token, expires_in, etc.).
   */
  async exchangeCodeForTokensPkce(
    code: string,
    codeVerifier: string,
    frontendRedirectUri: string,
  ): Promise<any> { // Consider creating a more specific return type for tokens
    const clientId = this.configService.get<string>('SPOTIFY_CLIENT_ID');
    // PKCE for confidential clients (like a backend) still uses client_secret for the /api/token call authorization
    // The code_verifier proves the session, client_secret proves the client app.
    const clientSecret = this.configService.get<string>('SPOTIFY_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      this.logger.error('Spotify Client ID or Client Secret is missing for PKCE token exchange.');
      throw new InternalServerErrorException('Server configuration error for Spotify authentication.');
    }

    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const requestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: frontendRedirectUri, // Must match the one used by the frontend to get the code
      client_id: clientId,
      code_verifier: codeVerifier,
    });

    const basicAuthHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;

    const requestConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': basicAuthHeader,
      },
    };

    this.logger.log(`Exchanging PKCE code for token. URI: ${frontendRedirectUri}, Code: ${code.substring(0,10)}...`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, requestBody.toString(), requestConfig),
      );

      const { access_token, refresh_token, expires_in, scope, token_type } = response.data;
      this.logger.log('PKCE Token exchange successful with Spotify.');
      this.logger.log(`Access Token received (PKCE): ${access_token ? access_token.substring(0, 10) + '...' : 'N/A'}`);

      if (!access_token) {
        throw new InternalServerErrorException('No access token received from Spotify after PKCE exchange.');
      }

      // --- Store tokens similar to the other auth flow ---
      // This part is optional for a pure PKCE flow if the frontend manages tokens,
      // but useful if the backend also needs to make Spotify API calls on behalf of the user.
      const expiresAt = new Date(Date.now() + expires_in * 1000);
      await this.prisma.curatorToken.upsert({
        where: { curatorId: CURATOR_ID }, // Assuming a single user/curator for now
        update: {
          accessToken: access_token,
          refreshToken: refresh_token, // PKCE refresh tokens are often single-use or have different lifetimes
          expiresAt: expiresAt,
          // Use type assertion to handle the new fields
          ...(scope ? { scope } as any : {}),
          ...(token_type ? { tokenType: token_type } as any : {}),
        },
        create: {
          curatorId: CURATOR_ID,
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: expiresAt,
          // Use type assertion to handle the new fields
          ...(scope ? { scope } as any : {}),
          ...(token_type ? { tokenType: token_type } as any : {}),
        },
      });
      this.logger.log(`Curator tokens (from PKCE flow) stored/updated for curatorId: ${CURATOR_ID}`);
      // Update the service's spotifyApi instance if needed for backend operations
      this.spotifyApi.setAccessToken(access_token);
      if (refresh_token) this.spotifyApi.setRefreshToken(refresh_token);
      // ---

      return response.data; // Return the full token object from Spotify

    } catch (error) {
      const errorMessage = error.response?.data?.error_description || error.response?.data?.error || error.message || 'Unknown error during PKCE token exchange with Spotify';
      this.logger.error(`Error during PKCE token exchange with Spotify: ${errorMessage}`, error.stack);
      if (error.response?.data) {
        this.logger.error(`Spotify error details (PKCE): ${JSON.stringify(error.response.data, null, 2)}`);
      }
      throw new HttpException(
        `Failed to exchange PKCE token with Spotify: ${errorMessage}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Provides access to the configured SpotifyWebApi instance.
   * Ensures the access token is valid, attempting a refresh if necessary.
   * This is a simplified getter; more robust logic might be needed for proactive token checking.
   */
  public getSpotifyApiInstance(): SpotifyWebApi {
    // A more robust implementation would check token expiry before returning the instance
    // and attempt a refresh if it's about to expire.
    // For now, we rely on API calls failing and then manually triggering refresh or re-auth.
    // The initializeSpotifyApiWithStoredTokens attempts to set it on startup.
    if (!this.spotifyApi.getAccessToken()) {
        this.logger.warn('Spotify access token is not set on the API instance. Attempting to re-initialize.');
        // This might be a good place to call initializeSpotifyApiWithStoredTokens again,
        // or throw an error if re-initialization also fails to set a token.
        // For simplicity, we'll just log. The sync service will need to handle this.
    }
    return this.spotifyApi;
  }
}

## **Trap Tally: Application Development Plan**

Version: 1.0  
Date: May 4, 2025  
**1\. Introduction**

This document outlines the technical plan for developing the "Trap Tally" web application. The goal is to create a platform showcasing curated Spotify playlists (Monthly, Yearly, Artist Best Of) created by the curator, allowing users to browse artists, playlists, and play featured songs using Spotify integration.

**2\. Core Architecture & Philosophy**

* **Separation of Concerns:** We will adopt a standard client-server architecture:  
  * **Backend:** A RESTful API responsible for managing curated data, interacting with the Spotify API for initial data fetching/syncing, calculating statistics (feature counts), and serving data to the frontend.  
  * **Frontend:** A Single Page Application (SPA) responsible for user interface, user interaction, displaying data fetched from the backend API, and handling client-side Spotify authentication and playback via the Web Playback SDK.  
* **Hybrid Data Model:** The application's core structure (which playlists are featured, artist feature counts) will reside in a dedicated backend database. Real-time elements like song playback and potentially the latest cover art will leverage the Spotify API/SDK.  
* **Backend as Source of Truth (for Curation):** The backend database and API will define *which* playlists, artists, and songs are part of the "Trap Tally" experience and the associated curated metadata (counts).  
* **API-Driven:** Communication between frontend and backend will strictly occur through the defined REST API, promoting modularity and independent development.

**3\. Data Management Strategy**

This section details where different pieces of data originate and reside.

**3.1. Data Fetched/Pulled Dynamically from Spotify:**

* **Song Playback:** Handled exclusively by the **Spotify Web Playback SDK** on the frontend. Requires the end-user to authenticate with Spotify.  
* **User Authentication Token (for Playback):** Obtained on the frontend via Spotify's authentication flow (e.g., Implicit Grant or PKCE) to authorize the Playback SDK.  
* **Initial Data Ingestion (Backend Sync Process):**  
  * Playlist details (name, description, images, tracks.items(track(id, name, artists, album(release\_date, images)))) for the specific curated playlist IDs provided by the curator.  
  * Artist details (id, name) associated with the tracks.  
  * Track details (id, name, artists, album(release\_date, images), external\_urls.spotify).  
* **Direct Spotify Links (Optional but Recommended):**  
  * external\_urls.spotify for playlists, tracks, and artists can be stored locally but fetched initially from Spotify.  
* **Up-to-date Cover Art (Optional Refresh):** The backend *could* periodically re-fetch images URLs from Spotify for playlists, albums (tracks), as these might change, though caching the initially fetched URL is often sufficient.

**3.2. Data Stored Locally (Backend Database):**

* **playlists Table:**  
  * id (Primary Key, Integer/UUID \- Internal App ID)  
  * spotify\_playlist\_id (String, Unique \- Spotify's ID)  
  * name (String \- e.g., "Trap Tally \- May 2025")  
  * type (Enum/String: 'Monthly', 'Yearly', 'Artist')  
  * description (Text, Nullable)  
  * cover\_image\_url (String \- URL fetched from Spotify)  
  * spotify\_url (String \- Link to playlist on Spotify)  
  * associated\_year (Integer, Nullable \- For 'Monthly'/'Yearly')  
  * associated\_month (Integer, Nullable \- For 'Monthly')  
  * associated\_artist\_id (Foreign Key to artists.id, Nullable \- For 'Artist' type)  
  * created\_at, updated\_at (Timestamps)  
* **artists Table:**  
  * id (Primary Key, Integer/UUID \- Internal App ID)  
  * spotify\_artist\_id (String, Unique \- Spotify's ID)  
  * name (String \- Artist Name)  
  * spotify\_url (String \- Link to artist on Spotify)  
  * monthly\_feature\_count (Integer, Default 0 \- Calculated by backend)  
  * yearly\_feature\_count (Integer, Default 0 \- Calculated by backend)  
  * best\_of\_playlist\_song\_count (Integer, Default 0 \- Calculated by backend)  
  * created\_at, updated\_at (Timestamps)  
* **songs Table:**  
  * id (Primary Key, Integer/UUID \- Internal App ID)  
  * spotify\_track\_id (String, Unique \- Spotify's ID)  
  * title (String \- Song Title)  
  * cover\_image\_url (String \- Album cover URL fetched from Spotify)  
  * spotify\_url (String \- Link to track on Spotify)  
  * release\_year (Integer)  
  * release\_month (Integer \- *Note: May require manual input or estimation if not reliably available from Spotify API*)  
  * created\_at, updated\_at (Timestamps)  
* **playlist\_songs (Join Table):**  
  * playlist\_id (Foreign Key to playlists.id)  
  * song\_id (Foreign Key to songs.id)  
  * order\_in\_playlist (Integer \- To maintain playlist order)  
  * Primary Key (playlist\_id, song\_id)  
* **song\_artists (Join Table):**  
  * song\_id (Foreign Key to songs.id)  
  * artist\_id (Foreign Key to artists.id)  
  * Primary Key (song\_id, artist\_id)  
* **curator\_tokens Table (or similar secure storage):**  
  * user\_id (Identifier for the curator)  
  * access\_token (Encrypted String)  
  * refresh\_token (Encrypted String)  
  * expires\_at (Timestamp)

**3.3. Data NOT Fetched Directly from Spotify (Generated/Managed by Backend):**

* The specific list of spotify\_playlist\_ids designated as curated for Trap Tally.  
* The type categorization ('Monthly', 'Yearly', 'Artist') for each playlist.  
* Internal database IDs (id columns in tables).  
* Calculated counts: monthly\_feature\_count, yearly\_feature\_count, best\_of\_playlist\_song\_count on the artists table. These are derived by querying the relationships within the local database after a data sync.  
* The release\_month for songs might need manual curation/input if the Spotify API's release\_date\_precision is not 'day' or 'month'.

**4\. Technology Stack Recommendations**

* **Backend:** Node.js with **NestJS** (TypeScript framework providing structure, modularity, and good practices) or Python with **Django**/**Flask**.  
* **Database:** **PostgreSQL** (Robust, relational, handles joins efficiently, good ORM support).  
* **ORM (Optional but Recommended):** **Prisma** (Node.js) or **SQLAlchemy** (Python) / Django ORM.  
* **Frontend:** **React** (using Vite for build tooling) or **Vue 3** (using Vite). React has a large ecosystem and is well-suited for component-based UIs.  
* **Styling (Frontend):** **Tailwind CSS** (Utility-first for rapid, consistent styling).  
* **State Management (Frontend):** **Zustand** or **React Context API** (for simpler cases) / **Redux Toolkit** (for more complex state).  
* **API Communication:** axios or native fetch.  
* **Spotify Integration:**  
  * Backend: spotify-web-api-node (Node.js) or spotipy (Python).  
  * Frontend: **Spotify Web Playback SDK**.

**5\. Project Setup Plan**

1. **Version Control:** Initialize a Git repository (GitHub/GitLab). Consider a monorepo structure (e.g., using pnpm workspaces or yarn workspaces) or separate frontend and backend repositories.  
   \# Example Monorepo Setup  
   mkdir trap-tally && cd trap-tally  
   git init  
   mkdir backend frontend  
   \# Initialize backend/frontend projects within these folders  
   touch README.md .gitignore

2. **Spotify Developer App:** Register "Trap Tally" on the Spotify Developer Dashboard:  
   * Get Client ID and Client Secret.  
   * Configure Redirect URIs:  
     * For Backend (Curator Auth): e.g., http://localhost:8080/api/auth/spotify/callback (adjust port if needed).  
     * For Frontend (User Playback Auth): e.g., http://localhost:3000/callback (adjust port if needed).  
     * Add production URLs later.  
3. **Backend Setup (Assuming NestJS):**  
   * npm install \-g @nestjs/cli  
   * nest new backend  
   * Install dependencies: npm install @nestjs/config class-validator class-transformer pg prisma @prisma/client spotify-web-api-node (or Python equivalents).  
   * Set up Prisma: npx prisma init \--datasource-provider postgresql. Configure schema.prisma based on Section 3.2.  
   * Environment Variables (.env): Store DATABASE\_URL, SPOTIFY\_CLIENT\_ID, SPOTIFY\_CLIENT\_SECRET, JWT\_SECRET (if using JWT for curator auth), FRONTEND\_URL. Use @nestjs/config.  
   * **Curator Authentication Module:** Implement Spotify Authorization Code Flow for the *curator* to link their account. Store tokens securely (encrypted in DB). Create endpoints like /api/auth/spotify (redirect) and /api/auth/spotify/callback (token exchange). Add guards to protect sync endpoints.  
   * **Spotify Service:** Create a service to interact with the Spotify API using the curator's token.  
   * **Sync Module/Service:**  
     * Define input: List of curator's Spotify Playlist IDs.  
     * Logic: Fetch data from Spotify, perform transformations.  
     * Database Operations: Use Prisma client for CRUD operations (Create/Update playlists, songs, artists, relationships).  
     * Calculation Logic: After syncing, run queries to calculate and update \*\_feature\_count fields on the artists table.  
     * Endpoint: Create a protected endpoint (e.g., POST /api/sync) triggerable by the authenticated curator.  
   * **API Modules (Artists, Playlists):** Create modules, controllers, and services for serving data to the frontend (e.g., GET /api/artists, GET /api/playlists/monthly, etc.). Implement filtering logic based on query parameters.  
   * **Database Migrations:** Use npx prisma migrate dev to create and apply database schema changes.  
   * **CORS:** Configure CORS in main.ts to allow requests from the frontend URL.  
4. **Frontend Setup (Assuming React \+ Vite):**  
   * npm create vite@latest frontend \--template react-ts (using TypeScript is recommended).  
   * cd frontend  
   * Install dependencies: npm install axios react-router-dom zustand tailwindcss postcss autoprefixer @spotify/web-playback-sdk (or equivalents).  
   * **Tailwind Setup:** Follow Tailwind CSS installation guide for Vite.  
   * **Environment Variables (.env):** VITE\_API\_BASE\_URL=http://localhost:8080/api, VITE\_SPOTIFY\_CLIENT\_ID=your\_client\_id, VITE\_REDIRECT\_URI=http://localhost:3000/callback.  
   * **Routing (react-router-dom):** Set up routes for /, /artists, /artists/:id, /playlists/monthly, /playlists/yearly, /callback (for Spotify auth).  
   * **API Service:** Create functions to call backend endpoints using axios.  
   * **Spotify Auth (User):** Implement Implicit Grant or PKCE flow to get an access token for the Playback SDK. Store the token securely in memory or state management.  
   * **Spotify Playback SDK Integration:**  
     * Create a component or hook (useSpotifyPlayer) to manage the SDK instance.  
     * Initialize the player after obtaining the user's Spotify token.  
     * Handle player state changes (ready, not ready, track changes, etc.).  
     * Provide functions (playTrack(spotify\_uri), pause, resume) to be called by UI components.  
   * **State Management (Zustand):** Create stores for global state like user authentication status, Spotify token, current player state, potentially caching fetched data.  
   * **Components:** Develop reusable components (ArtistCard, PlaylistCard, SongRow, AudioPlayerControls, FilterControls).  
   * **Pages/Views:** Build components for each route, fetching data from the backend API via the API service (useEffect hooks) and displaying it using the reusable components. Implement filtering logic on the Artists page. Connect Play buttons to the SDK control functions.  
5. **Deployment:** Choose hosting providers (e.g., Backend: Heroku, Render, AWS EC2/ECS; Frontend: Vercel, Netlify, AWS S3/CloudFront; DB: Supabase, Neon, AWS RDS).

**6\. Maintenance Plan**

* **Dependency Management:** Regularly (e.g., monthly) check and update dependencies (npm outdated, npm update, Dependabot) for both frontend and backend. Test thoroughly after updates.  
* **Spotify API Monitoring:** Stay informed about Spotify API changes via their developer blog/changelog. Adapt code if necessary.  
* **Data Sync Process:**  
  * Establish a clear workflow for the curator to run the sync script/endpoint after updating their Spotify playlists.  
  * Consider adding a simple admin UI for the curator to manage the list of tracked playlists and trigger syncs.  
  * Implement robust error handling and logging within the sync process.  
* **Monitoring & Logging:**  
  * Backend: Implement structured logging (e.g., using Pino or Winston) for requests, errors, and key events (like sync start/end). Use a logging service (e.g., Sentry, Logtail).  
  * Frontend: Implement error tracking (e.g., Sentry).  
  * Uptime Monitoring: Use services like UptimeRobot or Better Uptime for production URLs.  
* **Database Backups:** Configure regular, automated backups for the production PostgreSQL database. Test restoration periodically.  
* **Security Audits:** Regularly review authentication, authorization, dependency vulnerabilities, and potential attack vectors.

**7\. Iteration & Adding Features Plan (Avoiding Breakages)**

* **Version Control Discipline:**  
  * **Branching:** Strict use of feature branches (feature/add-search, fix/playback-bug) branching off develop or main.  
  * **Pull Requests (PRs):** All code merges into develop/main must go through PRs.  
  * **Code Reviews:** Mandatory code reviews for all PRs, focusing on logic, style, tests, and potential side effects.  
* **Comprehensive Testing (The MOST Critical Part):**  
  * **Backend:**  
    * *Unit Tests (Jest/Vitest for NestJS):* Test individual services, controllers, utility functions in isolation (mock dependencies).  
    * *Integration Tests:* Test module interactions, API endpoint responses against a dedicated test database (e.g., using supertest). Test the sync logic thoroughly.  
    * *E2E Tests (Optional but valuable):* Test critical user flows interacting with the actual API.  
  * **Frontend:**  
    * *Unit Tests (Jest/Vitest \+ React Testing Library):* Test individual components, hooks, utility functions in isolation.  
    * *Integration Tests:* Test interactions between multiple components (e.g., filter controls updating a list).  
    * *E2E Tests (Cypress/Playwright):* **Essential.** Automate browser interactions simulating user flows: logging in (if applicable for playback), navigating pages, filtering artists, clicking play, verifying playback starts/pauses. Run these against a staging environment.  
* **Continuous Integration/Continuous Deployment (CI/CD):**  
  * Set up CI pipelines (GitHub Actions, GitLab CI) triggered on pushes/PRs:  
    * Lint code (eslint).  
    * Run all tests (unit, integration).  
    * Build applications.  
    * Fail the build if any step fails.  
  * Set up CD pipelines triggered on merges to main:  
    * Deploy backend and frontend automatically to a **Staging Environment**.  
    * Run E2E tests against Staging.  
    * (Optional) Manual approval step before deploying to **Production**.  
* **Staging Environment:** Maintain a staging environment that mirrors production closely. Deploy all changes here first for final testing (including E2E tests and manual checks) before promoting to production.  
* **Feature Flags:** For larger, potentially risky features, implement them behind feature flags (e.g., using libraries like launchdarkly or simple environment variables/database flags). Roll out features gradually, monitor, and roll back quickly if issues arise.  
* **Refactoring:** Allocate time for periodic refactoring to address technical debt, improve code quality, and maintain performance.

**8\. Specific Requirement Implementation Notes**

* **Artist Details View (3.1.3):** Use a dynamic route like /artists/:artistId. The corresponding page component will extract artistId from the URL parameters, fetch detailed data for that specific artist from the backend API endpoint (GET /api/artists/:artistId), and render the information, including the list of songs and the playlists they appear on (which the backend endpoint should provide).  
* **Song Playback (3.1.4, 3.2, 3.3, 3.4):**  
  * Integrate the Spotify Web Playback SDK on the frontend.  
  * Require users to log in via Spotify on the frontend to grant playback permission.  
  * Store the obtained Spotify access token in frontend state.  
  * Pass the token to the SDK during initialization.  
  * Attach onClick handlers to all "Play" buttons (on Artist Detail, Monthly Playlist, Yearly Playlist pages).  
  * When clicked, the handler gets the spotify\_track\_id associated with the song.  
  * Call the SDK's play method using the Spotify Track URI format: spotify:track:{spotify\_track\_id}.  
  * Implement UI controls (Play/Pause button, progress bar \- if desired) that interact with the SDK's state and methods. A shared player component in the layout is common.

This plan provides a robust framework. Remember to start with the core features (data sync, displaying lists, basic playback) and iterate, always prioritizing testing and good development practices.
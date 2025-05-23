// src/App.tsx
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// Import custom components
import Header from './components/Header'; // Main navigation header
import AuthInitializer from './components/AuthInitializer'; // Auth state initialization
import SpotifyPlayer from './components/SpotifyPlayer'; // Import the Spotify Player component

// Import page components
import ArtistsPage from './pages/ArtistsPage';
import ArtistDetailPage from './pages/ArtistDetailPage';
import MonthlyPlaylistsPage from './pages/MonthlyPlaylistsPage';
import YearlyPlaylistsPage from './pages/YearlyPlaylistsPage';
import BestOfPlaylistsPage from './pages/BestOfPlaylistsPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthCallback from './pages/AuthCallback'; // Import the callback component
import AuthDiagnostic from './pages/AuthDiagnostic'; // Import the diagnostic page

// Import Zustand store and selectors
import { usePlaybackStore, selectIsUserAuthenticated } from './store/playbackStore';

// Optional: Simple component for auth errors
const AuthErrorPage: React.FC = () => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error') || 'Unknown error';
    return <div className="p-4 text-center text-red-500">Spotify Login Error: {error}</div>;
};
// Optional: Simple component for auth success (if needed beyond redirect)
// const AuthSuccessPage: React.FC = () => {
//     return <div className="p-4 text-center text-green-500">Spotify Login Successful!</div>;
// };

/**
 * Main application component responsible for routing and overall layout.
 */
const App: React.FC = () => {
  const isAuthenticated = usePlaybackStore(selectIsUserAuthenticated);

  return (
    <BrowserRouter>
      {/* Main container with dark theme background */}
      <div className="min-h-screen bg-[rgba(6,7,8,1)] text-white font-outfit flex flex-col">
        {/* Initialize auth state when app loads */}
        <AuthInitializer />
        <Header /> {/* Main navigation header */}

        {/* Main content area where routed pages will be displayed */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          {/* Add padding at the bottom to prevent content from being hidden behind fixed player */}
          <div className={`${isAuthenticated ? 'pb-24' : ''}`}>
            <Routes>
              <Route path="/" element={<Navigate to="/artists" replace />} />
              <Route path="/artists" element={<ArtistsPage />} />
              <Route path="/artists/:artistId" element={<ArtistDetailPage />} />
              <Route path="/playlists/monthly" element={<MonthlyPlaylistsPage />} />
              <Route path="/playlists/yearly" element={<YearlyPlaylistsPage />} />
              <Route path="/playlists/best-of" element={<BestOfPlaylistsPage />} />

              {/* Spotify Auth Callback Route - Use the AuthCallback component */}
              <Route path="/callback" element={<AuthCallback />} />
              {/* Auth diagnostic and error pages */}
              <Route path="/auth-diagnostic" element={<AuthDiagnostic />} />
              <Route path="/auth-error" element={<AuthErrorPage />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </main>

        {/* Conditionally render SpotifyPlayer if authenticated in a fixed position container */}
        {isAuthenticated && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[rgba(16,17,18,0.95)] backdrop-blur-lg border-t border-white/10 shadow-lg">
            <SpotifyPlayer />
          </div>
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;

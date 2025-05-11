// src/components/Header.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePlaybackStore, selectSpotifyAccessToken } from '../store/playbackStore';
import SpotifyAuthButton from './SpotifyAuthButton';

// Logo component - using the original text-based logo
const Logo = () => (
  <Link to="/" className="flex items-center">
    <div className="text-white tracking-widest font-bold text-xl">TRAP TALLY</div>
  </Link>
);

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const spotifyAccessToken = usePlaybackStore(selectSpotifyAccessToken);
  const clearSpotifyTokens = usePlaybackStore((state) => state.clearSpotifyTokens);

  const isActive = (paths: string[]) => {
    return paths.some(path => location.pathname.startsWith(path));
  };

  const handleLogout = () => {
    clearSpotifyTokens();
    console.log("User logged out from Spotify playback.");
    navigate('/');
  };

  return (
    <header className="flex w-full items-center justify-between px-12 py-6 font-outfit border-b border-white/5">
      {/* Logo */}
      <Logo />

      {/* Navigation */}
      <nav className="flex gap-10 text-base font-medium items-center">
        <Link
          to="/artists"
          className={`transition-colors ${isActive(['/artists']) ? 'text-white visited:text-white' : 'text-white/70 visited:text-white/70 hover:text-white'}`}
        >
          Artists
        </Link>
        <Link
          to="/playlists/monthly"
          className={`transition-colors ${isActive(['/playlists/monthly']) ? 'text-white visited:text-white' : 'text-white/70 visited:text-white/70 hover:text-white'}`}
        >
          Monthly Playlists
        </Link>
        <Link
          to="/playlists/yearly"
          className={`transition-colors ${isActive(['/playlists/yearly']) ? 'text-white visited:text-white' : 'text-white/70 visited:text-white/70 hover:text-white'}`}
        >
          Yearly Playlists
        </Link>
        <Link
          to="/playlists/best-of"
          className={`transition-colors ${isActive(['/playlists/best-of']) ? 'text-white visited:text-white' : 'text-white/70 visited:text-white/70 hover:text-white'}`}
        >
          Best Of Playlists
        </Link>
      </nav>

      {/* User/Auth section */}
      <div>
        {spotifyAccessToken ? (
          <button
            onClick={handleLogout}
            className="bg-spotify-green text-black text-sm font-medium py-1 px-4 rounded-full hover:bg-green-500 transition-colors"
          >
            Logout
          </button>
        ) : (
          <SpotifyAuthButton />
        )}
      </div>
    </header>
  );
};

export default Header;

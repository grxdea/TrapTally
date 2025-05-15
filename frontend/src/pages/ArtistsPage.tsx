// src/pages/ArtistsPage.tsx
import React, { useState, useEffect } from 'react';
import ArtistsTableHeader from '../components/ArtistsTableHeader';
import ArtistTableRow from '../components/ArtistTableRow';
import FilterButtons from '../components/FilterButtons';
import { getAllArtists, ApiArtist } from '../services/artist.service'; // Import service and type

/**
 * Component for the Artists list page.
 * Fetches and displays artists from the backend API.
 * Includes client-side filtering based on feature counts.
 */
const ArtistsPage: React.FC = () => {
  // State for storing the original list of artists fetched from the API
  const [allArtists, setAllArtists] = useState<ApiArtist[]>([]);
  // State for storing the list of artists to be displayed (after filtering)
  const [displayedArtists, setDisplayedArtists] = useState<ApiArtist[]>([]);
  // State for managing loading status during API calls
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State for storing any error messages from API calls
  const [error, setError] = useState<string | null>(null);

  // State for managing the active filter
  const [activeFilter, setActiveFilter] = React.useState('All Artists');
  // Define the filter options
  const filters = ['All Artists', 'Monthly Featured', 'Yearly Featured'];

  // useEffect hook to fetch artists when the component mounts
  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoading(true); // Set loading to true before the API call
      setError(null); // Clear any previous errors
      try {
        const fetchedArtists = await getAllArtists(); // Call the API service
        setAllArtists(fetchedArtists); // Store the original full list
        setDisplayedArtists(fetchedArtists); // Initially display all artists
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message); // Set error message if API call fails
        } else {
          setError('An unknown error occurred.');
        }
        console.error("Failed to fetch artists:", err);
      } finally {
        setIsLoading(false); // Set loading to false after the API call completes (success or fail)
      }
    };

    fetchArtists(); // Call the async function to fetch data
  }, []); // Empty dependency array means this effect runs once when the component mounts

  // useEffect hook to apply filtering when 'activeFilter' or 'allArtists' change
  useEffect(() => {
    let filtered: ApiArtist[] = [];
    if (activeFilter === 'All Artists') {
      filtered = allArtists;
    } else if (activeFilter === 'Monthly Featured') {
      filtered = allArtists.filter(artist => artist.monthlyFeatures > 0);
    } else if (activeFilter === 'Yearly Featured') {
      filtered = allArtists.filter(artist => artist.yearlyFeatures > 0);
    }
    // TODO: Add logic for "Best Of Featured" if that becomes a filter option
    // and data is available (artist.bestOfSongs > 0)
    setDisplayedArtists(filtered);
  }, [activeFilter, allArtists]); // Re-run this effect if activeFilter or allArtists change

  // Conditional rendering based on loading and error states
  let content;
  if (isLoading) {
    content = <p className="text-gray-400 text-center py-10">Loading artists...</p>;
  } else if (error) {
    content = <p className="text-red-500 text-center py-10">Error: {error}</p>;
  } else if (displayedArtists.length === 0) {
    // More specific message if a filter results in no artists
    content = (
      <p className="text-gray-400 text-center py-10">
        {activeFilter === 'All Artists' ? 'No artists to display yet. (Database might be empty or sync needed)' : `No artists match the filter: "${activeFilter}"`}
      </p>
    );
  } else {
    // Map over the 'displayedArtists' state
    content = displayedArtists.map((artist) => (
      <ArtistTableRow key={artist.id} artist={artist} />
    ));
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white font-semibold text-left px-0 py-6 sm:py-8">
        Artists
      </h1>

      <div className="mb-6 sm:mb-8">
        <FilterButtons
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter} // When a button is clicked, update activeFilter state
        />
      </div>

      <div className="bg-[rgba(12,14,15,0.5)] rounded-lg shadow-xl overflow-hidden">
        <table className="track-table">
          <thead>
            <ArtistsTableHeader />
          </thead>
          <tbody>
            {content} {/* Render the conditional content */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArtistsPage;

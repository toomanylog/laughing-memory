'use client';

import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { MediaContent } from '@/lib/types';
import MediaCard from '@/components/MediaCard';
import { FaFilter, FaSearch, FaSort, FaSortAmountUp, FaSortAmountDown } from 'react-icons/fa';

export default function AnimesPage() {
  const [animes, setAnimes] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('releaseYear');
  const [sortOrder, setSortOrder] = useState('desc');
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        setLoading(true);
        const contentRef = ref(db, 'content');
        const snapshot = await get(contentRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const animesList = Object.values(data) as MediaContent[];
          
          // Filtrer uniquement les animés
          const filteredAnimes = animesList.filter(item => item.type === 'movie');
          setAnimes(filteredAnimes);
          
          // Extraire tous les genres uniques
          const genres = new Set<string>();
          filteredAnimes.forEach(anime => {
            anime.genres.forEach(genre => genres.add(genre));
          });
          setAvailableGenres(Array.from(genres).sort());
        } else {
          setAnimes([]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des animés:', error);
        setError('Impossible de charger les animés. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, []);

  // Filtrer et trier les animés
  const filteredAnimes = animes
    .filter(anime => 
      (searchTerm === '' || anime.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedGenre === '' || anime.genres.includes(selectedGenre))
    )
    .sort((a, b) => {
      if (sortBy === 'title') {
        return sortOrder === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === 'releaseYear') {
        return sortOrder === 'asc'
          ? a.releaseYear - b.releaseYear
          : b.releaseYear - a.releaseYear;
      }
      return 0;
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Animés</h1>
      
      <div className="bg-dark-card-color rounded-lg p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un animé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input pl-10 w-full"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <button
                className="btn btn-outline flex items-center gap-2"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                <FaSort />
                {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
              </button>
            </div>
            
            <div className="relative">
              <button
                className="btn btn-outline flex items-center gap-2"
                onClick={() => setSortBy(prev => prev === 'title' ? 'releaseYear' : 'title')}
              >
                <FaFilter />
                {sortBy === 'title' ? 'Titre' : 'Année'}
              </button>
            </div>
            
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="search-input"
            >
              <option value="">Tous les genres</option>
              {availableGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-center">
          {error}
        </div>
      ) : filteredAnimes.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Aucun animé trouvé</h2>
          <p className="text-gray-400">Essayez de modifier vos critères de recherche</p>
        </div>
      ) : (
        <>
          <div className="grid-cards">
            {filteredAnimes.map(anime => (
              <MediaCard key={anime.id} content={anime} />
            ))}
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-400">
            {filteredAnimes.length} animés affichés
          </div>
        </>
      )}
    </div>
  );
} 
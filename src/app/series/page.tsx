'use client';

import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { MediaContent } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { FaTv } from 'react-icons/fa';

export default function SeriesPage() {
  const [series, setSeries] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      try {
        const contentRef = ref(db, 'content');
        const snapshot = await get(contentRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const contentArray = Object.values(data) as MediaContent[];
          
          // Filtrer seulement les séries
          const seriesArray = contentArray.filter(item => item.type === 'series');
          setSeries(seriesArray);
          
          // Extraire tous les genres uniques
          const allGenres = new Set<string>();
          seriesArray.forEach(serie => {
            serie.genres.forEach(genre => allGenres.add(genre));
          });
          
          setGenres(Array.from(allGenres).sort());
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des séries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  // Séries filtrées par genre, si un filtre est sélectionné
  const filteredSeries = genreFilter
    ? series.filter(serie => serie.genres.includes(genreFilter))
    : series;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Séries</h1>
      
      {/* Filtres par genre */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Genres</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setGenreFilter(null)}
            className={`px-4 py-2 rounded-full ${
              genreFilter === null 
                ? 'bg-primary text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Tous
          </button>
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setGenreFilter(genre)}
              className={`px-4 py-2 rounded-full ${
                genreFilter === genre 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredSeries.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredSeries.map((serie) => (
            <Link 
              key={serie.id} 
              href={`/series/${serie.id}`}
              className="group"
            >
              <div className="aspect-[2/3] relative rounded-lg overflow-hidden mb-2 group-hover:ring-2 group-hover:ring-primary transition-all">
                <Image
                  src={serie.posterUrl}
                  alt={serie.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center mb-1">
                      <FaTv className="mr-2" />
                      <span>Série</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {serie.genres.slice(0, 2).map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-0.5 bg-gray-700/70 rounded-full text-xs"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="font-medium leading-tight">{serie.title}</h3>
              <p className="text-sm text-gray-400">{serie.releaseYear}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-400">
            Aucune série ne correspond à votre recherche
          </p>
          {genreFilter && (
            <button 
              onClick={() => setGenreFilter(null)}
              className="mt-4 text-primary hover:underline"
            >
              Afficher toutes les séries
            </button>
          )}
        </div>
      )}
    </div>
  );
} 
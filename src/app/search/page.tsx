'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { MediaContent } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { FaFilm, FaTv } from 'react-icons/fa';

// Composant qui utilise useSearchParams dans un Suspense boundary
function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'movie' | 'series'>('all');

  useEffect(() => {
    const searchContent = async () => {
      setLoading(true);
      
      try {
        const contentRef = ref(db, 'content');
        const snapshot = await get(contentRef);
        
        if (snapshot.exists() && query) {
          const data = snapshot.val();
          const contentArray = Object.values(data) as MediaContent[];
          
          // Filtrer les résultats par la requête
          const searchResults = contentArray.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) || 
            item.description.toLowerCase().includes(query.toLowerCase()) ||
            item.genres.some(genre => genre.toLowerCase().includes(query.toLowerCase()))
          );
          
          setResults(searchResults);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      searchContent();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  // Filtrer les résultats par type
  const filteredResults = filter === 'all' 
    ? results 
    : results.filter(item => item.type === filter);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Résultats de recherche pour "{query}"
      </h1>
      
      {/* Filtres */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full ${
            filter === 'all' 
              ? 'bg-primary text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Tous ({results.length})
        </button>
        <button
          onClick={() => setFilter('movie')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 ${
            filter === 'movie' 
              ? 'bg-primary text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <FaFilm />
          <span>Films ({results.filter(item => item.type === 'movie').length})</span>
        </button>
        <button
          onClick={() => setFilter('series')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 ${
            filter === 'series' 
              ? 'bg-primary text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <FaTv />
          <span>Séries ({results.filter(item => item.type === 'series').length})</span>
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredResults.map((item) => (
            <Link 
              key={item.id} 
              href={`/${item.type}/${item.id}`}
              className="group"
            >
              <div className="aspect-[2/3] relative rounded-lg overflow-hidden mb-2 group-hover:ring-2 group-hover:ring-primary transition-all">
                <Image
                  src={item.posterUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center mb-1">
                      {item.type === 'movie' ? <FaFilm className="mr-2" /> : <FaTv className="mr-2" />}
                      <span>{item.type === 'movie' ? 'Film' : 'Série'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.genres.slice(0, 2).map((genre) => (
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
              <h3 className="font-medium leading-tight">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.releaseYear}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-400">
            Aucun résultat ne correspond à votre recherche
          </p>
          <p className="mt-2 text-gray-500">
            Essayez avec d'autres mots-clés ou parcourez nos catégories
          </p>
        </div>
      )}
    </div>
  );
}

// Composant principal avec Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
} 
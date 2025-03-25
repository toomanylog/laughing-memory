'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { MediaContent } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaContent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [allContent, setAllContent] = useState<MediaContent[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Charger tout le contenu une seule fois
  useEffect(() => {
    const fetchAllContent = async () => {
      try {
        const contentRef = ref(db, 'content');
        const snapshot = await get(contentRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const contentArray = Object.values(data) as MediaContent[];
          setAllContent(contentArray);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du contenu:', error);
      }
    };

    fetchAllContent();
  }, []);

  // Gérer le clic en dehors des résultats pour fermer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Rechercher dans le contenu local
  const handleSearch = (value: string) => {
    setQuery(value);
    
    if (value.trim().length === 0) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    // Recherche dans les données locales
    const searchResults = allContent.filter(item => 
      item.title.toLowerCase().includes(value.toLowerCase()) || 
      item.description.toLowerCase().includes(value.toLowerCase()) ||
      item.genres.some(genre => genre.toLowerCase().includes(value.toLowerCase()))
    );
    
    setResults(searchResults);
    setShowResults(true);
    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setShowResults(true)}
          placeholder="Rechercher des films, séries..."
          className="w-full py-2 pl-10 pr-4 bg-gray-800/70 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        {query && (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
          >
            <FaTimes className="text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : results.length > 0 ? (
            <div>
              {results.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  href={`/${item.type}/${item.id}`}
                  onClick={() => setShowResults(false)}
                  className="flex items-center p-3 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="w-12 h-16 relative rounded overflow-hidden flex-shrink-0 mr-4">
                    <Image
                      src={item.posterUrl}
                      alt={item.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <h4 className="font-medium truncate">{item.title}</h4>
                    <p className="text-sm text-gray-400 truncate">
                      {item.type === 'movie' ? 'Film' : 'Série'} • {item.releaseYear}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.genres.slice(0, 2).map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-0.5 bg-gray-700 rounded-full text-xs text-gray-300"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
              
              {results.length > 5 && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setShowResults(false)}
                  className="block p-3 text-center text-primary hover:underline"
                >
                  Voir tous les résultats ({results.length})
                </Link>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              Aucun résultat trouvé pour "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
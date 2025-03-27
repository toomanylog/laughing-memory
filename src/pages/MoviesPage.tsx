import React, { useState, useEffect } from 'react';
import { useContent } from '../hooks/useContent.ts';
import ContentCard from '../components/ContentCard.tsx';
import { Content } from '../types/index.ts';

const MoviesPage: React.FC = () => {
  const { contents, loading, error, getContentsByType } = useContent();
  const [movies, setMovies] = useState<Content[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    async function fetchMovies() {
      setLoadingMovies(true);
      
      // Timeout pour éviter un chargement infini
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn("Délai d'attente dépassé pour les films, utilisation des contenus en mémoire");
          const moviesFromContents = contents.filter(item => item.type === 'movie');
          if (moviesFromContents.length > 0) {
            setMovies(moviesFromContents);
            setFetchError(null);
          } else {
            setFetchError("Impossible de charger les films. Veuillez réessayer plus tard.");
          }
          setLoadingMovies(false);
        }
      }, 8000);

      try {
        console.log("Tentative de récupération des films...");
        const moviesData = await getContentsByType('movie');
        
        if (isMounted) {
          clearTimeout(timeoutId);
          
          if (moviesData.length > 0) {
            console.log(`${moviesData.length} films récupérés avec succès`);
            setMovies(moviesData);
            setFetchError(null);
          } else {
            console.warn("Aucun film trouvé");
            setFetchError("Aucun film n'est disponible pour le moment.");
          }
        }
      } catch (err) {
        if (isMounted) {
          clearTimeout(timeoutId);
          console.error('Erreur lors de la récupération des films:', err);
          
          // Utiliser les contenus en mémoire comme solution de secours
          const moviesFromContents = contents.filter(item => item.type === 'movie');
          if (moviesFromContents.length > 0) {
            console.log("Utilisation des films déjà en mémoire");
            setMovies(moviesFromContents);
          } else {
            setFetchError("Erreur lors du chargement des films. Veuillez réessayer.");
            
            // Réessayer automatiquement (max 3 tentatives)
            if (retryCount < 2) {
              const nextRetry = retryCount + 1;
              console.log(`Nouvelle tentative (${nextRetry}/3) dans 2 secondes...`);
              setRetryCount(nextRetry);
              setTimeout(() => {
                if (isMounted) fetchMovies();
              }, 2000);
            }
          }
        }
      } finally {
        if (isMounted) {
          setLoadingMovies(false);
        }
      }
    }

    fetchMovies();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [contents, getContentsByType, retryCount]);

  if (loading || loadingMovies) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Chargement des films...</p>
        </div>
      </div>
    );
  }

  if (error || fetchError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error || fetchError}</p>
        </div>
        <button 
          onClick={() => setRetryCount(retryCount + 1)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Films</h1>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Aucun film disponible pour le moment.</p>
          <button 
            onClick={() => setRetryCount(retryCount + 1)}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Actualiser
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map(movie => (
            <ContentCard key={movie.id} content={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MoviesPage; 
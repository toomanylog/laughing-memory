import React, { useState, useEffect, useRef } from 'react';
import { useContent } from '../hooks/useContent.ts';
import ContentCard from '../components/ContentCard.tsx';
import { Content } from '../types/index.ts';

const SeriesPage: React.FC = () => {
  const { contents, loading, error, getContentsByType } = useContent();
  const [series, setSeries] = useState<Content[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Éviter les appels répétés trop fréquents
    const now = Date.now();
    if (fetchingRef.current || (now - lastFetchTimeRef.current < 10000 && series.length > 0)) {
      return;
    }

    async function fetchSeries() {
      // Marquer comme en cours de récupération
      fetchingRef.current = true;
      setLoadingSeries(true);
      
      // Timeout pour éviter un chargement infini
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn("Délai d'attente dépassé pour les séries, utilisation des contenus en mémoire");
          const seriesFromContents = contents.filter(item => item.type === 'series');
          if (seriesFromContents.length > 0) {
            setSeries(seriesFromContents);
            setFetchError(null);
          } else {
            setFetchError("Impossible de charger les séries. Veuillez réessayer plus tard.");
          }
          setLoadingSeries(false);
          fetchingRef.current = false;
        }
      }, 8000);

      try {
        console.log("Tentative de récupération des séries...");
        const seriesData = await getContentsByType('series');
        
        if (isMounted) {
          clearTimeout(timeoutId);
          lastFetchTimeRef.current = Date.now();
          
          if (seriesData.length > 0) {
            console.log(`${seriesData.length} séries récupérées avec succès`);
            setSeries(seriesData);
            setFetchError(null);
          } else {
            console.warn("Aucune série trouvée");
            setFetchError("Aucune série n'est disponible pour le moment.");
          }
        }
      } catch (err) {
        if (isMounted) {
          clearTimeout(timeoutId);
          console.error('Erreur lors de la récupération des séries:', err);
          
          // Utiliser les contenus en mémoire comme solution de secours
          const seriesFromContents = contents.filter(item => item.type === 'series');
          if (seriesFromContents.length > 0) {
            console.log("Utilisation des séries déjà en mémoire");
            setSeries(seriesFromContents);
          } else {
            setFetchError("Erreur lors du chargement des séries. Veuillez réessayer.");
            
            // Réessayer automatiquement (max 3 tentatives)
            if (retryCount < 2) {
              const nextRetry = retryCount + 1;
              console.log(`Nouvelle tentative (${nextRetry}/3) dans 2 secondes...`);
              setRetryCount(nextRetry);
              setTimeout(() => {
                if (isMounted) {
                  fetchingRef.current = false;
                  fetchSeries();
                }
              }, 2000);
            } else {
              fetchingRef.current = false;
            }
          }
        }
      } finally {
        if (isMounted) {
          setLoadingSeries(false);
          fetchingRef.current = false;
        }
      }
    }

    fetchSeries();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [contents, getContentsByType, retryCount, series.length]);

  if (loading || loadingSeries) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Chargement des séries...</p>
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
          onClick={() => {
            fetchingRef.current = false;
            lastFetchTimeRef.current = 0;
            setRetryCount(retryCount + 1);
          }}
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
        <h1 className="text-3xl font-bold">Séries</h1>
      </div>

      {series.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Aucune série disponible pour le moment.</p>
          <button 
            onClick={() => {
              fetchingRef.current = false;
              lastFetchTimeRef.current = 0;
              setRetryCount(retryCount + 1);
            }}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Actualiser
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {series.map(serie => (
            <ContentCard key={serie.id} content={serie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SeriesPage; 
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ContentCard from '../components/ContentCard.tsx';
import { useContent } from '../hooks/useContent.ts';
import { Content } from '../types/index.ts';

const HomePage: React.FC = () => {
  const { getContentsByType } = useContent();
  const [trending, setTrending] = useState<Content[]>([]);
  const [latest, setLatest] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const initialLoadAttemptedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Éviter les appels répétés trop fréquents, mais s'assurer qu'une première tentative est faite
    const now = Date.now();
    if (fetchingRef.current || (initialLoadAttemptedRef.current && now - lastFetchTimeRef.current < 10000 && trending.length > 0 && latest.length > 0)) {
      console.log("Éviter le rechargement répété - fetchingRef:", fetchingRef.current, "initialLoadAttempted:", initialLoadAttemptedRef.current);
      return;
    }

    // Marquer que nous avons tenté un chargement initial
    initialLoadAttemptedRef.current = true;

    async function fetchContents() {
      // Marquer comme en cours de récupération
      console.log("Début de récupération des contenus pour la page d'accueil");
      fetchingRef.current = true;
      setLoading(true);
      
      // Timeout pour éviter un chargement infini
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn("Délai d'attente dépassé pour les contenus, utilisation des fallbacks");
          setLoading(false);
          setError("Impossible de charger les contenus. Veuillez réessayer plus tard.");
          fetchingRef.current = false;
        }
      }, 10000);

      try {
        console.log("Tentative de récupération des contenus...");
        // Récupérer tous les contenus puis faire le filtrage côté client
        const moviesData = await getContentsByType('movie');
        const seriesData = await getContentsByType('series');
        
        if (isMounted) {
          clearTimeout(timeoutId);
          lastFetchTimeRef.current = Date.now();
          
          console.log("Données reçues - Movies:", moviesData.length, "Series:", seriesData.length);
          
          // Combinaison de tous les contenus
          const allContents = [...moviesData, ...seriesData];
          
          // Simuler contenus tendance en prenant les 5 premiers
          const trendingContents = allContents.slice(0, 5);
          
          // Simuler derniers ajouts en prenant les 5 derniers
          const latestContents = [...allContents].sort((a, b) => {
            return (b.createdAt || 0) - (a.createdAt || 0);
          }).slice(0, 5);
          
          setTrending(trendingContents);
          setLatest(latestContents);
          setError(null);
          
          console.log(`${trendingContents.length} contenus tendance et ${latestContents.length} derniers ajouts récupérés`);
        }
      } catch (err) {
        if (isMounted) {
          clearTimeout(timeoutId);
          console.error('Erreur lors de la récupération des contenus:', err);
          setError("Erreur lors du chargement des contenus. Veuillez réessayer.");
          
          // Réessayer automatiquement (max 3 tentatives)
          if (retryCount < 2) {
            const nextRetry = retryCount + 1;
            console.log(`Nouvelle tentative (${nextRetry}/3) dans 2 secondes...`);
            setRetryCount(nextRetry);
            setTimeout(() => {
              if (isMounted) {
                fetchingRef.current = false;
                fetchContents();
              }
            }, 2000);
          } else {
            fetchingRef.current = false;
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          fetchingRef.current = false;
        }
      }
    }

    fetchContents();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [getContentsByType, retryCount]);

  const renderContentSection = (title: string, contents: Content[]) => {
    if (contents.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {contents.map(content => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Chargement des contenus...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button 
          onClick={() => {
            fetchingRef.current = false;
            lastFetchTimeRef.current = 0;
            initialLoadAttemptedRef.current = false;
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
      {trending.length === 0 && latest.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Aucun contenu disponible pour le moment.</p>
          <button 
            onClick={() => {
              fetchingRef.current = false;
              lastFetchTimeRef.current = 0;
              initialLoadAttemptedRef.current = false;
              setRetryCount(retryCount + 1);
            }}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Actualiser
          </button>
        </div>
      ) : (
        <>
          {renderContentSection('Tendances', trending)}
          {renderContentSection('Ajouts récents', latest)}
        </>
      )}
    </div>
  );
};

export default HomePage; 
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContent } from '../hooks/useContent.ts';
import { Content, Episode } from '../types/index.ts';
import VideoPlayer from '../components/VideoPlayer.tsx';

const WatchPage: React.FC = () => {
  const { contentId, seasonId, episodeId } = useParams<{ 
    contentId: string;
    seasonId?: string;
    episodeId?: string;
  }>();
  const navigate = useNavigate();
  
  const [content, setContent] = useState<Content | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { getContentById } = useContent();
  const fetchingRef = useRef(false);
  const lastFetchedIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    // Éviter les appels répétés pour le même ID
    if (fetchingRef.current || !contentId || contentId === lastFetchedIdRef.current) {
      return;
    }
    
    async function fetchContent() {
      if (!contentId) return;
      
      // Marquer comme en cours de récupération
      fetchingRef.current = true;
      setLoading(true);
      
      // Timeout pour éviter un chargement infini
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn("Délai d'attente dépassé pour le chargement du contenu");
          setError("Le contenu n'a pas pu être chargé dans un délai raisonnable. Veuillez réessayer.");
          setLoading(false);
          fetchingRef.current = false;
        }
      }, 10000);
      
      try {
        console.log(`Tentative de récupération du contenu avec l'ID: ${contentId}`);
        const contentData = await getContentById(contentId);
        
        if (!isMounted) return;
        clearTimeout(timeoutId);
        
        if (!contentData) {
          console.error('Contenu non trouvé');
          setError('Contenu non trouvé');
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
        
        console.log('Contenu récupéré avec succès:', contentData.title);
        setContent(contentData);
        lastFetchedIdRef.current = contentId;
        
        // Si c'est une série et que des IDs de saison/épisode sont fournis
        if (contentData.type === 'series' && contentData.seasons && seasonId && episodeId) {
          console.log(`Recherche de la saison ${seasonId}, épisode ${episodeId}`);
          const season = contentData.seasons.find(s => s.id === seasonId);
          
          if (!season) {
            console.error('Saison non trouvée');
            setError('Saison non trouvée');
            setLoading(false);
            fetchingRef.current = false;
            return;
          }
          
          const episode = season.episodes.find(e => e.id === episodeId);
          
          if (!episode) {
            console.error('Épisode non trouvé');
            setError('Épisode non trouvé');
            setLoading(false);
            fetchingRef.current = false;
            return;
          }
          
          console.log(`Épisode trouvé: ${episode.title}`);
          setCurrentEpisode(episode);
        } else if (contentData.type === 'series' && contentData.seasons && contentData.seasons.length > 0) {
          // Si c'est une série mais pas d'IDs fournis, prendre le premier épisode
          const firstSeason = contentData.seasons[0];
          const firstEpisode = firstSeason.episodes[0];
          setCurrentEpisode(firstEpisode);
          
          // Mettre à jour l'URL pour inclure la saison et l'épisode
          console.log('Redirection vers le premier épisode');
          navigate(`/watch/${contentId}/${firstSeason.id}/${firstEpisode.id}`, { replace: true });
        }
        
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        clearTimeout(timeoutId);
        
        console.error('Erreur lors de la récupération du contenu:', err);
        setError('Erreur lors du chargement du contenu. Veuillez réessayer.');
        
        // Réessayer automatiquement (max 3 tentatives)
        if (retryCount < 2) {
          const nextRetry = retryCount + 1;
          console.log(`Nouvelle tentative (${nextRetry}/3) dans 3 secondes...`);
          setRetryCount(nextRetry);
          setTimeout(() => {
            if (isMounted) {
              fetchingRef.current = false;
              fetchContent();
            }
          }, 3000);
        } else {
          fetchingRef.current = false;
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoading(false);
          // Ne pas réinitialiser fetchingRef.current ici pour éviter les appels multiples
        }
      }
    }
    
    fetchContent();
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [contentId, seasonId, episodeId, getContentById, navigate, retryCount]);
  
  // Changer d'épisode
  const handleEpisodeChange = (newSeasonId: string, episode: Episode) => {
    if (content) {
      setCurrentEpisode(episode);
      fetchingRef.current = false; // Autoriser un nouveau chargement
      navigate(`/watch/${content.id}/${newSeasonId}/${episode.id}`);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Chargement du contenu...</p>
        </div>
      </div>
    );
  }
  
  if (error || !content) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error || 'Une erreur est survenue'}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Retour à l'accueil
          </button>
          <button 
            onClick={() => {
              fetchingRef.current = false;
              lastFetchedIdRef.current = null;
              setRetryCount(retryCount + 1);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lecteur vidéo */}
        <div className="lg:w-3/4">
          <VideoPlayer 
            content={content} 
            episode={currentEpisode || undefined} 
            seasonId={seasonId}
            autoPlay
          />
          
          {/* Informations détaillées */}
          <div className="mt-8">
            <h1 className="text-2xl font-bold">
              {content.title}
              {content.type === 'series' && currentEpisode && (
                <span className="font-normal"> - {currentEpisode.title}</span>
              )}
            </h1>
            
            <div className="flex items-center text-sm text-gray-600 mt-2">
              <span className="mr-4">{content.releaseYear}</span>
              {content.genre?.map((genre, index) => (
                <span key={index} className="mr-2">
                  {index > 0 && "•"} {genre}
                </span>
              ))}
            </div>
            
            <p className="mt-4 text-gray-800">
              {content.type === 'series' && currentEpisode 
                ? currentEpisode.description 
                : content.description}
            </p>
          </div>
        </div>
        
        {/* Liste des épisodes pour les séries */}
        {content.type === 'series' && content.seasons && (
          <div className="lg:w-1/4">
            <h3 className="text-xl font-bold mb-4">Épisodes</h3>
            
            <div className="border rounded-lg overflow-hidden">
              {content.seasons.map(season => (
                <div key={season.id} className="mb-4">
                  <div className="bg-gray-100 p-3 font-semibold">
                    Saison {season.number}
                  </div>
                  
                  <div className="divide-y">
                    {season.episodes.map(episode => (
                      <button
                        key={episode.id}
                        onClick={() => handleEpisodeChange(season.id, episode)}
                        className={`w-full text-left p-3 hover:bg-gray-50 ${
                          currentEpisode && currentEpisode.id === episode.id 
                            ? 'bg-red-50 border-l-4 border-red-500' 
                            : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {episode.number}. {episode.title}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {episode.description}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {Math.floor(episode.duration / 60)}:{(episode.duration % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPage; 
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ref, get, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import { MediaContent, Movie, Series, Episode } from '@/lib/types';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { FaArrowLeft, FaList } from 'react-icons/fa';

// Import du lecteur vidéo en dynamique pour éviter les erreurs SSR
const ReactPlayer = dynamic(() => import('react-player/lazy'), {
  ssr: false,
});

export default function PlayPage() {
  const { type, id } = useParams() as { type: string; id: string };
  const router = useRouter();
  const { data: session } = useSession();
  const [content, setContent] = useState<MediaContent | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Store global pour l'historique
  const { updateWatchProgress, getWatchProgress } = useAppStore();
  
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const contentRef = ref(db, `content/${id}`);
        const snapshot = await get(contentRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val() as MediaContent;
          setContent(data);
          
          // Si c'est une série, sélectionner le premier épisode par défaut
          if (data.type === 'series') {
            const series = data as Series;
            if (series.seasons && series.seasons.length > 0) {
              const firstSeason = series.seasons[0];
              if (firstSeason.episodes && firstSeason.episodes.length > 0) {
                setSelectedEpisode(firstSeason.episodes[0]);
              }
            }
          }
          
          // Récupérer la progression de visionnage
          const savedProgress = getWatchProgress(id);
          if (savedProgress !== null) {
            setProgress(savedProgress);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du contenu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id, getWatchProgress]);
  
  // Mise à jour de la progression
  const handleProgress = (state: { played: number }) => {
    const newProgress = Math.floor(state.played * 100);
    setProgress(newProgress);
    
    // Mettre à jour la progression toutes les 10 secondes ou quand completed
    if (newProgress % 10 === 0 || newProgress > 90) {
      const completed = newProgress > 90;
      updateWatchProgress(id, newProgress, completed);
      
      // Si l'utilisateur est connecté, mettre à jour aussi dans Firebase
      if (session?.user.id) {
        const watchHistoryRef = ref(db, `users/${session.user.id}/watchHistory/${id}`);
        update(watchHistoryRef, {
          contentId: id,
          timestamp: Date.now(),
          progress: newProgress,
          completed
        });
      }
    }
  };
  
  // Gestion de la sélection d'un épisode pour les séries
  const handleEpisodeSelect = (episode: Episode) => {
    setSelectedEpisode(episode);
    setShowEpisodes(false);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!content) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Contenu non trouvé</h1>
        <Button onClick={() => router.push('/')}>Retourner à l'accueil</Button>
      </div>
    );
  }
  
  // URL de la vidéo à lire
  const videoUrl = content.type === 'movie' 
    ? (content as Movie).videoUrl 
    : selectedEpisode?.videoUrl;
    
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <FaArrowLeft />
            <span>Retour</span>
          </Button>
          
          {content.type === 'series' && (
            <Button 
              variant="ghost" 
              onClick={() => setShowEpisodes(!showEpisodes)}
              className="flex items-center gap-2"
            >
              <FaList />
              <span>Épisodes</span>
            </Button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-grow">
            {videoUrl ? (
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <ReactPlayer
                  url={videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing
                  onProgress={handleProgress}
                  progressInterval={2000}
                  config={{
                    file: {
                      attributes: {
                        controlsList: 'nodownload'
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <p>Aucune vidéo disponible</p>
              </div>
            )}
            
            <div className="mt-4">
              <h1 className="text-2xl font-bold">
                {content.title}
                {selectedEpisode && ` - ${selectedEpisode.title}`}
              </h1>
              <p className="text-gray-400 mt-2">
                {selectedEpisode?.description || content.description}
              </p>
            </div>
          </div>
          
          {showEpisodes && content.type === 'series' && (
            <div className="w-full md:w-80 bg-gray-800/50 rounded-lg p-4 overflow-auto max-h-[70vh]">
              <h2 className="text-xl font-bold mb-4">Épisodes</h2>
              {(content as Series).seasons.map((season) => (
                <div key={season.number} className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Saison {season.number}: {season.title}</h3>
                  <div className="space-y-2">
                    {season.episodes.map((episode) => (
                      <div 
                        key={episode.id}
                        className={`p-2 rounded cursor-pointer ${selectedEpisode?.id === episode.id ? 'bg-primary/20 border border-primary' : 'hover:bg-gray-700'}`}
                        onClick={() => handleEpisodeSelect(episode)}
                      >
                        <div className="flex justify-between">
                          <span>Ep. {episode.number}</span>
                          <span>{episode.duration} min</span>
                        </div>
                        <p className="font-medium">{episode.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
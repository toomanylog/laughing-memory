import React, { useRef, useEffect, useState } from 'react';
import { Content, Episode } from '../types/index.ts';
import { useWatchProgress } from '../hooks/useWatchProgress.ts';

interface VideoPlayerProps {
  content: Content;
  episode?: Episode;
  seasonId?: string;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ content, episode, seasonId, autoPlay = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(true);
  
  const { 
    saveProgress, 
    getProgress,
    loading: progressLoading
  } = useWatchProgress();
  
  const videoUrl = episode ? episode.videoUrl : content.videoUrl;
  
  // Récupérer la progression précédente
  useEffect(() => {
    const loadSavedProgress = async () => {
      if (progressLoading) return;
      
      try {
        const savedProgress = await getProgress(content.id, seasonId, episode?.id);
        if (savedProgress > 0 && videoRef.current) {
          console.log(`Progression sauvegardée: ${Math.floor(savedProgress)}%`);
          const timeToSet = (savedProgress / 100) * videoRef.current.duration;
          
          if (!isNaN(timeToSet) && isFinite(timeToSet)) {
            videoRef.current.currentTime = timeToSet;
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la progression:', err);
      }
    };
    
    loadSavedProgress();
  }, [content.id, episode?.id, seasonId, getProgress, progressLoading]);
  
  // Configuration de la vidéo
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    setVideoError(null);
    setLoadingVideo(true);
    
    // Gestion de l'autoplay
    if (autoPlay) {
      try {
        console.log('Tentative de lecture automatique...');
        const playPromise = videoElement.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Lecture automatique réussie');
              setIsPlaying(true);
            })
            .catch((err) => {
              console.warn('La lecture automatique a échoué:', err);
              setIsPlaying(false);
              // Ne pas considérer l'échec d'autoplay comme une erreur
              // c'est généralement une restriction du navigateur
            });
        }
      } catch (err) {
        console.error('Erreur lors de la tentative de lecture automatique:', err);
        setIsPlaying(false);
      }
    }
    
    // Événements de la vidéo
    const handleTimeUpdate = () => {
      if (!videoElement) return;
      
      setCurrentTime(videoElement.currentTime);
      const newProgress = (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(isNaN(newProgress) ? 0 : newProgress);
      
      // Enregistrer la progression tous les 5 secondes
      if (Math.floor(videoElement.currentTime) % 5 === 0) {
        saveProgress(
          content.id,
          newProgress,
          seasonId,
          episode?.id
        );
      }
    };
    
    const handleLoadedMetadata = () => {
      if (!videoElement) return;
      setDuration(videoElement.duration);
      setLoadingVideo(false);
    };
    
    const handleError = () => {
      setLoadingVideo(false);
      
      // Extraire plus d'informations sur l'erreur
      let errorMessage = "Erreur inconnue lors du chargement de la vidéo";
      
      if (videoElement.error) {
        switch(videoElement.error.code) {
          case 1:
            errorMessage = "Le chargement de la vidéo a été interrompu";
            break;
          case 2:
            errorMessage = "Erreur réseau lors du chargement de la vidéo";
            break;
          case 3:
            errorMessage = "Problème de décodage de la vidéo";
            break;
          case 4:
            errorMessage = "Format de vidéo non supporté ou vidéo non disponible";
            break;
          default:
            errorMessage = `Erreur ${videoElement.error.code}: ${videoElement.error.message}`;
        }
      }
      
      console.error(`Erreur lors du chargement de la vidéo: ${videoUrl}`, videoElement.error);
      setVideoError(errorMessage);
    };
    
    const handleCanPlay = () => {
      setLoadingVideo(false);
    };
    
    // Ajout des écouteurs d'événements
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('canplay', handleCanPlay);
    
    return () => {
      // Retrait des écouteurs d'événements
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('canplay', handleCanPlay);
    };
  }, [content.id, episode?.id, seasonId, saveProgress, autoPlay, videoUrl]);
  
  // Formater le temps (secondes -> MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Gestion des contrôles personnalisés
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        console.error('Erreur lors de la lecture:', err);
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Gestion de la barre de progression
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * duration;
    
    videoRef.current.currentTime = newTime;
    setProgress(newProgress);
  };
  
  if (videoError) {
    return (
      <div className="rounded-lg overflow-hidden bg-gray-900 flex flex-col items-center justify-center h-96">
        <div className="text-white text-center p-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold mb-2">Erreur de lecture</h3>
          <p className="mb-4">{videoError}</p>
          <p className="text-gray-400 text-sm mb-4">URL: {videoUrl}</p>
          <button 
            onClick={() => {
              setVideoError(null);
              setLoadingVideo(true);
              // Forcer le rechargement de la vidéo
              if (videoRef.current) {
                videoRef.current.load();
              }
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
    <div className="rounded-lg overflow-hidden bg-gray-900 relative">
      {loadingVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-auto"
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <div className="bg-gray-900 text-white p-3">
        <div className="flex items-center space-x-3">
          <button onClick={handlePlayPause} className="focus:outline-none">
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          
          <span className="text-sm">{formatTime(currentTime)}</span>
          
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className="flex-grow h-1.5 bg-gray-700 rounded appearance-none focus:outline-none cursor-pointer"
          />
          
          <span className="text-sm">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 
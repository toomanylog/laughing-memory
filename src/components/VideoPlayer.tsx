import React, { useRef, useState, useEffect } from 'react';
import { Content, Episode } from '../types/index.ts';
import { useWatchProgress } from '../hooks/useWatchProgress.ts';

interface VideoPlayerProps {
  content: Content;
  episode?: Episode;
  seasonId?: string;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  content,
  episode,
  seasonId,
  autoPlay = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Déterminer l'URL de la vidéo à lire (épisode ou contenu)
  const videoUrl = episode?.videoUrl || content.videoUrl;
  
  // Utiliser le hook pour suivre la progression
  const { progress, saveProgress } = useWatchProgress(
    content.id,
    seasonId,
    episode?.id
  );

  // Initialiser le lecteur vidéo
  useEffect(() => {
    if (videoRef.current) {
      // Définir le volume
      videoRef.current.volume = volume;
      
      // Charger la vidéo
      videoRef.current.load();
      
      // Auto-play si activé
      if (autoPlay) {
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Erreur de lecture automatique:', error);
            // Souvent dû aux restrictions des navigateurs sur l'autoplay
            setIsPlaying(false);
          });
        }
      }
    }
  }, [videoUrl, autoPlay, volume]);

  // Reprendre la lecture à partir du point sauvegardé
  useEffect(() => {
    if (videoRef.current && progress > 0 && !isNaN(progress)) {
      const timeToSeek = (progress / 100) * videoRef.current.duration;
      if (!isNaN(timeToSeek) && isFinite(timeToSeek)) {
        videoRef.current.currentTime = timeToSeek;
      }
    }
  }, [progress, videoRef.current?.duration]);

  // Gestionnaires d'événements
  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Erreur de lecture:', error);
        setError('La lecture automatique n\'est pas autorisée par votre navigateur.');
      });
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Calculer le pourcentage de progression
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      
      // Sauvegarder tous les 5 secondes pour ne pas surcharger
      if (Math.floor(videoRef.current.currentTime) % 5 === 0) {
        saveProgress(percent);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setLoading(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  };

  const handleVideoError = () => {
    setLoading(false);
    setError('Une erreur est survenue lors du chargement de la vidéo. Veuillez réessayer ultérieurement.');
  };

  // Formater le temps (secondes -> MM:SS)
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">Erreur de lecture</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg shadow-lg bg-black">
      {/* Lecteur vidéo */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        )}
        
        <video
          ref={videoRef}
          className="w-full h-auto max-h-[70vh]"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleVideoError}
          onClick={isPlaying ? handlePause : handlePlay}
          poster={episode?.thumbnail || content.imageUrl}
          playsInline
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          Votre navigateur ne prend pas en charge la lecture vidéo HTML5.
        </video>
      </div>
      
      {/* Contrôles personnalisés */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex items-center mb-2">
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="mr-3 text-xl focus:outline-none"
          >
            {isPlaying ? (
              <span>⏸️</span>
            ) : (
              <span>▶️</span>
            )}
          </button>
          
          <div className="text-sm mr-3">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-grow h-2 bg-gray-700 rounded-full appearance-none"
          />
          
          <div className="ml-3 flex items-center">
            <span className="mr-2">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 bg-gray-700 rounded-full appearance-none"
            />
          </div>
        </div>
        
        <h2 className="text-lg font-bold">
          {episode ? `${content.title} - ${episode.title}` : content.title}
        </h2>
      </div>
    </div>
  );
};

export default VideoPlayer; 
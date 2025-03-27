import React, { useRef, useEffect, useState } from 'react';
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
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  // Utiliser notre hook pour gérer la progression
  const { progress, saveProgress, loading } = useWatchProgress(content, episode, seasonId);
  
  // URL de la vidéo (film ou épisode)
  const videoUrl = episode ? episode.videoUrl : content.videoUrl;
  
  // Configurer la vidéo quand elle est chargée
  useEffect(() => {
    if (videoRef.current && !loading) {
      // Définir le volume
      videoRef.current.volume = volume;
      
      // Définir la position initiale basée sur la progression sauvegardée
      if (progress > 0) {
        const targetTime = (progress / 100) * videoRef.current.duration;
        videoRef.current.currentTime = targetTime;
      }
      
      // Lancer la lecture si autoPlay est activé
      if (autoPlay) {
        videoRef.current.play().catch(err => console.error('La lecture automatique a échoué:', err));
      }
    }
  }, [videoRef, progress, loading, autoPlay, volume]);
  
  // Gestionnaires d'événements pour le lecteur vidéo
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Calculer et sauvegarder la progression en pourcentage
      const newProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      
      // Sauvegarder la progression tous les ~5 secondes ou aux multiples de 5%
      if (Math.floor(newProgress) % 5 === 0) {
        saveProgress(newProgress);
      }
    }
  };
  
  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
  
  // Formater le temps (secondes -> MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }
  
  return (
    <div className="flex flex-col w-full">
      {/* Lecteur vidéo */}
      <div className="relative w-full">
        <video
          ref={videoRef}
          className="w-full h-auto"
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onClick={handlePlayPause}
        />
        
        {/* Controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
          {/* Progress bar */}
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full"
          />
          
          <div className="flex items-center justify-between">
            {/* Play/Pause button */}
            <button 
              onClick={handlePlayPause}
              className="p-2"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            
            {/* Time display */}
            <div className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            
            {/* Volume control */}
            <div className="flex items-center">
              <span>🔊</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={handleVolumeChange}
                className="w-20"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Titre et information */}
      <div className="mt-4">
        <h2 className="text-xl font-bold">
          {episode ? `${content.title} - ${episode.title}` : content.title}
        </h2>
        <p className="text-sm mt-2">
          {episode ? episode.description : content.description}
        </p>
      </div>
    </div>
  );
};

export default VideoPlayer; 
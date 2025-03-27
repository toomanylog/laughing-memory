import React, { useState, useEffect } from 'react';
import { Content, Episode, VideoSource } from '../types/index.ts';
import { useWatchProgress } from '../hooks/useWatchProgress.ts';

interface EmbedPlayerProps {
  content: Content;
  episode?: Episode;
  seasonId?: string;
}

const EmbedPlayer: React.FC<EmbedPlayerProps> = ({ content, episode, seasonId }) => {
  const [selectedSource, setSelectedSource] = useState<VideoSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { saveProgress } = useWatchProgress();
  
  // Récupérer les sources vidéo correspondantes (contenu ou épisode)
  const videoSources = episode?.videoSources || content.videoSources;
  
  // Sélectionner automatiquement la première source disponible
  useEffect(() => {
    if (videoSources && videoSources.length > 0) {
      // Trouver la première source qui fonctionne
      const workingSource = videoSources.find(source => source.isWorking) || videoSources[0];
      setSelectedSource(workingSource);
      setLoading(false);
    } else {
      setError("Aucune source vidéo disponible");
      setLoading(false);
    }
  }, [videoSources]);

  // Gérer le changement de source
  const handleSourceChange = (sourceId: string) => {
    const source = videoSources.find(s => s.id === sourceId);
    if (source) {
      setSelectedSource(source);
      
      // Sauvegarder le changement de source comme progression
      const contentId = episode ? content.id : content.id;
      saveProgress(contentId, 0, seasonId, episode?.id);
    }
  };

  // Gérer le signalement d'un lien mort
  const handleReportSource = async () => {
    if (!selectedSource) return;
    
    try {
      // Afficher une fenêtre modale de confirmation
      if (window.confirm("Voulez-vous signaler ce lien comme non fonctionnel?")) {
        // Ici, vous ajouteriez le code pour enregistrer le signalement dans Firebase
        console.log("Signalement enregistré pour la source:", selectedSource.id);
        
        // Changer de source si possible
        const nextSource = videoSources.find(s => s.id !== selectedSource.id && s.isWorking);
        if (nextSource) {
          setSelectedSource(nextSource);
        }
        
        // Afficher un message de confirmation
        alert("Merci pour votre signalement. Nous allons vérifier ce lien dès que possible.");
      }
    } catch (error) {
      console.error("Erreur lors du signalement de la source:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-900 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-96 bg-gray-900 rounded-lg text-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-bold mb-2">Erreur de lecture</h3>
        <p className="mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Lecteur vidéo iframe */}
      {selectedSource && (
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            src={selectedSource.embedUrl}
            allowFullScreen
            className="w-full h-full"
            title={episode ? `${content.title} - ${episode.title}` : content.title}
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          ></iframe>
        </div>
      )}

      {/* Contrôles de source et signalement */}
      <div className="p-4 bg-gray-800 text-white">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-4 mb-2 md:mb-0">
            <span className="text-sm">Source:</span>
            <select
              className="bg-gray-700 text-white px-3 py-1 rounded"
              value={selectedSource?.id || ''}
              onChange={(e) => handleSourceChange(e.target.value)}
            >
              {videoSources.map((source) => (
                <option key={source.id} value={source.id} disabled={!source.isWorking}>
                  {source.provider} {!source.isWorking && '(Non disponible)'}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleReportSource}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Signaler un problème
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmbedPlayer; 
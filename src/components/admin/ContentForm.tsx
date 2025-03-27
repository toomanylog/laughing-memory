import React, { useState, useEffect } from 'react';
import { Content, Season, Episode } from '../../types';

interface ContentFormProps {
  content?: Content;
  onSubmit: (contentData: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ContentForm: React.FC<ContentFormProps> = ({ content, onSubmit, onCancel, isSubmitting }) => {
  // État du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [type, setType] = useState<'movie' | 'series'>('movie');
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [genre, setGenre] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState('');
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [seasons, setSeasons] = useState<Season[]>([]);
  
  // Initialiser le formulaire avec les données existantes si on modifie
  useEffect(() => {
    if (content) {
      setTitle(content.title);
      setDescription(content.description);
      setImageUrl(content.imageUrl);
      setVideoUrl(content.videoUrl);
      setType(content.type);
      setReleaseYear(content.releaseYear);
      setGenre(content.genre || []);
      setDuration(content.duration);
      setSeasons(content.seasons || []);
    }
  }, [content]);
  
  // Ajouter un genre
  const handleAddGenre = () => {
    if (genreInput.trim() && !genre.includes(genreInput.trim())) {
      setGenre([...genre, genreInput.trim()]);
      setGenreInput('');
    }
  };
  
  // Supprimer un genre
  const handleRemoveGenre = (genreToRemove: string) => {
    setGenre(genre.filter(g => g !== genreToRemove));
  };
  
  // Ajouter une saison
  const handleAddSeason = () => {
    const newSeason: Season = {
      id: `season-${Date.now()}`,
      number: seasons.length + 1,
      episodes: []
    };
    
    setSeasons([...seasons, newSeason]);
  };
  
  // Supprimer une saison
  const handleRemoveSeason = (seasonId: string) => {
    setSeasons(seasons.filter(s => s.id !== seasonId));
  };
  
  // Ajouter un épisode à une saison
  const handleAddEpisode = (seasonId: string) => {
    const updatedSeasons = seasons.map(season => {
      if (season.id === seasonId) {
        const newEpisode: Episode = {
          id: `episode-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: `Épisode ${season.episodes.length + 1}`,
          number: season.episodes.length + 1,
          description: '',
          videoUrl: '',
          duration: 0
        };
        
        return {
          ...season,
          episodes: [...season.episodes, newEpisode]
        };
      }
      
      return season;
    });
    
    setSeasons(updatedSeasons);
  };
  
  // Supprimer un épisode
  const handleRemoveEpisode = (seasonId: string, episodeId: string) => {
    const updatedSeasons = seasons.map(season => {
      if (season.id === seasonId) {
        return {
          ...season,
          episodes: season.episodes.filter(episode => episode.id !== episodeId)
        };
      }
      
      return season;
    });
    
    setSeasons(updatedSeasons);
  };
  
  // Mettre à jour les informations d'un épisode
  const handleEpisodeChange = (seasonId: string, episodeId: string, field: keyof Episode, value: string | number) => {
    const updatedSeasons = seasons.map(season => {
      if (season.id === seasonId) {
        const updatedEpisodes = season.episodes.map(episode => {
          if (episode.id === episodeId) {
            return {
              ...episode,
              [field]: value
            };
          }
          
          return episode;
        });
        
        return {
          ...season,
          episodes: updatedEpisodes
        };
      }
      
      return season;
    });
    
    setSeasons(updatedSeasons);
  };
  
  // Validation du formulaire
  const validateForm = (): boolean => {
    if (!title || !description || !imageUrl || !videoUrl || !releaseYear) {
      return false;
    }
    
    if (type === 'movie' && !duration) {
      return false;
    }
    
    if (type === 'series' && (!seasons.length || seasons.some(season => !season.episodes.length))) {
      return false;
    }
    
    // S'assurer que genre est un tableau
    if (!genre || !Array.isArray(genre)) {
      setGenre([]);
    }
    
    return true;
  };
  
  // Gestion de la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const contentData = {
      title,
      description,
      imageUrl,
      videoUrl,
      type,
      releaseYear,
      genre: genre || [],
      ...(type === 'movie' ? { duration } : { seasons }),
    };
    
    onSubmit(contentData as Omit<Content, 'id' | 'createdAt' | 'updatedAt'>);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Titre */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        
        {/* Année de sortie */}
        <div>
          <label htmlFor="releaseYear" className="block text-sm font-medium text-gray-700">
            Année de sortie <span className="text-red-500">*</span>
          </label>
          <input
            id="releaseYear"
            type="number"
            value={releaseYear}
            onChange={(e) => setReleaseYear(parseInt(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
            min="1900"
            max={new Date().getFullYear() + 5}
          />
        </div>
      </div>
      
      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* URL de l'image */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
            URL de l'image <span className="text-red-500">*</span>
          </label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        
        {/* URL de la vidéo */}
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
            URL de la vidéo <span className="text-red-500">*</span>
          </label>
          <input
            id="videoUrl"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
      </div>
      
      {/* Type de contenu */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Type de contenu
        </label>
        <div className="mt-2 space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="movie"
              checked={type === 'movie'}
              onChange={() => setType('movie')}
              className="form-radio h-4 w-4 text-red-600"
            />
            <span className="ml-2">Film</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="series"
              checked={type === 'series'}
              onChange={() => setType('series')}
              className="form-radio h-4 w-4 text-red-600"
            />
            <span className="ml-2">Série</span>
          </label>
        </div>
      </div>
      
      {/* Durée (pour les films) */}
      {type === 'movie' && (
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Durée (minutes) <span className="text-red-500">*</span>
          </label>
          <input
            id="duration"
            type="number"
            value={duration || ''}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
            min="1"
          />
        </div>
      )}
      
      {/* Genres */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Genres
        </label>
        <div className="flex items-center mt-1">
          <input
            type="text"
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
            className="flex-grow border border-gray-300 rounded-l-md shadow-sm p-2"
            placeholder="Ajouter un genre"
          />
          <button
            type="button"
            onClick={handleAddGenre}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md"
          >
            Ajouter
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(genre || []).map((g, index) => (
            <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
              <span>{g}</span>
              <button
                type="button"
                onClick={() => handleRemoveGenre(g)}
                className="ml-2 text-red-500"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Saisons et épisodes (pour les séries) */}
      {type === 'series' && (
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Saisons et épisodes</h3>
            <button
              type="button"
              onClick={handleAddSeason}
              className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
            >
              Ajouter une saison
            </button>
          </div>
          
          {seasons.length === 0 ? (
            <p className="text-gray-500 italic">Aucune saison ajoutée</p>
          ) : (
            <div className="space-y-6">
              {seasons.map((season, seasonIndex) => (
                <div key={season.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Saison {season.number}</h4>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleAddEpisode(season.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded-md text-sm"
                      >
                        Ajouter un épisode
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSeason(season.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded-md text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  
                  {season.episodes.length === 0 ? (
                    <p className="text-gray-500 italic">Aucun épisode ajouté</p>
                  ) : (
                    <div className="space-y-4">
                      {season.episodes.map((episode, episodeIndex) => (
                        <div key={episode.id} className="border rounded-md p-3 bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">Épisode {episode.number}</h5>
                            <button
                              type="button"
                              onClick={() => handleRemoveEpisode(season.id, episode.id)}
                              className="text-red-500"
                            >
                              Supprimer
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="block text-sm text-gray-700">
                                Titre
                              </label>
                              <input
                                type="text"
                                value={episode.title}
                                onChange={(e) => handleEpisodeChange(season.id, episode.id, 'title', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm text-gray-700">
                                Description
                              </label>
                              <textarea
                                value={episode.description}
                                onChange={(e) => handleEpisodeChange(season.id, episode.id, 'description', e.target.value)}
                                rows={2}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                required
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm text-gray-700">
                                  URL Vidéo
                                </label>
                                <input
                                  type="url"
                                  value={episode.videoUrl}
                                  onChange={(e) => handleEpisodeChange(season.id, episode.id, 'videoUrl', e.target.value)}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm text-gray-700">
                                  Durée (minutes)
                                </label>
                                <input
                                  type="number"
                                  value={episode.duration || ''}
                                  onChange={(e) => handleEpisodeChange(season.id, episode.id, 'duration', parseInt(e.target.value))}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                  required
                                  min="1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-red-600 hover:bg-red-700 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enregistrement...' : content ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default ContentForm;
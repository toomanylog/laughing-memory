import React, { useState, useEffect } from 'react';
import { Content, Season, Episode, VideoSource } from '../../types/index.ts';
import videoSourceParser from '../../utils/videoSourceParser.ts';

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
  const [videoSourcesInput, setVideoSourcesInput] = useState('');
  const [videoSources, setVideoSources] = useState<VideoSource[]>([]);
  const [type, setType] = useState<'movie' | 'series' | 'anime'>('movie');
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [genre, setGenre] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState('');
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [seasons, setSeasons] = useState<Season[]>([]);
  // Nouveaux champs pour les animés
  const [titleJp, setTitleJp] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [status, setStatus] = useState<'ongoing' | 'completed' | 'upcoming'>('ongoing');
  const [studio, setStudio] = useState('');
  
  // Initialiser le formulaire avec les données existantes si on modifie
  useEffect(() => {
    if (content) {
      setTitle(content.title || '');
      setDescription(content.description || '');
      setImageUrl(content.imageUrl || '');
      setVideoUrl(content.videoUrl || '');
      setType(content.type || 'movie');
      setReleaseYear(content.releaseYear || new Date().getFullYear());
      setGenre(content.genre || []);
      setDuration(content.duration);
      setSeasons(content.seasons || []);
      
      // Champs pour les animés
      setTitleJp(content.titleJp || '');
      setTitleEn(content.titleEn || '');
      setStatus(content.status || 'ongoing');
      setStudio(content.studio || '');
      
      // Si des sources vidéo sont présentes, les convertir en texte pour l'éditeur
      if (content.videoSources && content.videoSources.length > 0) {
        const sourcesText = content.videoSources
          .map(source => `@${source.embedUrl}`)
          .join('\n');
        setVideoSourcesInput(sourcesText);
        setVideoSources(content.videoSources);
      }
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
      title: `Saison ${seasons.length + 1}`,
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
  
  // Mettre à jour une saison
  const handleSeasonChange = (seasonId: string, field: keyof Season, value: string | number) => {
    const updatedSeasons = seasons.map(season => {
      if (season.id === seasonId) {
        return {
          ...season,
          [field]: value
        };
      }
      return season;
    });
    
    setSeasons(updatedSeasons);
  };
  
  // Analyser les sources vidéo lors de la mise à jour du champ
  const handleVideoSourcesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setVideoSourcesInput(input);
    const sources = videoSourceParser.parseVideoSources(input);
    setVideoSources(sources || []);
  };
  
  // Validation du formulaire
  const validateForm = (): boolean => {
    if (!title || !description || !imageUrl || (!videoUrl && videoSources.length === 0) || !releaseYear) {
      return false;
    }
    
    if (type === 'movie' && !duration) {
      return false;
    }
    
    if ((type === 'series' || type === 'anime') && (!seasons.length || seasons.some(season => !season.episodes.length))) {
      return false;
    }
    
    // S'assurer que genre est un tableau
    if (!genre || !Array.isArray(genre)) {
      setGenre([]);
      return false;
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
      videoSources,
      type,
      releaseYear,
      genre: genre || [],
      ...(type === 'movie' ? { duration } : { seasons }),
      // Ajouter les champs pour les animés si nécessaire
      ...(type === 'anime' ? { 
        titleJp, 
        titleEn, 
        status, 
        studio 
      } : {})
    };
    
    onSubmit(contentData as any);
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
          {imageUrl && (
            <div className="mt-2">
              <img src={imageUrl} alt="Aperçu" className="max-h-40 object-contain" />
            </div>
          )}
        </div>
        
        {/* Type de contenu */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type de contenu <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="movie"
                checked={type === 'movie'}
                onChange={() => setType('movie')}
                className="h-4 w-4 text-red-600"
              />
              <span className="ml-2">Film</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="series"
                checked={type === 'series'}
                onChange={() => setType('series')}
                className="h-4 w-4 text-red-600"
              />
              <span className="ml-2">Série</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="anime"
                checked={type === 'anime'}
                onChange={() => setType('anime')}
                className="h-4 w-4 text-red-600"
              />
              <span className="ml-2">Anime</span>
            </label>
          </div>
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
            min="1"
            required={type === 'movie'}
          />
        </div>
      )}
      
      {/* URL de la vidéo (traditionnel) */}
      <div>
        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
          URL de la vidéo
        </label>
        <input
          id="videoUrl"
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        <p className="text-sm text-gray-500 mt-1">
          URL directe de la vidéo (sera utilisée si aucune source n'est spécifiée ci-dessous)
        </p>
      </div>
      
      {/* Sources vidéo */}
      <div>
        <label htmlFor="videoSources" className="block text-sm font-medium text-gray-700">
          Sources vidéo (préféré)
        </label>
        <textarea
          id="videoSources"
          value={videoSourcesInput}
          onChange={handleVideoSourcesChange}
          rows={5}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm"
          placeholder="@https://my.mail.ru/mail/example/video/_myvideo/123.html"
        />
        <p className="text-sm text-gray-500 mt-1">
          Entrez chaque URL de vidéo sur une ligne distincte. Préfixez avec @ pour les URLs mail.ru, youtube, etc.
        </p>
        
        {/* Prévisualisation des sources */}
        {videoSources.length > 0 && (
          <div className="mt-2 bg-gray-50 p-3 rounded-md">
            <h4 className="font-medium text-sm mb-2">Sources vidéo détectées ({videoSources.length}):</h4>
            <ul className="space-y-1">
              {videoSources.map((source, index) => (
                <li key={source.id || index} className="text-sm text-gray-600">
                  {source.provider} - {source.embedUrl.substring(0, 50)}...
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Genres */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Genres <span className="text-red-500">*</span>
        </label>
        <div className="flex">
          <input
            type="text"
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
            className="mt-1 flex-grow border border-gray-300 rounded-l-md shadow-sm p-2"
            placeholder="Action, Comédie, Drame..."
          />
          <button
            type="button"
            onClick={handleAddGenre}
            className="mt-1 bg-blue-600 text-white rounded-r-md px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            Ajouter
          </button>
        </div>
        
        {/* Affichage des genres */}
        <div className="mt-2 flex flex-wrap gap-2">
          {genre.map((g, index) => (
            <span
              key={index}
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {g}
              <button
                type="button"
                onClick={() => handleRemoveGenre(g)}
                className="ml-2 text-gray-600 hover:text-red-600 focus:outline-none"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>
      
      {/* Rendu des saisons et épisodes pour les séries et animés */}
      {(type === 'series' || type === 'anime') && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Saisons</h3>
            <button
              type="button"
              onClick={handleAddSeason}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              + Ajouter une saison
            </button>
          </div>
          
          {seasons.length === 0 ? (
            <p className="text-gray-500">Aucune saison ajoutée. Cliquez sur le bouton pour ajouter une saison.</p>
          ) : (
            <div className="space-y-6">
              {seasons.map((season, seasonIndex) => (
                <div key={season.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Titre de la saison</label>
                        <input
                          type="text"
                          value={season.title}
                          onChange={(e) => handleSeasonChange(season.id, 'title', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Numéro</label>
                        <input
                          type="number"
                          value={season.number}
                          onChange={(e) => handleSeasonChange(season.id, 'number', parseInt(e.target.value) || 0)}
                          className="mt-1 block w-20 border border-gray-300 rounded-md shadow-sm p-2"
                          min="1"
                        />
                      </div>
                      {type === 'anime' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Année</label>
                            <input
                              type="number"
                              value={season.year || new Date().getFullYear()}
                              onChange={(e) => handleSeasonChange(season.id, 'year', parseInt(e.target.value) || new Date().getFullYear())}
                              className="mt-1 block w-28 border border-gray-300 rounded-md shadow-sm p-2"
                              min="1900"
                              max={new Date().getFullYear() + 10}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Statut</label>
                            <select
                              value={season.status || 'completed'}
                              onChange={(e) => handleSeasonChange(season.id, 'status', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                              <option value="ongoing">En cours</option>
                              <option value="completed">Terminé</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSeason(season.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </div>
                  
                  <h4 className="text-md font-medium mb-2">Épisodes</h4>
                  <div className="space-y-4 mb-4">
                    {season.episodes.map((episode, episodeIndex) => (
                      <div key={episode.id} className="border rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">{`Épisode ${episode.number}`}</h5>
                          <button
                            type="button"
                            onClick={() => handleRemoveEpisode(season.id, episode.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Titre</label>
                            <input
                              type="text"
                              value={episode.title}
                              onChange={(e) => handleEpisodeChange(season.id, episode.id, 'title', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Numéro</label>
                            <input
                              type="number"
                              value={episode.number}
                              onChange={(e) => handleEpisodeChange(season.id, episode.id, 'number', parseInt(e.target.value) || 0)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                              min="1"
                            />
                          </div>
                        </div>
                        
                        {type === 'anime' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Titre japonais</label>
                              <input
                                type="text"
                                value={episode.titleJp || ''}
                                onChange={(e) => handleEpisodeChange(season.id, episode.id, 'titleJp', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="タイトル"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Titre anglais</label>
                              <input
                                type="text"
                                value={episode.titleEn || ''}
                                onChange={(e) => handleEpisodeChange(season.id, episode.id, 'titleEn', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="English Title"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Date de diffusion</label>
                              <input
                                type="date"
                                value={episode.airDate ? new Date(episode.airDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const date = e.target.value ? new Date(e.target.value).getTime() : undefined;
                                  handleEpisodeChange(season.id, episode.id, 'airDate', date || 0);
                                }}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            value={episode.description}
                            onChange={(e) => handleEpisodeChange(season.id, episode.id, 'description', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            rows={2}
                          ></textarea>
                        </div>
                        
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-gray-700">URL Vidéo</label>
                          <input
                            type="text"
                            value={episode.videoUrl || ''}
                            onChange={(e) => handleEpisodeChange(season.id, episode.id, 'videoUrl', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="https://..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Durée (minutes)</label>
                          <input
                            type="number"
                            value={episode.duration || 0}
                            onChange={(e) => handleEpisodeChange(season.id, episode.id, 'duration', parseInt(e.target.value) || 0)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            min="0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleAddEpisode(season.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    + Ajouter un épisode
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Champs pour les animés */}
      {type === 'anime' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informations spécifiques aux animés</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Titre japonais</label>
              <input
                type="text"
                value={titleJp}
                onChange={(e) => setTitleJp(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="タイトル"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Titre anglais</label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="English Title"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ongoing' | 'completed' | 'upcoming')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="ongoing">En cours</option>
                <option value="completed">Terminé</option>
                <option value="upcoming">À venir</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Studio</label>
              <input
                type="text"
                value={studio}
                onChange={(e) => setStudio(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Studio d'animation"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Boutons d'action */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
};

export default ContentForm;
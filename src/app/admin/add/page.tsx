'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ref, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { FaPlus, FaArrowLeft, FaImage, FaLink, FaTag, FaCalendarAlt, FaFilm, FaBook, FaSave, FaEye, FaInfoCircle } from 'react-icons/fa';
import Image from 'next/image';

// Schéma de validation étendu avec les nouveaux champs
const contentSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  type: z.enum(['movie', 'series']),
  releaseYear: z.number().min(1900).max(new Date().getFullYear()),
  genres: z.string().min(1, 'Au moins un genre est requis'),
  posterUrl: z.string().url('URL invalide'),
  backdropUrl: z.string().url('URL invalide').optional(),
  trailerUrl: z.string().url('URL invalide').optional(),
  videoUrl: z.string().url('URL invalide').optional(),
  seasons: z.array(z.any()).optional(),
  // Nouveaux champs pour les liens externes
  myAnimeListUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  aniListUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  kitsuUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  rating: z.number().min(0).max(10).optional(),
  status: z.enum(['ongoing', 'completed', 'announced']).optional(),
  studio: z.string().optional(),
});

type FormValues = z.infer<typeof contentSchema>;

export default function AddContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contentType, setContentType] = useState<'movie' | 'series'>('movie');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<Partial<FormValues> | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      type: 'movie',
      releaseYear: new Date().getFullYear(),
      status: 'ongoing',
      rating: 0,
    }
  });

  // Observer les champs pour la prévisualisation
  const watchedFields = watch();
  
  useEffect(() => {
    setPreviewData(watchedFields);
  }, [watchedFields]);

  // Vérifier si l'utilisateur est admin
  if (status === 'loading') {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!session || !session.user.isAdmin) {
    redirect('/');
  }

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const contentId = uuidv4();
      const contentRef = ref(db, `content/${contentId}`);
      
      // Préparer les données
      const contentData = {
        id: contentId,
        ...data,
        genres: data.genres.split(',').map(g => g.trim()),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        // Inclure les nouveaux champs
        myAnimeListUrl: data.myAnimeListUrl || null,
        aniListUrl: data.aniListUrl || null,
        kitsuUrl: data.kitsuUrl || null,
        rating: data.rating || 0,
        status: data.status || 'ongoing',
        studio: data.studio || '',
      };
      
      // Si c'est une série, initialiser seasons avec un tableau vide
      if (data.type === 'series') {
        contentData.seasons = [];
      }
      
      await set(contentRef, contentData);
      
      router.push('/admin');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du contenu:', error);
      alert('Une erreur est survenue lors de l\'ajout du contenu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-dark-card-color rounded-lg shadow-xl p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.push('/admin')}
            className="btn btn-outline btn-sm"
          >
            <FaArrowLeft />
            <span className="ml-2">Retour</span>
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FaPlus className="text-primary" />
            Ajouter un contenu
          </h1>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 order-2 lg:order-1">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-dark-light-color p-4 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaInfoCircle className="text-primary" />
                  Informations de base
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="form-group">
                    <label className="form-label flex items-center gap-2">
                      <FaFilm className="text-primary" />
                      Type de contenu
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center p-3 bg-dark-color rounded-lg border border-gray-700 cursor-pointer hover:border-primary transition duration-200 ease-in-out">
                        <input
                          type="radio"
                          value="movie"
                          checked={contentType === 'movie'}
                          onChange={() => {
                            setContentType('movie');
                            setValue('type', 'movie');
                          }}
                          className="form-input h-4 w-4 text-primary mr-2"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">Animé</span>
                          <span className="text-xs text-gray-400">Film ou OVA</span>
                        </div>
                      </label>
                      <label className="flex items-center p-3 bg-dark-color rounded-lg border border-gray-700 cursor-pointer hover:border-primary transition duration-200 ease-in-out">
                        <input
                          type="radio"
                          value="series"
                          checked={contentType === 'series'}
                          onChange={() => {
                            setContentType('series');
                            setValue('type', 'series');
                          }}
                          className="form-input h-4 w-4 text-primary mr-2"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">Manga</span>
                          <span className="text-xs text-gray-400">Séries ou chapitres</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="status" className="form-label flex items-center gap-2">
                      <FaTag className="text-primary" />
                      Statut
                    </label>
                    <select
                      id="status"
                      {...register('status')}
                      className="form-input"
                    >
                      <option value="ongoing">En cours</option>
                      <option value="completed">Terminé</option>
                      <option value="announced">Annoncé</option>
                    </select>
                    {errors.status && <p className="form-error">{errors.status.message}</p>}
                  </div>
                </div>
                
                <input type="hidden" {...register('type')} />
                
                <div className="form-group">
                  <label htmlFor="title" className="form-label flex items-center gap-2">
                    <FaTag className="text-primary" />
                    Titre
                  </label>
                  <input
                    id="title"
                    type="text"
                    {...register('title')}
                    className="form-input"
                    placeholder="Titre de l'animé ou du manga"
                  />
                  {errors.title && <p className="form-error">{errors.title.message}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="description" className="form-label flex items-center gap-2">
                    <FaInfoCircle className="text-primary" />
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    {...register('description')}
                    className="form-input"
                    placeholder="Description détaillée..."
                  />
                  {errors.description && <p className="form-error">{errors.description.message}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="releaseYear" className="form-label flex items-center gap-2">
                      <FaCalendarAlt className="text-primary" />
                      Année de sortie
                    </label>
                    <input
                      id="releaseYear"
                      type="number"
                      {...register('releaseYear', { valueAsNumber: true })}
                      className="form-input"
                    />
                    {errors.releaseYear && <p className="form-error">{errors.releaseYear.message}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="studio" className="form-label flex items-center gap-2">
                      <FaFilm className="text-primary" />
                      Studio
                    </label>
                    <input
                      id="studio"
                      type="text"
                      {...register('studio')}
                      className="form-input"
                      placeholder="Nom du studio de production"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="genres" className="form-label flex items-center gap-2">
                    <FaTag className="text-primary" />
                    Genres (séparés par des virgules)
                  </label>
                  <input
                    id="genres"
                    type="text"
                    placeholder="Action, Aventure, Comédie"
                    {...register('genres')}
                    className="form-input"
                  />
                  {errors.genres && <p className="form-error">{errors.genres.message}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="rating" className="form-label flex items-center gap-2">
                    <FaTag className="text-primary" />
                    Note (sur 10)
                  </label>
                  <input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    {...register('rating', { valueAsNumber: true })}
                    className="form-input"
                  />
                  {errors.rating && <p className="form-error">{errors.rating.message}</p>}
                </div>
              </div>
              
              <div className="bg-dark-light-color p-4 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaImage className="text-primary" />
                  Médias et ressources
                </h2>
                
                <div className="form-group">
                  <label htmlFor="posterUrl" className="form-label flex items-center gap-2">
                    <FaImage className="text-primary" />
                    URL de l'affiche
                  </label>
                  <input
                    id="posterUrl"
                    type="url"
                    {...register('posterUrl')}
                    className="form-input"
                    placeholder="https://exemple.com/image.jpg"
                  />
                  {errors.posterUrl && <p className="form-error">{errors.posterUrl.message}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="backdropUrl" className="form-label flex items-center gap-2">
                    <FaImage className="text-primary" />
                    URL de l'image de fond (optionnel)
                  </label>
                  <input
                    id="backdropUrl"
                    type="url"
                    {...register('backdropUrl')}
                    className="form-input"
                    placeholder="https://exemple.com/backdrop.jpg"
                  />
                  {errors.backdropUrl && <p className="form-error">{errors.backdropUrl.message}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="trailerUrl" className="form-label flex items-center gap-2">
                    <FaFilm className="text-primary" />
                    URL de la bande-annonce (optionnel)
                  </label>
                  <input
                    id="trailerUrl"
                    type="url"
                    {...register('trailerUrl')}
                    className="form-input"
                    placeholder="https://youtube.com/watch?v=xxx"
                  />
                  {errors.trailerUrl && <p className="form-error">{errors.trailerUrl.message}</p>}
                </div>
                
                {contentType === 'movie' && (
                  <div className="form-group">
                    <label htmlFor="videoUrl" className="form-label flex items-center gap-2">
                      <FaFilm className="text-primary" />
                      URL de la vidéo
                    </label>
                    <input
                      id="videoUrl"
                      type="url"
                      {...register('videoUrl')}
                      className="form-input"
                      placeholder="https://exemple.com/video.mp4"
                    />
                    {errors.videoUrl && <p className="form-error">{errors.videoUrl.message}</p>}
                  </div>
                )}
              </div>
              
              <div className="bg-dark-light-color p-4 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaLink className="text-primary" />
                  Liens externes
                </h2>
                
                <div className="form-group">
                  <label htmlFor="myAnimeListUrl" className="form-label flex items-center gap-2">
                    <FaLink className="text-primary" />
                    MyAnimeList URL
                  </label>
                  <input
                    id="myAnimeListUrl"
                    type="url"
                    {...register('myAnimeListUrl')}
                    className="form-input"
                    placeholder="https://myanimelist.net/anime/..."
                  />
                  {errors.myAnimeListUrl && <p className="form-error">{errors.myAnimeListUrl.message}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="aniListUrl" className="form-label flex items-center gap-2">
                    <FaLink className="text-primary" />
                    AniList URL
                  </label>
                  <input
                    id="aniListUrl"
                    type="url"
                    {...register('aniListUrl')}
                    className="form-input"
                    placeholder="https://anilist.co/anime/..."
                  />
                  {errors.aniListUrl && <p className="form-error">{errors.aniListUrl.message}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="kitsuUrl" className="form-label flex items-center gap-2">
                    <FaLink className="text-primary" />
                    Kitsu URL
                  </label>
                  <input
                    id="kitsuUrl"
                    type="url"
                    {...register('kitsuUrl')}
                    className="form-input"
                    placeholder="https://kitsu.io/anime/..."
                  />
                  {errors.kitsuUrl && <p className="form-error">{errors.kitsuUrl.message}</p>}
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <button 
                  type="submit" 
                  className="btn btn-primary px-6 py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="loading-spinner w-5 h-5"></div>
                      Ajout en cours...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FaSave />
                      Enregistrer le contenu
                    </span>
                  )}
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-outline px-6 py-3"
                  onClick={() => reset()}
                >
                  Réinitialiser
                </button>
              </div>
            </form>
          </div>
          
          <div className="flex-1 order-1 lg:order-2">
            <div className="bg-dark-light-color p-4 rounded-lg sticky top-24">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaEye className="text-primary" />
                Prévisualisation
              </h2>
              
              {previewData && (
                <div className="relative overflow-hidden rounded-lg bg-dark-color">
                  {/* Aperçu de l'affiche */}
                  <div className="relative w-full bg-dark-card-color">
                    {previewData.posterUrl ? (
                      <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
                        <img 
                          src={previewData.posterUrl} 
                          alt={previewData.title || 'Aperçu'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[2/3] bg-dark-color rounded-t-lg flex items-center justify-center">
                        <FaImage className="text-gray-600 text-6xl" />
                      </div>
                    )}
                    
                    {/* Badge de type */}
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-primary text-white text-sm font-medium">
                      {previewData.type === 'movie' ? 'Animé' : 'Manga'}
                    </div>
                    
                    {/* Badge de statut */}
                    {previewData.status && (
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-white text-sm font-medium
                        ${previewData.status === 'ongoing' ? 'bg-blue-600' : 
                          previewData.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'}`}>
                        {previewData.status === 'ongoing' ? 'En cours' : 
                          previewData.status === 'completed' ? 'Terminé' : 'Annoncé'}
                      </div>
                    )}
                  </div>
                  
                  {/* Informations du contenu */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2">{previewData.title || 'Titre du contenu'}</h3>
                    
                    <div className="flex gap-4 text-sm text-gray-400 mb-3">
                      {previewData.releaseYear && <span>{previewData.releaseYear}</span>}
                      {previewData.studio && <span>{previewData.studio}</span>}
                      {previewData.rating !== undefined && <span className="flex items-center gap-1">★ {previewData.rating}</span>}
                    </div>
                    
                    {previewData.genres && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {previewData.genres.split(',').map((genre, idx) => (
                          <span key={idx} className="px-2 py-1 bg-dark-light-color rounded-full text-xs">
                            {genre.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-300 line-clamp-4 mb-4">
                      {previewData.description || 'Description du contenu...'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {previewData.myAnimeListUrl && (
                        <a href={previewData.myAnimeListUrl} target="_blank" className="text-xs bg-blue-900 hover:bg-blue-800 px-3 py-1 rounded-full">
                          MyAnimeList
                        </a>
                      )}
                      {previewData.aniListUrl && (
                        <a href={previewData.aniListUrl} target="_blank" className="text-xs bg-indigo-900 hover:bg-indigo-800 px-3 py-1 rounded-full">
                          AniList
                        </a>
                      )}
                      {previewData.kitsuUrl && (
                        <a href={previewData.kitsuUrl} target="_blank" className="text-xs bg-orange-900 hover:bg-orange-800 px-3 py-1 rounded-full">
                          Kitsu
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
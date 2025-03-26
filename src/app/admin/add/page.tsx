'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ref, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';

// Schéma de validation
const contentSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  type: z.enum(['movie', 'series']),
  releaseYear: z.number().min(1900).max(new Date().getFullYear()),
  genres: z.string().min(1, 'Au moins un genre est requis'),
  posterUrl: z.string().url('URL invalide'),
  backdropUrl: z.string().url('URL invalide').optional(),
  trailerUrl: z.string().url('URL invalide').optional(),
  // Champs spécifiques au type de contenu
  videoUrl: z.string().url('URL invalide').optional(),
  seasons: z.array(z.any()).optional(),
});

type FormValues = z.infer<typeof contentSchema>;

export default function AddContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contentType, setContentType] = useState<'movie' | 'series'>('movie');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      type: 'movie',
      releaseYear: new Date().getFullYear(),
    }
  });

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
        updatedAt: Date.now()
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
      <div className="flex items-center mb-8">
        <button 
          onClick={() => router.push('/admin')}
          className="btn btn-outline btn-sm mr-4"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl font-bold">Ajouter un contenu</h1>
      </div>
      
      <div className="max-w-2xl mx-auto bg-dark-card-color rounded-lg shadow-lg p-8 border border-gray-700">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-white text-sm font-medium mb-1">Type de contenu</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="movie"
                  checked={contentType === 'movie'}
                  onChange={() => {
                    setContentType('movie');
                    setValue('type', 'movie');
                  }}
                  className="h-4 w-4 text-primary"
                />
                <span>Animé</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="series"
                  checked={contentType === 'series'}
                  onChange={() => {
                    setContentType('series');
                    setValue('type', 'series');
                  }}
                  className="h-4 w-4 text-primary"
                />
                <span>Manga</span>
              </label>
            </div>
          </div>
          
          <input type="hidden" {...register('type')} />
          
          <div className="space-y-2">
            <label htmlFor="title" className="block text-white text-sm font-medium">Titre</label>
            <input
              id="title"
              type="text"
              {...register('title')}
              className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Titre de l'animé ou du manga"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-white text-sm font-medium">Description</label>
            <textarea
              id="description"
              rows={4}
              {...register('description')}
              className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Description détaillée..."
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="releaseYear" className="block text-white text-sm font-medium">Année de sortie</label>
            <input
              id="releaseYear"
              type="number"
              {...register('releaseYear', { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {errors.releaseYear && <p className="text-red-400 text-sm mt-1">{errors.releaseYear.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="genres" className="block text-white text-sm font-medium">Genres (séparés par des virgules)</label>
            <input
              id="genres"
              type="text"
              placeholder="Action, Aventure, Comédie"
              {...register('genres')}
              className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {errors.genres && <p className="text-red-400 text-sm mt-1">{errors.genres.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="posterUrl" className="block text-white text-sm font-medium">URL de l'affiche</label>
            <input
              id="posterUrl"
              type="url"
              {...register('posterUrl')}
              className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="https://exemple.com/image.jpg"
            />
            {errors.posterUrl && <p className="text-red-400 text-sm mt-1">{errors.posterUrl.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="backdropUrl" className="block text-white text-sm font-medium">URL de l'image de fond (optionnel)</label>
            <input
              id="backdropUrl"
              type="url"
              {...register('backdropUrl')}
              className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="https://exemple.com/backdrop.jpg"
            />
            {errors.backdropUrl && <p className="text-red-400 text-sm mt-1">{errors.backdropUrl.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="trailerUrl" className="block text-white text-sm font-medium">URL de la bande-annonce (optionnel)</label>
            <input
              id="trailerUrl"
              type="url"
              {...register('trailerUrl')}
              className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="https://youtube.com/watch?v=xxx"
            />
            {errors.trailerUrl && <p className="text-red-400 text-sm mt-1">{errors.trailerUrl.message}</p>}
          </div>
          
          {contentType === 'movie' && (
            <div className="space-y-2">
              <label htmlFor="videoUrl" className="block text-white text-sm font-medium">URL de la vidéo</label>
              <input
                id="videoUrl"
                type="url"
                {...register('videoUrl')}
                className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="https://exemple.com/video.mp4"
              />
              {errors.videoUrl && <p className="text-red-400 text-sm mt-1">{errors.videoUrl.message}</p>}
            </div>
          )}
          
          <div className="flex space-x-4 pt-4">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ajout en cours...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FaPlus />
                  Ajouter
                </span>
              )}
            </button>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => router.push('/admin')}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
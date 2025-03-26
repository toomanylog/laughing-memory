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
          Retour
        </button>
        <h1 className="text-3xl font-bold">Ajouter un contenu</h1>
      </div>
      
      <div className="auth-container max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label className="form-label">Type de contenu</label>
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
                  className="form-input h-4 w-4 text-primary"
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
                  className="form-input h-4 w-4 text-primary"
                />
                <span>Manga</span>
              </label>
            </div>
          </div>
          
          <input type="hidden" {...register('type')} />
          
          <div className="form-group">
            <label htmlFor="title" className="form-label">Titre</label>
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
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              rows={4}
              {...register('description')}
              className="form-input"
              placeholder="Description détaillée..."
            />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="releaseYear" className="form-label">Année de sortie</label>
            <input
              id="releaseYear"
              type="number"
              {...register('releaseYear', { valueAsNumber: true })}
              className="form-input"
            />
            {errors.releaseYear && <p className="form-error">{errors.releaseYear.message}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="genres" className="form-label">Genres (séparés par des virgules)</label>
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
            <label htmlFor="posterUrl" className="form-label">URL de l'affiche</label>
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
            <label htmlFor="backdropUrl" className="form-label">URL de l'image de fond (optionnel)</label>
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
            <label htmlFor="trailerUrl" className="form-label">URL de la bande-annonce (optionnel)</label>
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
              <label htmlFor="videoUrl" className="form-label">URL de la vidéo</label>
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
          
          <div className="flex space-x-4 pt-4">
            <button 
              type="submit" 
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="loading-spinner w-5 h-5"></div>
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
              onClick={() => router.push('/admin')}
              className="btn btn-outline"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
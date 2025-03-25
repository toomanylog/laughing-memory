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
import { Button } from '@/components/ui/Button';

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
    return <div>Chargement...</div>;
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
      <h1 className="text-3xl font-bold mb-8">Ajouter un contenu</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Type de contenu</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="movie"
                checked={contentType === 'movie'}
                onChange={() => {
                  setContentType('movie');
                  setValue('type', 'movie');
                }}
                className="h-4 w-4"
              />
              <span>Film</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="series"
                checked={contentType === 'series'}
                onChange={() => {
                  setContentType('series');
                  setValue('type', 'series');
                }}
                className="h-4 w-4"
              />
              <span>Série</span>
            </label>
          </div>
        </div>
        
        <input type="hidden" {...register('type')} />
        
        <div className="space-y-1">
          <label htmlFor="title" className="block text-sm font-medium">Titre</label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className="w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-700"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium">Description</label>
          <textarea
            id="description"
            rows={4}
            {...register('description')}
            className="w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-700"
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="releaseYear" className="block text-sm font-medium">Année de sortie</label>
          <input
            id="releaseYear"
            type="number"
            {...register('releaseYear', { valueAsNumber: true })}
            className="w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-700"
          />
          {errors.releaseYear && <p className="text-red-500 text-sm">{errors.releaseYear.message}</p>}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="genres" className="block text-sm font-medium">Genres (séparés par des virgules)</label>
          <input
            id="genres"
            type="text"
            placeholder="Action, Aventure, Comédie"
            {...register('genres')}
            className="w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-700"
          />
          {errors.genres && <p className="text-red-500 text-sm">{errors.genres.message}</p>}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="posterUrl" className="block text-sm font-medium">URL de l'affiche</label>
          <input
            id="posterUrl"
            type="url"
            {...register('posterUrl')}
            className="w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-700"
          />
          {errors.posterUrl && <p className="text-red-500 text-sm">{errors.posterUrl.message}</p>}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="backdropUrl" className="block text-sm font-medium">URL de l'image de fond (optionnel)</label>
          <input
            id="backdropUrl"
            type="url"
            {...register('backdropUrl')}
            className="w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-700"
          />
          {errors.backdropUrl && <p className="text-red-500 text-sm">{errors.backdropUrl.message}</p>}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="trailerUrl" className="block text-sm font-medium">URL de la bande-annonce (optionnel)</label>
          <input
            id="trailerUrl"
            type="url"
            {...register('trailerUrl')}
            className="w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-700"
          />
          {errors.trailerUrl && <p className="text-red-500 text-sm">{errors.trailerUrl.message}</p>}
        </div>
        
        {contentType === 'movie' && (
          <div className="space-y-1">
            <label htmlFor="videoUrl" className="block text-sm font-medium">URL de la vidéo</label>
            <input
              id="videoUrl"
              type="url"
              {...register('videoUrl')}
              className="w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-700"
            />
            {errors.videoUrl && <p className="text-red-500 text-sm">{errors.videoUrl.message}</p>}
          </div>
        )}
        
        <div className="flex space-x-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Ajout en cours...' : 'Ajouter'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
} 
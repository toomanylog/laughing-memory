'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ref, get, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { MediaContent } from '@/lib/types';

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
  videoUrl: z.string().url('URL invalide').optional(),
});

type FormValues = z.infer<typeof contentSchema>;

export default function EditContentPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contentType, setContentType] = useState<'movie' | 'series'>('movie');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState<MediaContent | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      type: 'movie',
      releaseYear: new Date().getFullYear(),
    }
  });

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && !session.user.isAdmin) {
      router.push('/');
    }
  }, [status, session, router]);

  // Récupérer les données du contenu
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      
      try {
        const contentRef = ref(db, `content/${id}`);
        const snapshot = await get(contentRef);
        
        if (snapshot.exists()) {
          const contentData = snapshot.val() as MediaContent;
          setContent(contentData);
          setContentType(contentData.type);
          
          // Préremplir le formulaire
          setValue('title', contentData.title);
          setValue('description', contentData.description);
          setValue('type', contentData.type);
          setValue('releaseYear', contentData.releaseYear);
          setValue('genres', contentData.genres.join(', '));
          setValue('posterUrl', contentData.posterUrl);
          setValue('backdropUrl', contentData.backdropUrl || '');
          setValue('trailerUrl', contentData.trailerUrl || '');
          
          if (contentData.type === 'movie' && contentData.videoUrl) {
            setValue('videoUrl', contentData.videoUrl);
          }
        } else {
          setError('Contenu non trouvé');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du contenu:', err);
        setError('Une erreur est survenue lors de la récupération du contenu');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session.user.isAdmin) {
      fetchContent();
    }
  }, [id, status, session, setValue]);

  const onSubmit = async (data: FormValues) => {
    if (!id || !content) return;
    
    setSaving(true);
    try {
      const contentRef = ref(db, `content/${id}`);
      
      // Préparer les données
      const contentData = {
        ...content,
        title: data.title,
        description: data.description,
        type: data.type,
        releaseYear: data.releaseYear,
        genres: data.genres.split(',').map(g => g.trim()),
        posterUrl: data.posterUrl,
        backdropUrl: data.backdropUrl || null,
        trailerUrl: data.trailerUrl || null,
        updatedAt: Date.now()
      };
      
      // Ajouter videoUrl seulement pour les films
      if (data.type === 'movie') {
        contentData.videoUrl = data.videoUrl || undefined;
      }
      
      await update(contentRef, contentData);
      
      router.push('/admin');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du contenu:', err);
      setError('Une erreur est survenue lors de la mise à jour du contenu');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Modifier un contenu</h1>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
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
          <Button type="submit" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
} 
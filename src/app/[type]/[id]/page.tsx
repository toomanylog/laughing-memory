'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { MediaContent, Movie, Series } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/store';
import { FaPlay, FaHeart, FaRegHeart, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import du lecteur vidéo en dynamique pour la bande-annonce
const ReactPlayer = dynamic(() => import('react-player/lazy'), {
  ssr: false,
});

export default function ContentDetails() {
  const { type, id } = useParams() as { type: string; id: string };
  const router = useRouter();
  const [content, setContent] = useState<MediaContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  
  // Store global pour les favoris
  const { toggleFavorite, isInFavorites, getWatchProgress } = useAppStore();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const contentRef = ref(db, `content/${id}`);
        const snapshot = await get(contentRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val() as MediaContent;
          setContent(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du contenu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Contenu non trouvé</h1>
        <Button onClick={() => router.push('/')}>Retourner à l'accueil</Button>
      </div>
    );
  }

  // Vérifier si le contenu est dans les favoris
  const isFavorite = isInFavorites(content.id);
  
  // Récupérer la progression de visionnage
  const progress = getWatchProgress(content.id);

  return (
    <div className="min-h-screen pb-12">
      {/* Bannière avec image de fond */}
      <div className="relative h-[60vh] overflow-hidden">
        {content.backdropUrl ? (
          <div className="absolute inset-0">
            <Image
              src={content.backdropUrl}
              alt={content.title}
              fill
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-black to-gray-900" />
        )}
        
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
            <div className="w-48 h-72 rounded-lg overflow-hidden shadow-xl hidden md:block">
              <Image
                src={content.posterUrl}
                alt={content.title}
                width={192}
                height={288}
                className="object-cover w-full h-full"
              />
            </div>
            
            <div className="flex-grow">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">{content.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4">
                <span className="flex items-center gap-1">
                  <FaCalendarAlt />
                  <span>{content.releaseYear}</span>
                </span>
                
                {content.duration && (
                  <span className="flex items-center gap-1">
                    <FaClock />
                    <span>{content.duration} min</span>
                  </span>
                )}
                
                <div className="flex flex-wrap gap-2 mt-1">
                  {content.genres.map((genre) => (
                    <span 
                      key={genre} 
                      className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <Link href={`/play/${content.type}/${content.id}`}>
                  <Button className="flex items-center gap-2">
                    <FaPlay />
                    <span>
                      {progress ? (
                        progress > 90 ? 'Revoir' : 'Reprendre'
                      ) : (
                        'Regarder'
                      )}
                    </span>
                  </Button>
                </Link>
                
                {content.trailerUrl && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTrailer(!showTrailer)}
                  >
                    {showTrailer ? 'Masquer la bande-annonce' : 'Voir la bande-annonce'}
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  onClick={() => toggleFavorite(content.id)}
                  className="flex items-center gap-2"
                >
                  {isFavorite ? (
                    <>
                      <FaHeart className="text-red-500" />
                      <span>Retirer des favoris</span>
                    </>
                  ) : (
                    <>
                      <FaRegHeart />
                      <span>Ajouter aux favoris</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Bande-annonce */}
        {showTrailer && content.trailerUrl && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Bande-annonce</h2>
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <ReactPlayer
                url={content.trailerUrl}
                width="100%"
                height="100%"
                controls
              />
            </div>
          </div>
        )}
        
        {/* Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
          <p className="text-gray-300 max-w-3xl">{content.description}</p>
        </div>
        
        {/* Épisodes (si c'est une série) */}
        {content.type === 'series' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Épisodes</h2>
            {(content as Series).seasons && (content as Series).seasons.map((season) => (
              <div key={season.number} className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Saison {season.number}: {season.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {season.episodes.map((episode) => (
                    <Link 
                      key={episode.id} 
                      href={`/play/${content.type}/${content.id}?episode=${episode.id}`}
                      className="bg-gray-800/50 rounded-lg overflow-hidden transition-transform hover:scale-[1.02] hover:bg-gray-800"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-lg font-medium">Ep. {episode.number}</span>
                          <span className="text-sm text-gray-400">{episode.duration} min</span>
                        </div>
                        <h4 className="font-medium mb-2">{episode.title}</h4>
                        <p className="text-sm text-gray-400 line-clamp-2">{episode.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
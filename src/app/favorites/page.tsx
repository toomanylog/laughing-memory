'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { MediaContent } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlay, FaInfo, FaHeart, FaRegHeart } from 'react-icons/fa';
import { Button } from '@/components/ui/Button';

export default function FavoritesPage() {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Store global pour les favoris
  const { favorites: localFavorites, toggleFavorite } = useAppStore();

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        // Si l'utilisateur est connecté, récupérer les favoris depuis Firebase
        if (session?.user.id) {
          const userFavoritesRef = ref(db, `users/${session.user.id}/favorites`);
          const userFavoritesSnapshot = await get(userFavoritesRef);
          
          if (userFavoritesSnapshot.exists()) {
            const userFavoriteIds = Object.keys(userFavoritesSnapshot.val());
            const contentItems: MediaContent[] = [];
            
            // Récupérer les détails de chaque contenu favori
            for (const contentId of userFavoriteIds) {
              const contentRef = ref(db, `content/${contentId}`);
              const contentSnapshot = await get(contentRef);
              
              if (contentSnapshot.exists()) {
                contentItems.push(contentSnapshot.val());
              }
            }
            
            setFavorites(contentItems);
          } else {
            setFavorites([]);
          }
        } else {
          // Sinon, utiliser les favoris locaux
          if (localFavorites.length > 0) {
            const contentItems: MediaContent[] = [];
            
            for (const contentId of localFavorites) {
              const contentRef = ref(db, `content/${contentId}`);
              const contentSnapshot = await get(contentRef);
              
              if (contentSnapshot.exists()) {
                contentItems.push(contentSnapshot.val());
              }
            }
            
            setFavorites(contentItems);
          } else {
            setFavorites([]);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des favoris:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [session, localFavorites]);

  // Gérer la suppression des favoris
  const handleRemoveFavorite = (contentId: string) => {
    toggleFavorite(contentId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mes Favoris</h1>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {favorites.map((item) => (
            <div key={item.id} className="bg-gray-800/40 rounded-lg overflow-hidden group">
              <div className="aspect-[2/3] relative">
                <Image
                  src={item.posterUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col space-y-2">
                    <div className="flex justify-between gap-2">
                      <Link href={`/play/${item.type}/${item.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <FaPlay className="mr-2" />
                          <span>Regarder</span>
                        </Button>
                      </Link>
                      <Link href={`/${item.type}/${item.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          <FaInfo className="mr-2" />
                          <span>Détails</span>
                        </Button>
                      </Link>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleRemoveFavorite(item.id)}
                      className="w-full"
                    >
                      <FaHeart className="mr-2 text-red-500" />
                      <span>Retirer</span>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium">{item.title}</h3>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-400">{item.releaseYear}</p>
                  <p className="text-sm text-gray-400">{item.type === 'movie' ? 'Film' : 'Série'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            <FaRegHeart className="mx-auto text-gray-500" />
          </div>
          <p className="text-xl text-gray-400 mb-4">
            Vous n'avez pas encore de favoris
          </p>
          <p className="text-gray-500 mb-6">
            Explorez notre catalogue et ajoutez des films et séries à vos favoris
          </p>
          <Link href="/">
            <Button>
              Découvrir le catalogue
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
} 
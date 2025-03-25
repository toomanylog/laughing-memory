'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { MediaContent } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { FaPlay, FaInfoCircle } from 'react-icons/fa';

export default function Home() {
  const [featuredContent, setFeaturedContent] = useState<MediaContent | null>(null);
  const [trendingContent, setTrendingContent] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Récupérer le contenu mis en avant de Firebase
        const contentRef = ref(db, 'content');
        const snapshot = await get(contentRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const contentArray = Object.values(data) as MediaContent[];
          
          // Sélectionner un contenu aléatoire pour la mise en avant
          const randomIndex = Math.floor(Math.random() * contentArray.length);
          setFeaturedContent(contentArray[randomIndex]);
          
          // Filtrer les contenus tendance (les plus récents)
          const sorted = [...contentArray].sort((a, b) => b.createdAt - a.createdAt);
          setTrendingContent(sorted.slice(0, 6));
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du contenu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero section avec contenu à la une */}
      {featuredContent && (
        <div className="relative h-[70vh] overflow-hidden">
          {featuredContent.backdropUrl && (
            <div className="absolute inset-0">
              <Image
                src={featuredContent.backdropUrl}
                alt={featuredContent.title}
                fill
                className="object-cover opacity-50"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            </div>
          )}
          
          <div className="relative z-10 container mx-auto px-4 py-16 h-full flex flex-col justify-end">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{featuredContent.title}</h1>
            <p className="text-lg md:text-xl max-w-2xl mb-6 text-gray-200">{featuredContent.description}</p>
            <div className="flex space-x-4">
              <Link href={`/${featuredContent.type}/${featuredContent.id}`}>
                <Button className="flex items-center space-x-2">
                  <FaPlay />
                  <span>Regarder</span>
                </Button>
              </Link>
              <Link href={`/${featuredContent.type}/${featuredContent.id}/details`}>
                <Button variant="outline" className="flex items-center space-x-2">
                  <FaInfoCircle />
                  <span>Plus d'infos</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Section Tendances */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Tendances</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingContent.map((item) => (
            <Link 
              key={item.id} 
              href={`/${item.type}/${item.id}`}
              className="group relative rounded-md overflow-hidden transition-transform transform hover:scale-105"
            >
              <div className="aspect-[2/3] relative">
                <Image
                  src={item.posterUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="text-sm font-medium truncate">{item.title}</h3>
                  <p className="text-xs text-gray-300">{item.releaseYear}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

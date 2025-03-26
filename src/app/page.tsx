'use client';

import { useState, useEffect, useRef } from 'react';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import Image from 'next/image';
import MediaCard from '@/components/MediaCard';
import { MediaContent } from '@/lib/types';
import { FaPlay, FaInfoCircle, FaChevronRight, FaSpinner, FaFire, FaFilm, FaTv, FaStar } from 'react-icons/fa';

export default function Home() {
  const [featuredContent, setFeaturedContent] = useState<MediaContent | null>(null);
  const [trendingContent, setTrendingContent] = useState<MediaContent[]>([]);
  const [movies, setMovies] = useState<MediaContent[]>([]);
  const [series, setSeries] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const featuredRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Récupérer tout le contenu
        const contentRef = ref(db, 'content');
        const snapshot = await get(contentRef);
        
        if (snapshot.exists()) {
          const allContent: MediaContent[] = Object.values(snapshot.val());
          
          // Sélectionner un contenu aléatoire pour la section vedette
          const randomIndex = Math.floor(Math.random() * allContent.length);
          setFeaturedContent(allContent[randomIndex]);
          
          // Filtrer les films et les séries
          const moviesData = allContent.filter(item => item.type === 'movie');
          const seriesData = allContent.filter(item => item.type === 'series');
          
          // Trier par date d'ajout (récent d'abord)
          const sortedMovies = [...moviesData].sort((a, b) => b.createdAt - a.createdAt);
          const sortedSeries = [...seriesData].sort((a, b) => b.createdAt - a.createdAt);
          
          // Prendre les 10 premiers
          setMovies(sortedMovies.slice(0, 10));
          setSeries(sortedSeries.slice(0, 10));
          
          // Contenu tendance (on pourrait ajouter une logique plus sophistiquée ici)
          const trending = [...allContent].sort(() => 0.5 - Math.random()).slice(0, 6);
          setTrendingContent(trending);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  // Effet de parallaxe au scroll
  useEffect(() => {
    const handleScroll = () => {
      if (featuredRef.current) {
        const scrollPos = window.scrollY;
        featuredRef.current.style.backgroundPositionY = `${scrollPos * 0.5}px`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      {/* Section héro - Film/Série en vedette */}
      {featuredContent && (
        <div 
          ref={featuredRef}
          className="relative h-[80vh] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${featuredContent.backdropUrl || featuredContent.posterUrl})`,
          }}
        >
          {/* Overlay de gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/80 to-transparent"></div>
          
          <div className="container mx-auto px-4 h-full flex items-end pb-16 relative z-10">
            <div className="max-w-2xl">
              <div className="flex items-center mb-4 space-x-3">
                <span className="bg-primary text-white text-sm px-3 py-1 rounded">
                  À la une
                </span>
                <span className="bg-[#222222] text-white text-sm px-3 py-1 rounded">
                  {featuredContent.type === 'movie' ? 'Film' : 'Série'}
                </span>
                <div className="flex items-center text-[#E8B221]">
                  <FaStar className="mr-1" />
                  <span>{featuredContent.releaseYear}</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
                {featuredContent.title}
              </h1>
              
              <p className="text-gray-200 mb-6 line-clamp-2 md:line-clamp-3 drop-shadow-md">
                {featuredContent.description}
              </p>
              
              <div className="space-x-4 flex">
                <Link href={`/${featuredContent.type}/${featuredContent.id}`}>
                  <button className="btn-primary flex items-center">
                    <FaPlay className="mr-2" />
                    Regarder
                  </button>
                </Link>
                <Link href={`/${featuredContent.type}/${featuredContent.id}`}>
                  <button className="btn-outline flex items-center">
                    <FaInfoCircle className="mr-2" />
                    Plus d'infos
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Section Tendances */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <FaFire className="mr-2 text-[#E8B221]" />
            Tendances
          </h2>
          <Link href="/search?category=trending" className="text-primary hover:text-primary/80 flex items-center">
            Voir tout <FaChevronRight className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingContent.map(content => (
            <MediaCard key={content.id} content={content} />
          ))}
        </div>
      </section>
      
      {/* Section Films */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <FaFilm className="mr-2 text-[#2173E8]" />
            Films Populaires
          </h2>
          <Link href="/movies" className="text-primary hover:text-primary/80 flex items-center">
            Voir tout <FaChevronRight className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {movies.slice(0, 5).map(movie => (
            <MediaCard key={movie.id} content={movie} />
          ))}
        </div>
      </section>
      
      {/* Section Séries */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <FaTv className="mr-2 text-[#3ECF8E]" />
            Séries Populaires
          </h2>
          <Link href="/series" className="text-primary hover:text-primary/80 flex items-center">
            Voir tout <FaChevronRight className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {series.slice(0, 5).map(serie => (
            <MediaCard key={serie.id} content={serie} />
          ))}
        </div>
      </section>
    </main>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import Image from 'next/image';
import MediaCard from '@/components/MediaCard';
import { MediaContent } from '@/lib/types';
import { FaPlay, FaInfoCircle, FaChevronRight, FaSpinner, FaFire, FaFilm, FaTv, FaStar, FaEye, FaClock, FaCalendarAlt } from 'react-icons/fa';

export default function Home() {
  const [featuredContent, setFeaturedContent] = useState<MediaContent | null>(null);
  const [trendingContent, setTrendingContent] = useState<MediaContent[]>([]);
  const [popularAnimes, setPopularAnimes] = useState<MediaContent[]>([]);
  const [popularMangas, setPopularMangas] = useState<MediaContent[]>([]);
  const [newReleases, setNewReleases] = useState<MediaContent[]>([]);
  const [editorsPicks, setEditorsPicks] = useState<MediaContent[]>([]);
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
          
          // Filtrer les animés et les mangas
          const animesData = allContent.filter(item => item.type === 'movie');
          const mangasData = allContent.filter(item => item.type === 'series');
          
          // Trier par date d'ajout (récent d'abord)
          const sortedAnimes = [...animesData].sort((a, b) => b.createdAt - a.createdAt);
          const sortedMangas = [...mangasData].sort((a, b) => b.createdAt - a.createdAt);
          
          // Animés et mangas populaires (12 premiers)
          setPopularAnimes(sortedAnimes.slice(0, 12));
          setPopularMangas(sortedMangas.slice(0, 12));
          
          // Contenu tendance (pseudo-algorithme basé sur dates récentes mélangées)
          const trending = [...allContent]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 20)
            .sort(() => 0.5 - Math.random())
            .slice(0, 6);
          setTrendingContent(trending);
          
          // Nouveautés (ajoutées récemment)
          setNewReleases(allContent
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 6));
          
          // Choix de l'éditeur (sélection aléatoire pour la démo)
          setEditorsPicks([...allContent]
            .sort(() => 0.5 - Math.random())
            .slice(0, 6));
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
      <div className="loading-container">
        <FaSpinner className="loading-spinner" />
      </div>
    );
  }

  return (
    <main>
      {/* Hero Banner - Featured Content */}
      {featuredContent && (
        <div className="hero-banner">
          <Image
            src={featuredContent.backdropUrl || featuredContent.posterUrl}
            alt={featuredContent.title}
            fill
            priority
            className="hero-banner-image"
          />
          <div className="hero-banner-overlay">
            <div className="category-badge">
              {featuredContent.type === 'movie' ? 'Animé' : 'Manga'}
            </div>
            
            <h1 className="hero-title">{featuredContent.title}</h1>
            
            <p className="hero-description">
              {featuredContent.description.length > 200
                ? `${featuredContent.description.substring(0, 200)}...`
                : featuredContent.description}
            </p>
            
            <div className="hero-stats">
              <div className="hero-stat">
                <FaStar className="hero-stat-icon" />
                {featuredContent.releaseYear}
              </div>
              
              <div className="hero-stat">
                <FaClock className="hero-stat-icon" />
                {featuredContent.duration ? `${Math.floor(featuredContent.duration / 60)}h${featuredContent.duration % 60}m` : 'Multiple épisodes'}
              </div>
              
              <div className="hero-stat">
                <FaCalendarAlt className="hero-stat-icon" />
                Ajouté le {new Date(featuredContent.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
            
            <div className="hero-actions">
              <Link href={`/${featuredContent.type}/${featuredContent.id}`} className="btn btn-primary">
                <FaPlay />
                Regarder maintenant
              </Link>
              
              <Link href={`/${featuredContent.type}/${featuredContent.id}`} className="btn btn-outline">
                <FaInfoCircle />
                Plus d'infos
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Trending Content - Top Picks */}
      <section className="featured-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              <FaFire className="section-title-icon" />
              Trending maintenant
            </h2>
            
            <Link href="/search?category=trending" className="view-all">
              Voir tout <FaChevronRight />
            </Link>
          </div>
          
          <div className="grid-cards">
            {trendingContent.map(content => (
              <div key={content.id} className="card-container">
                <div className="trending-badge">
                  <FaFire />
                  Trending
                </div>
                <MediaCard content={content} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Releases */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            <FaCalendarAlt className="section-title-icon" />
            Nouveautés
          </h2>
          <Link href="/search?category=new" className="view-all">
            Voir tout <FaChevronRight />
          </Link>
        </div>
        
        <div className="grid-cards">
          {newReleases.map(content => (
            <MediaCard key={content.id} content={content} />
          ))}
        </div>
      </section>
      
      {/* Editor's Picks */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            <FaStar className="section-title-icon" />
            Choix de l'éditeur
          </h2>
          <Link href="/search?category=editors-picks" className="view-all">
            Voir tout <FaChevronRight />
          </Link>
        </div>
        
        <div className="grid-cards">
          {editorsPicks.map(content => (
            <div key={content.id} className="card-container">
              <div className="trending-badge" style={{backgroundColor: 'var(--accent-yellow)'}}>
                <FaStar style={{color: 'black'}} />
                Choix éditeur
              </div>
              <MediaCard content={content} />
            </div>
          ))}
        </div>
      </section>

      {/* Popular Animes */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            <FaFilm className="section-title-icon" />
            Animés Populaires
          </h2>
          <Link href="/animes" className="view-all">
            Voir tout <FaChevronRight />
          </Link>
        </div>
        
        <div className="grid-cards">
          {popularAnimes.slice(0, 6).map(anime => (
            <MediaCard key={anime.id} content={anime} />
          ))}
        </div>
      </section>
      
      {/* Popular Mangas */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            <FaTv className="section-title-icon" />
            Mangas Populaires
          </h2>
          <Link href="/mangas" className="view-all">
            Voir tout <FaChevronRight />
          </Link>
        </div>
        
        <div className="grid-cards">
          {popularMangas.slice(0, 6).map(manga => (
            <MediaCard key={manga.id} content={manga} />
          ))}
        </div>
      </section>
    </main>
  );
}

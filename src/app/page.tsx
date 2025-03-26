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
  const [popularMovies, setPopularMovies] = useState<MediaContent[]>([]);
  const [popularSeries, setPopularSeries] = useState<MediaContent[]>([]);
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
          
          // Filtrer les films et les séries
          const moviesData = allContent.filter(item => item.type === 'movie');
          const seriesData = allContent.filter(item => item.type === 'series');
          
          // Trier par date d'ajout (récent d'abord)
          const sortedMovies = [...moviesData].sort((a, b) => b.createdAt - a.createdAt);
          const sortedSeries = [...seriesData].sort((a, b) => b.createdAt - a.createdAt);
          
          // Films et séries populaires (10 premiers)
          setPopularMovies(sortedMovies.slice(0, 12));
          setPopularSeries(sortedSeries.slice(0, 12));
          
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
              {featuredContent.type === 'movie' ? 'Film' : 'Série'}
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

      {/* Popular Movies */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            <FaFilm className="section-title-icon" />
            Films Populaires
          </h2>
          <Link href="/movies" className="view-all">
            Voir tout <FaChevronRight />
          </Link>
        </div>
        
        <div className="grid-cards">
          {popularMovies.slice(0, 6).map(movie => (
            <MediaCard key={movie.id} content={movie} />
          ))}
        </div>
      </section>
      
      {/* Popular Series */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            <FaTv className="section-title-icon" />
            Séries Populaires
          </h2>
          <Link href="/series" className="view-all">
            Voir tout <FaChevronRight />
          </Link>
        </div>
        
        <div className="grid-cards">
          {popularSeries.slice(0, 6).map(serie => (
            <MediaCard key={serie.id} content={serie} />
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="footer">
        <div className="section-container">
          <div className="footer-grid">
            <div>
              <h3 className="logo">
                <span className="logo-primary">Stream</span>Flix
              </h3>
              <p className="footer-description">
                La plateforme de streaming qui vous offre le meilleur des films et séries.
              </p>
            </div>
            
            <div>
              <h4 className="footer-title">Explorer</h4>
              <Link href="/movies" className="footer-link">Films</Link>
              <Link href="/series" className="footer-link">Séries</Link>
              <Link href="/search?category=trending" className="footer-link">Tendances</Link>
              <Link href="/search?category=new" className="footer-link">Nouveautés</Link>
            </div>
            
            <div>
              <h4 className="footer-title">Mon compte</h4>
              <Link href="/profile" className="footer-link">Profil</Link>
              <Link href="/favorites" className="footer-link">Favoris</Link>
              <Link href="/auth/signin" className="footer-link">Connexion</Link>
              <Link href="/auth/signup" className="footer-link">Inscription</Link>
            </div>
            
            <div>
              <h4 className="footer-title">Aide</h4>
              <Link href="/terms" className="footer-link">Conditions d'utilisation</Link>
              <Link href="/privacy" className="footer-link">Politique de confidentialité</Link>
              <Link href="/contact" className="footer-link">Contactez-nous</Link>
              <Link href="/faq" className="footer-link">FAQ</Link>
            </div>
          </div>
          
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} StreamFlix. Tous droits réservés.
          </div>
        </div>
      </footer>
    </main>
  );
}

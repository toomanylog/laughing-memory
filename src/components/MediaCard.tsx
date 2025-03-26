import { MediaContent } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlay, FaHeart, FaStar, FaEye, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { useState } from 'react';

interface MediaCardProps {
  content: MediaContent;
  isFeatured?: boolean;
}

export default function MediaCard({ content, isFeatured = false }: MediaCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    // Ici, vous pourriez implémenter la logique pour sauvegarder l'état de favoris
  };

  return (
    <div className="media-card">
      <Link href={`/${content.type}/${content.id}`}>
        <div className="media-poster">
          {/* Image principale */}
          <Image
            src={content.posterUrl || '/images/placeholder.jpg'}
            alt={content.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={isFeatured}
          />
          
          {/* Badges */}
          <div className="media-badge badge-quality">
            <span>HD</span>
          </div>
          
          <div className="media-badge badge-type">
            {content.type === 'movie' ? 'Animé' : 'Manga'}
          </div>
          
          {/* Overlay avec dégradé */}
          <div className="media-gradient"></div>
          
          {/* Contenu de la carte */}
          <div className="media-content">
            <h3 className="media-title">
              {content.title}
            </h3>
            
            <div className="media-info">
              <span className="media-meta">
                <FaCalendarAlt className="media-meta-icon" />
                {content.releaseYear}
              </span>
              
              {content.duration && (
                <span className="media-meta">
                  <FaClock className="media-meta-icon" />
                  {Math.floor(content.duration / 60)}h{content.duration % 60}
                </span>
              )}
            </div>
            
            {/* Genres */}
            <div className="media-genres">
              {content.genres.slice(0, 2).map(genre => (
                <span 
                  key={genre} 
                  className="genre-tag"
                >
                  {genre}
                </span>
              ))}
            </div>
            
            {/* Boutons d'action */}
            <div className="media-actions">
              <Link 
                href={`/${content.type}/${content.id}`}
                className="btn btn-primary btn-sm"
              >
                <FaPlay />
                Regarder
              </Link>
              
              <button 
                className={`btn btn-outline btn-sm ${isLiked ? 'text-primary' : ''}`}
                onClick={handleLike}
                aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <FaHeart className={isLiked ? "text-primary" : ""} />
              </button>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="media-progress">
            <div className="progress-bar" style={{width: `${content.progress || 0}%`}}></div>
          </div>
        </div>
      </Link>
    </div>
  );
} 
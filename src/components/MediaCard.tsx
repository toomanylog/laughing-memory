import { MediaContent } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlay, FaHeart, FaStar, FaEye } from 'react-icons/fa';
import { useState } from 'react';

interface MediaCardProps {
  content: MediaContent;
  isFeatured?: boolean;
}

export default function MediaCard({ content, isFeatured = false }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative overflow-hidden transition-all duration-300 card-media transform ${
        isHovered ? 'scale-105 shadow-glow' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/${content.type}/${content.id}`}>
        <div className="relative aspect-[2/3] w-full">
          {/* Image avec overlay */}
          <Image
            src={content.posterUrl || '/images/placeholder.jpg'}
            alt={content.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover rounded-md"
            priority={isFeatured}
          />
          
          {/* Overlay de gradient */}
          <div className={`absolute inset-0 bg-gradient-to-t from-dark-light via-transparent to-transparent opacity-100 transition-opacity duration-300 ${
            isHovered ? 'via-dark/50' : ''
          }`}></div>
          
          {/* Badge de type (Film/Série) */}
          <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
            {content.type === 'movie' ? 'Film' : 'Série'}
          </div>
          
          {/* Notation */}
          <div className="absolute top-2 right-2 bg-dark-light/80 text-accent-yellow text-xs px-2 py-1 rounded-full flex items-center">
            <FaStar className="mr-1" />
            {content.duration ? `${Math.floor(content.duration / 60)}h${content.duration % 60}` : ''}
          </div>
          
          {/* Contenu au survol */}
          <div className={`absolute inset-0 flex flex-col justify-end p-3 transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-100'
          }`}>
            <h3 className="text-white font-bold text-sm md:text-base truncate mb-1">
              {content.title}
            </h3>
            
            <div className="flex justify-between items-center text-xs text-gray-300 mb-2">
              <span>{content.releaseYear}</span>
              <div className="flex items-center">
                <span className="bg-dark-light px-2 py-0.5 rounded-full text-xs">
                  {content.genres.length > 0 ? content.genres[0] : ''}
                </span>
              </div>
            </div>
            
            {/* Boutons d'action (visibles au survol) */}
            <div className={`flex gap-2 transition-all duration-300 transform ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <button className="flex-1 btn-primary-sm flex items-center justify-center">
                <FaPlay className="mr-1" />
                Regarder
              </button>
              <button className="btn-outline-sm p-2 rounded-full flex items-center justify-center">
                <FaHeart />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
} 
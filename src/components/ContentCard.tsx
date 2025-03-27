import React from 'react';
import { Link } from 'react-router-dom';
import { Content } from '../types/index.ts';

interface ContentCardProps {
  content: Content;
}

const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  return (
    <Link 
      to={`/watch/${content.id}`} 
      className="block rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative">
        {/* Image du contenu */}
        <img 
          src={content.imageUrl} 
          alt={content.title} 
          className="w-full h-48 object-cover"
        />
        
        {/* Badge du type de contenu (film ou série) */}
        <div className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-black bg-opacity-70 text-white">
          {content.type === 'movie' ? 'Film' : 'Série'}
        </div>
      </div>
      
      {/* Informations sur le contenu */}
      <div className="p-4">
        <h3 className="text-lg font-bold truncate">{content.title}</h3>
        
        <div className="flex items-center justify-between mt-1 text-sm text-gray-600">
          <span>{content.releaseYear}</span>
          {content.type === 'movie' && content.duration && (
            <span>{Math.floor(content.duration / 60)}h {content.duration % 60}min</span>
          )}
          {content.type === 'series' && content.seasons && (
            <span>{content.seasons.length} saisons</span>
          )}
        </div>
        
        {/* Genres */}
        <div className="mt-2 flex flex-wrap gap-1">
          {content.genre.slice(0, 3).map((genre, index) => (
            <span 
              key={index} 
              className="text-xs bg-gray-100 px-2 py-1 rounded-full"
            >
              {genre}
            </span>
          ))}
          {content.genre.length > 3 && (
            <span className="text-xs px-1">+{content.genre.length - 3}</span>
          )}
        </div>
        
        {/* Description tronquée */}
        <p className="text-sm mt-2 text-gray-700 line-clamp-2">
          {content.description}
        </p>
      </div>
    </Link>
  );
};

export default ContentCard; 
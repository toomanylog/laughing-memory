import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContentCard from '../components/ContentCard.tsx';
import { useContent } from '../hooks/useContent.ts';
import { Content } from '../types/index.ts';

const HomePage: React.FC = () => {
  const { contents, loading, error } = useContent();
  const [featuredContent, setFeaturedContent] = useState<Content | null>(null);
  const [newReleases, setNewReleases] = useState<Content[]>([]);
  const [popular, setPopular] = useState<Content[]>([]);
  
  useEffect(() => {
    if (contents.length > 0) {
      // Pour la démonstration, on sélectionne un contenu aléatoire comme contenu à la une
      const randomIndex = Math.floor(Math.random() * contents.length);
      setFeaturedContent(contents[randomIndex]);
      
      // Trier les contenus par date de création (plus récents en premier)
      const sortedByDate = [...contents].sort((a, b) => b.createdAt - a.createdAt);
      setNewReleases(sortedByDate.slice(0, 6)); // 6 nouveautés
      
      // Sélectionner quelques contenus pour la section "populaire"
      // Dans une application réelle, on utiliserait des données de visionnage/notation
      const shuffled = [...contents].sort(() => 0.5 - Math.random());
      setPopular(shuffled.slice(0, 6)); // 6 contenus populaires
    }
  }, [contents]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Contenu à la une */}
      {featuredContent && (
        <div className="relative mb-12 rounded-lg overflow-hidden shadow-lg">
          <img 
            src={featuredContent.imageUrl} 
            alt={featuredContent.title} 
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-4xl font-bold text-white mb-2">{featuredContent.title}</h1>
            <p className="text-white mb-4 max-w-xl">{featuredContent.description.substring(0, 150)}...</p>
            <Link 
              to={`/watch/${featuredContent.id}`}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md inline-block font-medium"
            >
              Regarder maintenant
            </Link>
          </div>
        </div>
      )}
      
      {/* Nouvelles sorties */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Nouvelles sorties</h2>
        {newReleases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {newReleases.map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aucun contenu disponible</p>
        )}
      </div>
      
      {/* Populaires sur Streaming App */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Populaires</h2>
        {popular.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popular.map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aucun contenu disponible</p>
        )}
      </div>
    </div>
  );
};

export default HomePage; 
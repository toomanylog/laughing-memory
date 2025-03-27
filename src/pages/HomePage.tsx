import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../hooks/useContent';
import ContentCard from '../components/ContentCard';

const HomePage: React.FC = () => {
  const { contents, loading, error } = useContent();
  
  // Tri des contenus par date de mise à jour (les plus récents d'abord)
  const sortedContents = [...contents].sort((a, b) => b.updatedAt - a.updatedAt);
  
  // Séparation des films et séries
  const movies = sortedContents.filter(content => content.type === 'movie').slice(0, 6);
  const series = sortedContents.filter(content => content.type === 'series').slice(0, 6);
  
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
      {/* Hero section */}
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-r from-black to-gray-800 text-white rounded-lg mb-12">
        <h1 className="text-4xl font-bold text-center mb-4">Bienvenue sur Laughing Memory</h1>
        <p className="text-xl text-center mb-8 max-w-2xl">
          Une plateforme streaming gratuite pour découvrir des films et séries en illimité
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            to="/movies" 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Explorer les films
          </Link>
          <Link 
            to="/series" 
            className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-md font-medium"
          >
            Découvrir les séries
          </Link>
        </div>
      </div>
      
      {/* Films section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Films populaires</h2>
          <Link to="/movies" className="text-red-600 hover:text-red-700">
            Voir tous les films
          </Link>
        </div>
        
        {movies.length === 0 ? (
          <p className="text-gray-600">Aucun film disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {movies.map(movie => (
              <ContentCard key={movie.id} content={movie} />
            ))}
          </div>
        )}
      </section>
      
      {/* Séries section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Séries populaires</h2>
          <Link to="/series" className="text-red-600 hover:text-red-700">
            Voir toutes les séries
          </Link>
        </div>
        
        {series.length === 0 ? (
          <p className="text-gray-600">Aucune série disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {series.map(serie => (
              <ContentCard key={serie.id} content={serie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage; 
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto text-center">
        <div className="relative mb-8">
          <h1 className="text-8xl font-bold text-red-600 dark:text-red-500 mb-4 animate-pulse">404</h1>
          <div className="absolute inset-0 bg-red-600/10 dark:bg-red-500/10 rounded-full blur-3xl -z-10"></div>
        </div>
        <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">Page non trouvée</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
          Désolé, la page que vous recherchez semble avoir disparu dans le vide numérique.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/20"
        >
          Retourner à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage; 
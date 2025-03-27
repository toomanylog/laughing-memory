import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-8">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Page non trouvée</h2>
        <p className="text-gray-600 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-md transition-colors"
        >
          Retourner à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage; 
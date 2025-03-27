import React, { useState, useEffect } from 'react';
import { useContent } from '../hooks/useContent';
import ContentCard from '../components/ContentCard';
import { Content } from '../types';

const SeriesPage: React.FC = () => {
  const { contents, loading, error, getContentsByType } = useContent();
  const [series, setSeries] = useState<Content[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(true);

  useEffect(() => {
    async function fetchSeries() {
      setLoadingSeries(true);
      try {
        const seriesData = await getContentsByType('series');
        setSeries(seriesData);
      } catch (err) {
        console.error('Erreur lors de la récupération des séries:', err);
      } finally {
        setLoadingSeries(false);
      }
    }

    fetchSeries();
  }, [getContentsByType]);

  if (loading || loadingSeries) {
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Séries</h1>
      </div>

      {series.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Aucune série disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {series.map(serie => (
            <ContentCard key={serie.id} content={serie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SeriesPage; 
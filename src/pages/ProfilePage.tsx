import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Content, UserProgress } from '../types';

interface WatchHistoryItem {
  progress: UserProgress;
  content: Content;
}

const ProfilePage: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/profile' } });
    }
  }, [currentUser, navigate]);
  
  // Récupérer l'historique de visionnage
  useEffect(() => {
    async function fetchWatchHistory() {
      if (!currentUser) return;
      
      setLoading(true);
      
      try {
        // Récupérer toutes les progressions de l'utilisateur
        const progressRef = ref(db, `progress/${currentUser.uid}`);
        const progressSnapshot = await get(progressRef);
        
        if (!progressSnapshot.exists()) {
          setWatchHistory([]);
          setLoading(false);
          return;
        }
        
        const progressData = progressSnapshot.val();
        const historyWithContents: WatchHistoryItem[] = [];
        
        // Pour chaque progression, récupérer les détails du contenu
        for (const contentId in progressData) {
          const contentRef = ref(db, `contents/${contentId}`);
          const contentSnapshot = await get(contentRef);
          
          if (contentSnapshot.exists()) {
            const content = { 
              id: contentId, 
              ...contentSnapshot.val() 
            } as Content;
            
            historyWithContents.push({
              progress: progressData[contentId],
              content
            });
          }
        }
        
        // Trier par date de visionnage (le plus récent d'abord)
        historyWithContents.sort((a, b) => b.progress.lastWatchedAt - a.progress.lastWatchedAt);
        
        setWatchHistory(historyWithContents);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'historique:', err);
        setError('Impossible de charger votre historique de visionnage');
      } finally {
        setLoading(false);
      }
    }
    
    fetchWatchHistory();
  }, [currentUser]);
  
  if (!currentUser) {
    return null; // L'effet de redirection s'en occupe
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">Mon profil</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Informations</h2>
          <p className="text-gray-700">Email: {currentUser.email}</p>
          <p className="text-gray-700">Compte créé le: {userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Historique de visionnage</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {watchHistory.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Vous n'avez pas encore visionné de contenu.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contenu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progression
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière visualisation
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {watchHistory.map(({ content, progress }) => (
                  <tr key={content.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-16 flex-shrink-0">
                          <img 
                            src={content.imageUrl} 
                            alt={content.title} 
                            className="h-10 w-16 object-cover rounded"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{content.title}</div>
                          {progress.episodeId && (
                            <div className="text-xs text-gray-500">
                              Épisode: {content.seasons?.find(s => s.id === progress.seasonId)?.episodes.find(e => e.id === progress.episodeId)?.title || 'Inconnu'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        content.type === 'movie' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {content.type === 'movie' ? 'Film' : 'Série'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-red-600 h-2.5 rounded-full" 
                          style={{ width: `${progress.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{Math.round(progress.progress)}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(progress.lastWatchedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          if (content.type === 'movie') {
                            navigate(`/watch/${content.id}`);
                          } else if (progress.seasonId && progress.episodeId) {
                            navigate(`/watch/${content.id}/${progress.seasonId}/${progress.episodeId}`);
                          } else {
                            navigate(`/watch/${content.id}`);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reprendre
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 
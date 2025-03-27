import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useContent } from '../hooks/useContent.ts';
import { Content } from '../types/index.ts';
import ContentForm from '../components/admin/ContentForm.tsx';

const AdminPage: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const { contents, loading, error, addContent, updateContent, deleteContent } = useContent();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Rediriger si l'utilisateur n'est pas connecté ou n'est pas admin
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/admin' } });
    } else if (userData && userData.role !== 'admin') {
      // Rediriger les utilisateurs non-admin vers la page d'accueil
      setActionMessage({
        text: "Vous n'avez pas les droits d'accès à cette page",
        type: 'error'
      });
      navigate('/');
    }
  }, [currentUser, navigate, userData]);
  
  // Gestion des messages d'action (success/error)
  useEffect(() => {
    if (actionMessage) {
      const timeout = setTimeout(() => {
        setActionMessage(null);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [actionMessage]);
  
  // Ouvrir le formulaire en mode création
  const handleAddContent = () => {
    setSelectedContent(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };
  
  // Ouvrir le formulaire en mode édition
  const handleEditContent = (content: Content) => {
    setSelectedContent(content);
    setIsEditing(true);
    setIsFormOpen(true);
  };
  
  // Gérer la suppression d'un contenu
  const handleDeleteContent = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contenu ? Cette action est irréversible.')) {
      try {
        const success = await deleteContent(id);
        
        if (success) {
          setActionMessage({
            text: 'Contenu supprimé avec succès',
            type: 'success'
          });
        } else {
          setActionMessage({
            text: 'Erreur lors de la suppression du contenu',
            type: 'error'
          });
        }
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        setActionMessage({
          text: 'Erreur lors de la suppression du contenu',
          type: 'error'
        });
      }
    }
  };
  
  // Gérer la soumission du formulaire
  const handleSubmitForm = async (contentData: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && selectedContent) {
        // Mise à jour d'un contenu existant
        const success = await updateContent(selectedContent.id, contentData);
        
        if (success) {
          setActionMessage({
            text: 'Contenu mis à jour avec succès',
            type: 'success'
          });
          setIsFormOpen(false);
        } else {
          setActionMessage({
            text: 'Erreur lors de la mise à jour du contenu',
            type: 'error'
          });
        }
      } else {
        // Ajout d'un nouveau contenu
        const newContentId = await addContent(contentData);
        
        if (newContentId) {
          setActionMessage({
            text: 'Contenu ajouté avec succès',
            type: 'success'
          });
          setIsFormOpen(false);
        } else {
          setActionMessage({
            text: 'Erreur lors de l\'ajout du contenu',
            type: 'error'
          });
        }
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setActionMessage({
        text: 'Une erreur est survenue',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fermer le formulaire
  const handleCancelForm = () => {
    setIsFormOpen(false);
  };
  
  // Vérification des droits d'admin
  if (!currentUser || (userData && userData.role !== 'admin')) {
    return null; // L'effet de redirection s'en occupe
  }
  
  // Affichage d'un indicateur de chargement pendant la vérification des droits
  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Panel d'administration</h1>
      
      {/* Messages de notification */}
      {actionMessage && (
        <div className={`p-4 mb-6 rounded-md ${
          actionMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {actionMessage.text}
        </div>
      )}
      
      {/* Formulaire d'ajout/édition */}
      {isFormOpen ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Modifier le contenu' : 'Ajouter un nouveau contenu'}
          </h2>
          
          <ContentForm 
            content={selectedContent || undefined}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : (
        <div className="mb-6">
          <button
            onClick={handleAddContent}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Ajouter un nouveau contenu
          </button>
        </div>
      )}
      
      {/* Liste des contenus */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b">Liste des contenus</h2>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des contenus...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : contents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Aucun contenu disponible. Ajoutez votre premier contenu!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Genres
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Année
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière mise à jour
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contents.map((content) => (
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
                          <div className="text-sm text-gray-500">
                            {content.type === 'series' && content.seasons ? `${content.seasons.length} saisons` : ''}
                          </div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {content.genre?.join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {content.releaseYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(content.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditContent(content)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteContent(content.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
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

export default AdminPage; 
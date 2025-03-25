import { ref, get, set, remove, push, query, orderByChild, onValue, off } from 'firebase/database';
import { database } from '../../config/firebase';
import { Content, Episode } from '../../types';

// Chemin de base dans la base de données
const CONTENT_PATH = 'content';

// Récupérer tout le contenu
export const getAllContent = async (): Promise<Content[]> => {
  try {
    const contentRef = ref(database, CONTENT_PATH);
    const snapshot = await get(contentRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const content: Content[] = [];
    snapshot.forEach((childSnapshot) => {
      content.push({
        id: childSnapshot.key || '',
        ...childSnapshot.val(),
      });
    });
    
    return content;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Une erreur est survenue lors de la récupération du contenu'
    );
  }
};

// Observer tout le contenu en temps réel
export const observeAllContent = (
  callback: (content: Content[]) => void,
  onError?: (error: Error) => void
) => {
  const contentRef = ref(database, CONTENT_PATH);
  
  const handleData = (snapshot: any) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const content: Content[] = [];
    snapshot.forEach((childSnapshot: any) => {
      content.push({
        id: childSnapshot.key || '',
        ...childSnapshot.val(),
      });
    });
    
    callback(content);
  };
  
  const handleError = (error: Error) => {
    if (onError) {
      onError(error);
    } else {
      console.error('Erreur lors de l\'observation du contenu:', error);
    }
  };
  
  onValue(contentRef, handleData, handleError);
  
  // Retourner une fonction de nettoyage
  return () => off(contentRef);
};

// Récupérer un contenu par ID
export const getContentById = async (id: string): Promise<Content | null> => {
  try {
    const contentRef = ref(database, `${CONTENT_PATH}/${id}`);
    const snapshot = await get(contentRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.key || '',
      ...snapshot.val(),
    };
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : `Une erreur est survenue lors de la récupération du contenu (ID: ${id})`
    );
  }
};

// Observer un contenu spécifique en temps réel
export const observeContentById = (
  id: string,
  callback: (content: Content | null) => void,
  onError?: (error: Error) => void
) => {
  const contentRef = ref(database, `${CONTENT_PATH}/${id}`);
  
  const handleData = (snapshot: any) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    
    callback({
      id: snapshot.key || '',
      ...snapshot.val(),
    });
  };
  
  const handleError = (error: Error) => {
    if (onError) {
      onError(error);
    } else {
      console.error(`Erreur lors de l'observation du contenu (ID: ${id}):`, error);
    }
  };
  
  onValue(contentRef, handleData, handleError);
  
  // Retourner une fonction de nettoyage
  return () => off(contentRef);
};

// Créer ou mettre à jour du contenu
export const saveContent = async (content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>, id?: string): Promise<Content> => {
  try {
    const now = new Date().toISOString();
    let contentRef;
    let contentId = id;
    let createdAt = now;
    
    // Si un ID est fourni, c'est une mise à jour
    if (contentId) {
      // Vérifier si le contenu existe déjà
      const existingContent = await getContentById(contentId);
      if (existingContent) {
        createdAt = existingContent.createdAt;
      }
      contentRef = ref(database, `${CONTENT_PATH}/${contentId}`);
    } else {
      // Nouvelle entrée, générer un ID
      contentRef = push(ref(database, CONTENT_PATH));
      contentId = contentRef.key || '';
    }
    
    const contentToSave = {
      ...content,
      createdAt,
      updatedAt: now,
    };
    
    await set(contentRef, contentToSave);
    
    return {
      id: contentId,
      ...contentToSave,
    } as Content;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Une erreur est survenue lors de la sauvegarde du contenu'
    );
  }
};

// Supprimer du contenu
export const deleteContent = async (id: string): Promise<boolean> => {
  try {
    const contentRef = ref(database, `${CONTENT_PATH}/${id}`);
    await remove(contentRef);
    return true;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : `Une erreur est survenue lors de la suppression du contenu (ID: ${id})`
    );
  }
};

// Rechercher du contenu
export const searchContent = async (searchTerm: string): Promise<Content[]> => {
  try {
    const allContent = await getAllContent();
    
    if (!searchTerm.trim()) {
      return allContent;
    }
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    return allContent.filter((content) => {
      return (
        content.title.toLowerCase().includes(normalizedSearch) ||
        content.description.toLowerCase().includes(normalizedSearch) ||
        (content.genres && content.genres.some(genre => 
          genre.toLowerCase().includes(normalizedSearch)
        )) ||
        (content.cast && content.cast.some(actor => 
          actor.toLowerCase().includes(normalizedSearch)
        )) ||
        (content.director && content.director.toLowerCase().includes(normalizedSearch))
      );
    });
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Une erreur est survenue lors de la recherche de contenu'
    );
  }
}; 
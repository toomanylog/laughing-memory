import { useState, useEffect } from 'react';
import { ref, get, query, orderByChild, push, set, remove, update, equalTo } from 'firebase/database';
import { db } from '../firebase.ts';
import { Content } from '../types/index.ts';

export function useContent() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer tous les contenus
  useEffect(() => {
    async function fetchContents() {
      setLoading(true);
      try {
        const contentsRef = ref(db, 'contents');
        const snapshot = await get(contentsRef);
        
        if (snapshot.exists()) {
          const contentsObj = snapshot.val();
          const contentsArray = Object.keys(contentsObj).map(key => ({
            id: key,
            ...contentsObj[key]
          }));
          setContents(contentsArray);
        } else {
          setContents([]);
        }
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des contenus:', err);
        setError('Erreur lors du chargement des contenus. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchContents();
  }, []);

  // Récupérer un contenu par ID
  const getContentById = async (contentId: string): Promise<Content | null> => {
    try {
      const contentRef = ref(db, `contents/${contentId}`);
      const snapshot = await get(contentRef);
      
      if (snapshot.exists()) {
        return { id: contentId, ...snapshot.val() } as Content;
      }
      return null;
    } catch (err) {
      console.error(`Erreur lors de la récupération du contenu ${contentId}:`, err);
      return null;
    }
  };

  // Récupérer les contenus par type (film ou série)
  const getContentsByType = async (type: 'movie' | 'series'): Promise<Content[]> => {
    try {
      const contentsByTypeRef = query(
        ref(db, 'contents'), 
        orderByChild('type'),
        equalTo(type)
      );
      const snapshot = await get(contentsByTypeRef);
      
      if (snapshot.exists()) {
        const contentsObj = snapshot.val();
        return Object.keys(contentsObj).map(key => ({
          id: key,
          ...contentsObj[key]
        }));
      }
      return [];
    } catch (err) {
      console.error(`Erreur lors de la récupération des contenus de type ${type}:`, err);
      return [];
    }
  };

  // Ajouter un nouveau contenu (pour l'admin)
  const addContent = async (content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
    try {
      const timestamp = Date.now();
      const newContentRef = push(ref(db, 'contents'));
      
      const contentWithTimestamps = {
        ...content,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      await set(newContentRef, contentWithTimestamps);
      return newContentRef.key;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du contenu:', err);
      return null;
    }
  };

  // Mettre à jour un contenu (pour l'admin)
  const updateContent = async (id: string, updates: Partial<Content>): Promise<boolean> => {
    try {
      const contentRef = ref(db, `contents/${id}`);
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: Date.now()
      };
      
      await update(contentRef, updatesWithTimestamp);
      return true;
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du contenu ${id}:`, err);
      return false;
    }
  };

  // Supprimer un contenu (pour l'admin)
  const deleteContent = async (id: string): Promise<boolean> => {
    try {
      const contentRef = ref(db, `contents/${id}`);
      await remove(contentRef);
      return true;
    } catch (err) {
      console.error(`Erreur lors de la suppression du contenu ${id}:`, err);
      return false;
    }
  };

  return { 
    contents, 
    loading, 
    error, 
    getContentById, 
    getContentsByType,
    addContent,
    updateContent,
    deleteContent
  };
} 
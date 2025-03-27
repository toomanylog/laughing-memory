import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, push, set, get, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../firebase.ts';
import { Content } from '../types/index.ts';

// Données de secours pour garantir un fonctionnement minimal même sans Firebase
const fallbackContent: Content[] = [
  {
    id: 'fallback-movie-1',
    title: 'Film de Secours',
    description: 'Ce film est affiché lorsque les données Firebase ne sont pas disponibles.',
    imageUrl: 'https://via.placeholder.com/500x750',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    type: 'movie',
    genre: ['Action', 'Démonstration'],
    releaseYear: 2023,
    duration: 120,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'fallback-series-1',
    title: 'Série de Secours',
    description: 'Cette série est affichée lorsque les données Firebase ne sont pas disponibles.',
    imageUrl: 'https://via.placeholder.com/500x750',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    type: 'series',
    genre: ['Comédie', 'Démonstration'],
    releaseYear: 2023,
    duration: 0,
    seasons: [
      {
        id: 'fallback-season-1',
        number: 1,
        episodes: [
          {
            id: 'fallback-episode-1',
            number: 1,
            title: 'Épisode 1',
            description: 'Épisode de démonstration.',
            duration: 30,
            videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
          }
        ]
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

// Cache pour stocker les résultats des requêtes
interface Cache {
  byId: Record<string, Content>;
  byType: Record<string, Content[]>;
  lastFetch: number;
  initialFetchDone: boolean;
}

export const useContent = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Référence au cache pour éviter les requêtes répétées
  const cacheRef = useRef<Cache>({
    byId: {},
    byType: {},
    lastFetch: 0,
    initialFetchDone: false
  });
  
  // Valider si le cache est encore frais
  const isCacheFresh = (type: 'byId' | 'byType', key?: string) => {
    // Si le chargement initial n'a pas encore été fait, ne pas utiliser le cache
    if (!cacheRef.current.initialFetchDone) {
      console.log("Chargement initial pas encore effectué, cache non utilisé");
      return false;
    }
    
    // Si le cache a moins de 15 secondes, l'utiliser
    const isFresh = (Date.now() - cacheRef.current.lastFetch) < 15000;
    
    // Vérifier que les données sont présentes dans le cache
    if (type === 'byId' && key) {
      return isFresh && !!cacheRef.current.byId[key];
    }
    
    if (type === 'byType' && key) {
      return isFresh && Array.isArray(cacheRef.current.byType[key]) && cacheRef.current.byType[key].length > 0;
    }
    
    return isFresh;
  };
  
  // Charger tous les contenus au montage du composant
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    console.log("useEffect de useContent exécuté - Chargement des contenus");
    
    async function fetchContents() {
      try {
        // Ajouter un timeout de 10 secondes pour éviter un chargement infini
        const timeoutPromise = new Promise<null>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error("Délai d'attente dépassé lors de la récupération des contenus"));
          }, 10000);
        });
        
        // Course entre la requête Firebase et le timeout
        console.log("Envoi de la requête à Firebase pour récupérer tous les contenus");
        const fetchPromise = get(ref(db, 'contents'));
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        
        // Annuler le timeout s'il n'a pas encore été déclenché
        clearTimeout(timeoutId);
        
        if (!isMounted) return;
        
        if (result && result.exists()) {
          const contentsObj = result.val();
          const contentsList = Object.keys(contentsObj).map(key => ({
            id: key,
            ...contentsObj[key]
          }));
          
          console.log('Contenus récupérés avec succès:', contentsList.length);
          
          // Mettre à jour le cache
          const newCache: Cache = {
            byId: {},
            byType: {},
            lastFetch: Date.now(),
            initialFetchDone: true
          };
          
          // Organiser les contenus par ID
          contentsList.forEach(content => {
            newCache.byId[content.id] = content;
          });
          
          // Organiser les contenus par type
          newCache.byType['movie'] = contentsList.filter(content => content.type === 'movie');
          newCache.byType['series'] = contentsList.filter(content => content.type === 'series');
          
          cacheRef.current = newCache;
          setContents(contentsList);
          setError(null);
        } else {
          console.warn('Aucun contenu trouvé dans Firebase, utilisation des données de secours');
          setContents(fallbackContent);
          
          // Marquer le chargement initial comme terminé
          cacheRef.current.initialFetchDone = true;
        }
      } catch (err) {
        if (!isMounted) return;
        
        console.error('Erreur lors de la récupération des contenus:', err);
        setError('Erreur lors du chargement des contenus');
        
        // Utiliser les données de secours en cas d'erreur
        console.warn('Utilisation des données de secours suite à une erreur');
        setContents(fallbackContent);
        
        // Marquer le chargement initial comme terminé
        cacheRef.current.initialFetchDone = true;
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchContents();
    
    // Nettoyage
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);
  
  // Récupérer un contenu par son ID (avec mémorisation)
  const getContentById = useCallback(async (id: string): Promise<Content | null> => {
    // Vérifier si la requête est dans le cache et que le cache est frais
    if (isCacheFresh('byId', id)) {
      console.log(`Contenu ${id} récupéré depuis le cache`);
      return cacheRef.current.byId[id];
    }
    
    try {
      console.log(`Tentative de récupération du contenu avec l'ID: ${id}`);
      
      // Vérifier dans les données de secours si l'ID correspond
      const fallbackItem = fallbackContent.find(item => item.id === id);
      
      // Si l'ID commence par "fallback-", utiliser directement les données de secours
      if (id.startsWith('fallback-') && fallbackItem) {
        console.log('Utilisation des données de secours pour:', id);
        return fallbackItem;
      }
      
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Délai d'attente dépassé pour la récupération du contenu ${id}`));
        }, 5000);
      });
      
      const fetchPromise = get(ref(db, `contents/${id}`));
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (result && result.exists()) {
        const contentData = {
          id,
          ...result.val()
        };
        
        console.log(`Contenu ${id} récupéré avec succès:`, contentData.title);
        
        // Mettre à jour le cache
        cacheRef.current.byId[id] = contentData;
        cacheRef.current.lastFetch = Date.now();
        cacheRef.current.initialFetchDone = true;
        
        return contentData;
      }
      
      console.warn(`Contenu avec l'ID ${id} non trouvé`);
      
      // Si pas trouvé, chercher dans les données de secours
      if (fallbackItem) {
        console.log('Utilisation des données de secours comme solution de repli');
        return fallbackItem;
      }
      
      return null;
    } catch (err) {
      console.error(`Erreur lors de la récupération du contenu ${id}:`, err);
      
      // En cas d'erreur, chercher dans les données de secours
      const fallbackItem = fallbackContent.find(item => item.id === id);
      if (fallbackItem) {
        console.log('Utilisation des données de secours après erreur');
        return fallbackItem;
      }
      
      return null;
    }
  }, []);
  
  // Récupérer les contenus par type (films ou séries) (avec mémorisation)
  const getContentsByType = useCallback(async (type: string): Promise<Content[]> => {
    // Vérifier si la requête est dans le cache et que le cache est frais
    if (isCacheFresh('byType', type)) {
      console.log(`Contenus de type ${type} récupérés depuis le cache`);
      return cacheRef.current.byType[type];
    }
    
    try {
      console.log(`Tentative de récupération des contenus de type: ${type}`);
      
      // Timeout pour éviter un chargement infini
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Délai d'attente dépassé pour la récupération des contenus de type ${type}`));
        }, 5000);
      });
      
      const fetchPromise = get(ref(db, 'contents'));
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (result && result.exists()) {
        const contentsObj = result.val();
        const filteredContents = Object.keys(contentsObj)
          .filter(key => contentsObj[key].type === type)
          .map(key => ({
            id: key,
            ...contentsObj[key]
          }));
          
        console.log(`${filteredContents.length} contenus de type ${type} récupérés`);
        
        // Mettre à jour le cache
        cacheRef.current.byType[type] = filteredContents;
        cacheRef.current.lastFetch = Date.now();
        cacheRef.current.initialFetchDone = true;
        
        return filteredContents;
      }
      
      console.warn(`Aucun contenu de type ${type} trouvé, utilisation des données de secours`);
      // Utiliser les données de secours du type demandé
      return fallbackContent.filter(item => item.type === type);
    } catch (err) {
      console.error(`Erreur lors de la récupération des contenus de type ${type}:`, err);
      
      // En cas d'erreur, utiliser les données de secours du type demandé
      console.warn('Utilisation des données de secours après erreur');
      return fallbackContent.filter(item => item.type === type);
    }
  }, []);

  // Ajouter un nouveau contenu (pour l'admin) (avec mémorisation)
  const addContent = useCallback(async (content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
    try {
      const timestamp = Date.now();
      const newContentRef = push(ref(db, 'contents'));
      
      const contentWithTimestamps = {
        ...content,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      await set(newContentRef, contentWithTimestamps);
      
      // Invalider le cache pour forcer un rechargement
      cacheRef.current.lastFetch = 0;
      cacheRef.current.initialFetchDone = false;
      
      return newContentRef.key;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du contenu:', err);
      return null;
    }
  }, []);

  // Mettre à jour un contenu (pour l'admin) (avec mémorisation)
  const updateContent = useCallback(async (id: string, updates: Partial<Content>): Promise<boolean> => {
    try {
      const contentRef = ref(db, `contents/${id}`);
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: Date.now()
      };
      
      await update(contentRef, updatesWithTimestamp);
      
      // Invalider le cache pour forcer un rechargement
      cacheRef.current.lastFetch = 0;
      cacheRef.current.initialFetchDone = false;
      
      return true;
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du contenu ${id}:`, err);
      return false;
    }
  }, []);

  // Supprimer un contenu (pour l'admin) (avec mémorisation)
  const deleteContent = useCallback(async (id: string): Promise<boolean> => {
    try {
      const contentRef = ref(db, `contents/${id}`);
      await remove(contentRef);
      
      // Invalider le cache pour forcer un rechargement
      cacheRef.current.lastFetch = 0;
      cacheRef.current.initialFetchDone = false;
      
      return true;
    } catch (err) {
      console.error(`Erreur lors de la suppression du contenu ${id}:`, err);
      return false;
    }
  }, []);

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
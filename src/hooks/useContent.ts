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
        title: 'Saison 1',
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
  },
  {
    id: 'fallback-anime-1',
    title: 'Anime de Secours',
    description: 'Cet anime est affiché lorsque les données Firebase ne sont pas disponibles.',
    imageUrl: 'https://via.placeholder.com/500x750',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    type: 'anime',
    genre: ['Action', 'Fantaisie'],
    releaseYear: 2023,
    duration: 0,
    seasons: [
      {
        id: 'fallback-anime-season-1',
        number: 1,
        title: 'Saison 1',
        episodes: [
          {
            id: 'fallback-anime-episode-1',
            number: 1,
            title: 'Épisode 1',
            description: 'Épisode de démonstration pour anime.',
            duration: 24,
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
  fetchInProgress: boolean;
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
    initialFetchDone: false,
    fetchInProgress: false
  });
  
  // Valider si le cache est encore frais
  const isCacheFresh = (type: 'byId' | 'byType', key?: string) => {
    // Si une requête est déjà en cours, utiliser le cache existant
    if (cacheRef.current.fetchInProgress) {
      return true;
    }
    
    // Si le chargement initial n'a pas encore été fait, ne pas utiliser le cache
    if (!cacheRef.current.initialFetchDone) {
      console.log("Chargement initial pas encore effectué, cache non utilisé");
      return false;
    }
    
    // Si le cache a moins de 30 secondes, l'utiliser
    const isFresh = (Date.now() - cacheRef.current.lastFetch) < 30000;
    
    // Vérifier que les données sont présentes dans le cache
    if (type === 'byId' && key) {
      return isFresh && !!cacheRef.current.byId[key];
    }
    
    if (type === 'byType' && key) {
      return isFresh && Array.isArray(cacheRef.current.byType[key]);
    }
    
    return isFresh;
  };
  
  // Charger tous les contenus au montage du composant
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    console.log("useEffect de useContent exécuté - Chargement des contenus");
    
    // Si une requête est déjà en cours, ne pas en lancer une nouvelle
    if (cacheRef.current.fetchInProgress) {
      console.log("Une requête de récupération est déjà en cours, attente...");
      return;
    }
    
    // Si le cache est frais, ne pas recharger les données
    if (cacheRef.current.initialFetchDone && isCacheFresh('byType')) {
      console.log("Utilisation du cache pour les contenus (cache récent)");
      setLoading(false);
      return;
    }
    
    async function fetchContents() {
      // Marquer qu'une requête est en cours
      cacheRef.current.fetchInProgress = true;
      setLoading(true);
      
      try {
        // Ajouter un timeout de 8 secondes pour éviter un chargement infini
        const timeoutPromise = new Promise<null>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error("Délai d'attente dépassé lors de la récupération des contenus"));
          }, 8000);
        });
        
        // Course entre la requête Firebase et le timeout
        console.log("Envoi de la requête à Firebase pour récupérer tous les contenus");
        const fetchPromise = get(ref(db, 'contents'));
        const result = await Promise.race([fetchPromise, timeoutPromise]) as any;
        
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
            initialFetchDone: true,
            fetchInProgress: false
          };
          
          // Organiser les contenus par ID
          contentsList.forEach(content => {
            newCache.byId[content.id] = content;
          });
          
          // Organiser les contenus par type
          newCache.byType['movie'] = contentsList.filter(content => content.type === 'movie');
          newCache.byType['series'] = contentsList.filter(content => content.type === 'series');
          newCache.byType['anime'] = contentsList.filter(content => content.type === 'anime');
          
          cacheRef.current = newCache;
          setContents(contentsList);
          setError(null);
        } else {
          console.warn('Aucun contenu trouvé dans Firebase, utilisation des données de secours');
          setContents(fallbackContent);
          
          // Marquer le chargement initial comme terminé
          cacheRef.current.initialFetchDone = true;
          cacheRef.current.fetchInProgress = false;
          cacheRef.current.lastFetch = Date.now();
          
          // Ajouter les contenus de secours au cache
          fallbackContent.forEach(content => {
            cacheRef.current.byId[content.id] = content;
          });
          
          cacheRef.current.byType['movie'] = fallbackContent.filter(content => content.type === 'movie');
          cacheRef.current.byType['series'] = fallbackContent.filter(content => content.type === 'series');
          cacheRef.current.byType['anime'] = fallbackContent.filter(content => content.type === 'anime');
        }
      } catch (err) {
        if (!isMounted) return;
        
        console.error('Erreur lors de la récupération des contenus:', err);
        setError('Erreur lors du chargement des contenus');
        
        // Utiliser les données de secours en cas d'erreur
        console.warn('Utilisation des données de secours suite à une erreur');
        setContents(fallbackContent);
        
        // Marquer le chargement initial comme terminé et la requête comme terminée
        cacheRef.current.initialFetchDone = true;
        cacheRef.current.fetchInProgress = false;
        cacheRef.current.lastFetch = Date.now();
        
        // Ajouter les contenus de secours au cache
        fallbackContent.forEach(content => {
          cacheRef.current.byId[content.id] = content;
        });
        
        cacheRef.current.byType['movie'] = fallbackContent.filter(content => content.type === 'movie');
        cacheRef.current.byType['series'] = fallbackContent.filter(content => content.type === 'series');
        cacheRef.current.byType['anime'] = fallbackContent.filter(content => content.type === 'anime');
      } finally {
        if (isMounted) {
          setLoading(false);
          cacheRef.current.fetchInProgress = false;
        }
      }
    }
    
    fetchContents();
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Récupérer un contenu par son ID
  const getContentById = useCallback(async (contentId: string): Promise<Content | null> => {
    // Vérifier le cache d'abord
    if (isCacheFresh('byId', contentId)) {
      console.log(`Contenu ${contentId} récupéré depuis le cache`);
      return cacheRef.current.byId[contentId] || null;
    }
    
    console.log(`Tentative de récupération du contenu avec l'ID: ${contentId}`);
    
    try {
      const snapshot = await get(ref(db, `contents/${contentId}`));
      
      if (snapshot.exists()) {
        const content = { 
          id: contentId, 
          ...snapshot.val() 
        } as Content;
        
        // Mettre à jour le cache
        cacheRef.current.byId[contentId] = content;
        
        console.log(`Contenu ${contentId} récupéré avec succès: ${content.title}`);
        return content;
      } else {
        console.warn(`Aucun contenu trouvé avec l'ID: ${contentId}`);
        return null;
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération du contenu ${contentId}:`, error);
      
      // Vérifier si nous avons ce contenu dans le cache en dernier recours
      if (cacheRef.current.byId[contentId]) {
        console.log(`Utilisation du contenu ${contentId} depuis le cache malgré l'erreur`);
        return cacheRef.current.byId[contentId];
      }
      
      // Vérifier dans les contenus de secours
      const fallbackItem = fallbackContent.find(item => item.id === contentId);
      if (fallbackItem) {
        return fallbackItem;
      }
      
      return null;
    }
  }, []);
  
  // Récupérer tous les contenus d'un type spécifique
  const getContentsByType = useCallback(async (type: 'movie' | 'series' | 'anime'): Promise<Content[]> => {
    // Vérifier le cache d'abord
    if (isCacheFresh('byType', type)) {
      console.log(`Contenus de type ${type} récupérés depuis le cache`);
      return cacheRef.current.byType[type] || [];
    }
    
    console.log(`Tentative de récupération des contenus de type: ${type}`);
    
    // Définir un timeout pour éviter un chargement infini
    const timeoutPromise = new Promise<Content[]>((resolve) => {
      setTimeout(() => {
        console.warn(`Délai d'attente dépassé pour les contenus de type ${type}, utilisation des données de secours`);
        const fallbackItems = fallbackContent.filter(item => item.type === type);
        resolve(fallbackItems);
      }, 5000);
    });
    
    try {
      // Essayer de récupérer tous les contenus existants d'abord (si pas déjà chargés)
      if (!cacheRef.current.initialFetchDone) {
        // Utiliser Promise.race pour limiter le temps d'attente
        const fetchPromise = (async () => {
          const snapshot = await get(ref(db, 'contents'));
          
          if (snapshot.exists()) {
            const contentsObj = snapshot.val();
            const allContents = Object.keys(contentsObj).map(key => ({
              id: key,
              ...contentsObj[key]
            })) as Content[];
            
            // Mettre à jour le cache
            allContents.forEach(content => {
              cacheRef.current.byId[content.id] = content;
            });
            
            // Trier par type
            cacheRef.current.byType['movie'] = allContents.filter(content => content.type === 'movie');
            cacheRef.current.byType['series'] = allContents.filter(content => content.type === 'series');
            cacheRef.current.byType['anime'] = allContents.filter(content => content.type === 'anime');
            
            cacheRef.current.initialFetchDone = true;
            cacheRef.current.lastFetch = Date.now();
            
            console.log(`${cacheRef.current.byType[type].length} contenus de type ${type} récupérés`);
            return cacheRef.current.byType[type];
          }
          
          // Si aucun contenu, renvoyer les données de secours
          throw new Error('Aucun contenu trouvé');
        })();
        
        // Utiliser Promise.race pour éviter un chargement infini
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        return result;
      } else {
        // Utiliser Promise.race pour limiter le temps d'attente
        const fetchPromise = (async () => {
          // Utiliser une requête filtrée par type
          const contentsByTypeQuery = query(
            ref(db, 'contents'),
            orderByChild('type'),
            equalTo(type)
          );
          
          const snapshot = await get(contentsByTypeQuery);
          
          if (snapshot.exists()) {
            const contentsObj = snapshot.val();
            const contentsList = Object.keys(contentsObj).map(key => ({
              id: key,
              ...contentsObj[key]
            })) as Content[];
            
            // Mettre à jour le cache
            contentsList.forEach(content => {
              cacheRef.current.byId[content.id] = content;
            });
            
            cacheRef.current.byType[type] = contentsList;
            cacheRef.current.lastFetch = Date.now();
            
            console.log(`${contentsList.length} contenus de type ${type} récupérés`);
            return contentsList;
          } else {
            console.warn(`Aucun contenu de type ${type} trouvé`);
            // Si aucun contenu, utiliser des fallbacks
            const fallbackItems = fallbackContent.filter(item => item.type === type);
            cacheRef.current.byType[type] = fallbackItems;
            return fallbackItems;
          }
        })();
        
        // Utiliser Promise.race pour éviter un chargement infini
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        return result;
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des contenus de type ${type}:`, error);
      
      // Si le cache contient déjà des données pour ce type, les utiliser
      if (cacheRef.current.byType[type] && cacheRef.current.byType[type].length > 0) {
        console.log(`Utilisation des contenus de type ${type} depuis le cache malgré l'erreur`);
        return cacheRef.current.byType[type];
      }
      
      // Sinon, utiliser des données de secours
      const fallbackItems = fallbackContent.filter(item => item.type === type);
      cacheRef.current.byType[type] = fallbackItems;
      return fallbackItems;
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
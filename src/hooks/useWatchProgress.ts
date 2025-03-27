import { useState, useEffect, useCallback } from 'react';
import { ref, set, get } from 'firebase/database';
import { db } from '../firebase.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { UserProgress, Content, Episode } from '../types/index.ts';

// Clé pour stocker la progression localement
const LOCAL_STORAGE_KEY = 'watch-progress';

// Interface pour le stockage local
interface LocalProgress {
  contentId: string;
  progress: number;
  lastWatchedAt: number;
  episodeId?: string;
  seasonId?: string;
}

// Version avec tous les paramètres (pour rétrocompatibilité)
export function useWatchProgress(content?: Content, episode?: Episode, seasonId?: string) {
  const { currentUser, userData } = useAuth();
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Récupérer la progression depuis Firebase ou stockage local
  useEffect(() => {
    if (!content) {
      setLoading(false);
      return;
    }

    async function loadProgress() {
      setLoading(true);
      
      try {
        // S'assurer que content est défini avant d'utiliser content.id
        if (content && content.id) {
          const progressValue = await fetchProgress(content.id, seasonId, episode?.id);
          if (progressValue !== null) {
            setProgress(progressValue);
          } else {
            setProgress(0);
          }
        } else {
          setProgress(0);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la progression:', error);
        setProgress(0);
      } finally {
        setLoading(false);
      }
    }
    
    loadProgress();
  }, [content, currentUser, userData, episode, seasonId]);

  // Fonction pour récupérer la progression
  const fetchProgress = useCallback(async (contentId: string, seasonId?: string, episodeId?: string): Promise<number | null> => {
    if (currentUser && userData) {
      // Utilisateur connecté - récupérer depuis Firebase
      try {
        const progressRef = ref(db, `progress/${currentUser.uid}/${contentId}`);
        const snapshot = await get(progressRef);
        
        if (snapshot.exists()) {
          const userProgress = snapshot.val() as UserProgress;
          
          // Vérifier si on regarde le même épisode (pour les séries)
          if (episodeId) {
            if (userProgress.episodeId === episodeId) {
              return userProgress.progress;
            } else {
              return 0; // Nouvel épisode
            }
          } else {
            return userProgress.progress;
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la progression:', error);
      }
    } else {
      // Utilisateur non connecté - utiliser stockage local
      const localProgressJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      
      if (localProgressJSON) {
        try {
          const localProgressData = JSON.parse(localProgressJSON) as Record<string, LocalProgress>;
          
          // Vérifier si nous avons une entrée pour ce contenu
          const contentKey = episodeId 
            ? `${contentId}-${seasonId}-${episodeId}` 
            : contentId;
            
          if (localProgressData[contentKey]) {
            return localProgressData[contentKey].progress;
          }
        } catch (error) {
          console.error('Erreur lors du parsing de la progression locale:', error);
        }
      }
    }
    
    return null;
  }, [currentUser, userData]);

  // Fonction pour récupérer la progression (version externe)
  const getProgress = useCallback(async (contentId: string, seasonId?: string, episodeId?: string): Promise<number> => {
    const progressValue = await fetchProgress(contentId, seasonId, episodeId);
    return progressValue ?? 0;
  }, [fetchProgress]);

  // Enregistrer la progression
  const saveProgress = useCallback(async (contentId: string, newProgress: number, seasonId?: string, episodeId?: string) => {
    // Si on utilise l'ancienne API avec le contenu passé au hook
    if (content && contentId === content.id) {
      setProgress(newProgress);
    }
    
    if (currentUser) {
      // Enregistrer dans Firebase
      try {
        const progressData: UserProgress = {
          userId: currentUser.uid,
          contentId: contentId,
          progress: newProgress,
          lastWatchedAt: Date.now(),
          episodeId: episodeId || episode?.id,
          seasonId: seasonId || (content?.type === 'series' ? seasonId : undefined)
        };
        
        await set(ref(db, `progress/${currentUser.uid}/${contentId}`), progressData);
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la progression:', error);
      }
    } else {
      // Enregistrer localement
      try {
        const localProgressJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
        const localProgressData: Record<string, LocalProgress> = localProgressJSON 
          ? JSON.parse(localProgressJSON) 
          : {};
          
        const contentKey = episodeId 
          ? `${contentId}-${seasonId}-${episodeId}` 
          : contentId;
          
        localProgressData[contentKey] = {
          contentId: contentId,
          progress: newProgress,
          lastWatchedAt: Date.now(),
          episodeId: episodeId || episode?.id,
          seasonId: seasonId
        };
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localProgressData));
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement local de la progression:', error);
      }
    }
  }, [currentUser, content, episode]);

  // Pour la rétrocompatibilité - fonction qui prend seulement le nouveau progrès
  const legacySaveProgress = useCallback((newProgress: number) => {
    if (content) {
      saveProgress(content.id, newProgress, seasonId, episode?.id);
    } else {
      console.error('Tentative de sauvegarde de progression sans contenu spécifié');
    }
  }, [content, saveProgress, seasonId, episode]);

  return { 
    progress, 
    saveProgress: content ? legacySaveProgress : saveProgress, 
    getProgress,
    loading 
  };
} 
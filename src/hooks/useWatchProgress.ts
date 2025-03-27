import { useState, useEffect, useCallback } from 'react';
import { ref, set, get } from 'firebase/database';
import { db } from '../firebase.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { UserProgress } from '../types/index.ts';

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

/**
 * Hook pour gérer la progression du visionnage
 */
export function useWatchProgress(contentId?: string, seasonId?: string, episodeId?: string) {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Fonction pour récupérer la progression
  const fetchProgress = useCallback(async (cId: string, sId?: string, eId?: string): Promise<number | null> => {
    if (currentUser) {
      // Utilisateur connecté - récupérer depuis Firebase
      try {
        const progressRef = ref(db, `progress/${currentUser.uid}/${cId}`);
        const snapshot = await get(progressRef);
        
        if (snapshot.exists()) {
          const userProgress = snapshot.val() as UserProgress;
          
          // Vérifier si on regarde le même épisode (pour les séries)
          if (eId) {
            if (userProgress.episodeId === eId) {
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
          const contentKey = eId 
            ? `${cId}-${sId}-${eId}` 
            : cId;
            
          if (localProgressData[contentKey]) {
            return localProgressData[contentKey].progress;
          }
        } catch (error) {
          console.error('Erreur lors du parsing de la progression locale:', error);
        }
      }
    }
    
    return null;
  }, [currentUser]);

  // Récupérer la progression depuis Firebase ou stockage local
  useEffect(() => {
    if (!contentId) {
      setLoading(false);
      return;
    }

    async function loadProgress() {
      setLoading(true);
      
      try {
        if (contentId) {
          const progressValue = await fetchProgress(contentId, seasonId, episodeId);
          if (progressValue !== null) {
            setProgress(progressValue);
          } else {
            setProgress(0);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la progression:', error);
        setProgress(0);
      } finally {
        setLoading(false);
      }
    }
    
    loadProgress();
  }, [contentId, currentUser, seasonId, episodeId, fetchProgress]);

  // Fonction pour récupérer la progression (version externe)
  const getProgress = useCallback(async (cId: string, sId?: string, eId?: string): Promise<number> => {
    const progressValue = await fetchProgress(cId, sId, eId);
    return progressValue ?? 0;
  }, [fetchProgress]);

  // Enregistrer la progression
  const saveProgress = useCallback((newProgress: number) => {
    // Si aucun ID de contenu, on ne peut pas sauvegarder
    if (!contentId) {
      console.error('Tentative de sauvegarde de progression sans ID de contenu spécifié');
      return;
    }
    
    setProgress(newProgress);
    
    if (currentUser) {
      // Enregistrer dans Firebase
      try {
        const progressData: UserProgress = {
          userId: currentUser.uid,
          contentId: contentId,
          progress: newProgress,
          lastWatchedAt: Date.now(),
          episodeId: episodeId,
          seasonId: seasonId
        };
        
        set(ref(db, `progress/${currentUser.uid}/${contentId}`), progressData)
          .catch(error => {
            console.error('Erreur lors de l\'enregistrement de la progression:', error);
          });
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
          episodeId: episodeId,
          seasonId: seasonId
        };
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localProgressData));
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement local de la progression:', error);
      }
    }
  }, [currentUser, contentId, seasonId, episodeId]);

  return { 
    progress, 
    saveProgress, 
    getProgress,
    loading 
  };
} 
import { useState, useEffect } from 'react';
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

export function useWatchProgress(content: Content, episode?: Episode, seasonId?: string) {
  const { currentUser, userData } = useAuth();
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Récupérer la progression depuis Firebase ou stockage local
  useEffect(() => {
    async function getProgress() {
      setLoading(true);
      
      if (currentUser && userData) {
        // Utilisateur connecté - récupérer depuis Firebase
        try {
          const progressRef = ref(db, `progress/${currentUser.uid}/${content.id}`);
          const snapshot = await get(progressRef);
          
          if (snapshot.exists()) {
            const userProgress = snapshot.val() as UserProgress;
            
            // Vérifier si on regarde le même épisode (pour les séries)
            if (content.type === 'series' && episode) {
              if (userProgress.episodeId === episode.id) {
                setProgress(userProgress.progress);
              } else {
                setProgress(0); // Nouvel épisode
              }
            } else {
              setProgress(userProgress.progress);
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
            const contentKey = episode 
              ? `${content.id}-${seasonId}-${episode.id}` 
              : content.id;
              
            if (localProgressData[contentKey]) {
              setProgress(localProgressData[contentKey].progress);
            }
          } catch (error) {
            console.error('Erreur lors du parsing de la progression locale:', error);
          }
        }
      }
      
      setLoading(false);
    }
    
    getProgress();
  }, [content.id, currentUser, userData, episode, seasonId]);

  // Enregistrer la progression
  const saveProgress = async (newProgress: number) => {
    setProgress(newProgress);
    
    if (currentUser) {
      // Enregistrer dans Firebase
      try {
        const progressData: UserProgress = {
          userId: currentUser.uid,
          contentId: content.id,
          progress: newProgress,
          lastWatchedAt: Date.now(),
          episodeId: episode?.id,
          seasonId: seasonId
        };
        
        await set(ref(db, `progress/${currentUser.uid}/${content.id}`), progressData);
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
          
        const contentKey = episode 
          ? `${content.id}-${seasonId}-${episode.id}` 
          : content.id;
          
        localProgressData[contentKey] = {
          contentId: content.id,
          progress: newProgress,
          lastWatchedAt: Date.now(),
          episodeId: episode?.id,
          seasonId: seasonId
        };
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localProgressData));
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement local de la progression:', error);
      }
    }
  };

  return { progress, saveProgress, loading };
} 
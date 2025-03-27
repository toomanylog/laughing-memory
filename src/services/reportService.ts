import { ref, push, set, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { db } from '../firebase.ts';
import { VideoReport } from '../types/index.ts';
import { v4 as uuidv4 } from 'uuid';

/**
 * Enregistrer un nouveau signalement de source vidéo
 */
export const reportVideoSource = async (
  contentId: string,
  sourceId: string,
  userId: string,
  reason: string = "Lien non fonctionnel"
): Promise<string | null> => {
  try {
    // Créer un nouvel ID pour le signalement
    const reportRef = push(ref(db, 'reports'));
    const reportId = reportRef.key;
    
    if (!reportId) {
      throw new Error("Impossible de générer un ID pour le signalement");
    }
    
    // Mettre à jour le compteur de signalements sur la source
    await incrementReportCounter(contentId, sourceId);
    
    // Créer le signalement
    const report: VideoReport = {
      id: reportId,
      contentId,
      sourceId,
      userId,
      reason,
      status: 'pending',
      createdAt: Date.now(),
    };
    
    // Enregistrer le signalement dans Firebase
    await set(reportRef, report);
    
    console.log(`Signalement ${reportId} créé pour la source ${sourceId}`);
    return reportId;
  } catch (error) {
    console.error("Erreur lors de la création du signalement:", error);
    return null;
  }
};

/**
 * Incrémenter le compteur de signalements pour une source
 */
export const incrementReportCounter = async (contentId: string, sourceId: string): Promise<boolean> => {
  try {
    // Rechercher d'abord le contenu
    const contentRef = ref(db, `contents/${contentId}`);
    const contentSnapshot = await get(contentRef);
    
    if (!contentSnapshot.exists()) {
      console.error("Contenu introuvable:", contentId);
      return false;
    }
    
    const content = contentSnapshot.val();
    
    // Si le contenu est un film
    if (content.videoSources) {
      const sourceIndex = content.videoSources.findIndex((source: any) => source.id === sourceId);
      if (sourceIndex >= 0) {
        // Mettre à jour le compteur de signalements
        const currentCount = content.videoSources[sourceIndex].reportCount || 0;
        await update(ref(db, `contents/${contentId}/videoSources/${sourceIndex}`), {
          reportCount: currentCount + 1
        });
        
        // Si plus de 3 signalements, marquer la source comme non fonctionnelle
        if (currentCount + 1 >= 3) {
          await update(ref(db, `contents/${contentId}/videoSources/${sourceIndex}`), {
            isWorking: false
          });
        }
        
        return true;
      }
    }
    
    // Si le contenu est une série, chercher dans les épisodes
    if (content.seasons) {
      for (const season of content.seasons) {
        for (const episode of season.episodes) {
          if (episode.videoSources) {
            const sourceIndex = episode.videoSources.findIndex((source: any) => source.id === sourceId);
            if (sourceIndex >= 0) {
              // Mettre à jour le compteur de signalements
              const currentCount = episode.videoSources[sourceIndex].reportCount || 0;
              await update(ref(db, `contents/${contentId}/seasons/${season.id}/episodes/${episode.id}/videoSources/${sourceIndex}`), {
                reportCount: currentCount + 1
              });
              
              // Si plus de 3 signalements, marquer la source comme non fonctionnelle
              if (currentCount + 1 >= 3) {
                await update(ref(db, `contents/${contentId}/seasons/${season.id}/episodes/${episode.id}/videoSources/${sourceIndex}`), {
                  isWorking: false
                });
              }
              
              return true;
            }
          }
        }
      }
    }
    
    console.error("Source vidéo introuvable:", sourceId);
    return false;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du compteur de signalements:", error);
    return false;
  }
};

/**
 * Récupérer les signalements en attente
 */
export const getPendingReports = async (): Promise<VideoReport[]> => {
  try {
    const reportsQuery = query(
      ref(db, 'reports'),
      orderByChild('status'),
      equalTo('pending')
    );
    
    const snapshot = await get(reportsQuery);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const reports: VideoReport[] = [];
    snapshot.forEach((childSnapshot) => {
      reports.push(childSnapshot.val() as VideoReport);
    });
    
    return reports;
  } catch (error) {
    console.error("Erreur lors de la récupération des signalements:", error);
    return [];
  }
};

/**
 * Marquer un signalement comme traité
 */
export const resolveReport = async (reportId: string, resolution: string = "Corrigé"): Promise<boolean> => {
  try {
    await update(ref(db, `reports/${reportId}`), {
      status: 'resolved',
      resolution,
      resolvedAt: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la résolution du signalement:", error);
    return false;
  }
};

/**
 * Marquer un signalement comme révisé (sans être résolu)
 */
export const reviewReport = async (reportId: string): Promise<boolean> => {
  try {
    await update(ref(db, `reports/${reportId}`), {
      status: 'reviewed'
    });
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la révision du signalement:", error);
    return false;
  }
};

/**
 * Service pour signaler et gérer les sources vidéo défectueuses
 */
export const reportService = {
  /**
   * Signaler une source vidéo défectueuse
   * @param contentId ID du contenu
   * @param sourceId ID de la source vidéo
   * @param userId ID de l'utilisateur (si connecté)
   * @param reason Raison du signalement
   * @returns L'ID du rapport créé
   */
  async reportVideoSource(contentId: string, sourceId: string, userId: string = 'anonymous', reason: string): Promise<string> {
    try {
      // Vérifier si un rapport similaire existe déjà
      const existingReport = await this.checkExistingReport(contentId, sourceId, userId);
      
      if (existingReport) {
        return existingReport;
      }
      
      // Création d'un nouveau rapport
      const reportId = uuidv4();
      const report: VideoReport = {
        id: reportId,
        contentId,
        sourceId,
        userId,
        reason,
        status: 'pending',
        createdAt: Date.now()
      };
      
      // Enregistrer le rapport dans la base de données
      const reportsRef = ref(db, 'reports');
      await push(reportsRef, report);
      
      // Mettre à jour le compteur de signalements de la source
      const contentRef = ref(db, `content/${contentId}`);
      const contentSnapshot = await get(contentRef);
      
      if (contentSnapshot.exists()) {
        const content = contentSnapshot.val();
        
        // Mettre à jour les sources vidéo
        if (content.videoSources) {
          const updatedSources = content.videoSources.map((source: any) => {
            if (source.id === sourceId) {
              return {
                ...source,
                reportCount: (source.reportCount || 0) + 1,
                isWorking: false
              };
            }
            return source;
          });
          
          await update(contentRef, { videoSources: updatedSources });
        }
      }
      
      return reportId;
    } catch (error) {
      console.error('Erreur lors du signalement de la source vidéo:', error);
      throw error;
    }
  },
  
  /**
   * Vérifier si un rapport similaire existe déjà
   * @param contentId ID du contenu
   * @param sourceId ID de la source vidéo
   * @param userId ID de l'utilisateur
   * @returns L'ID du rapport existant, sinon null
   */
  async checkExistingReport(contentId: string, sourceId: string, userId: string): Promise<string | null> {
    try {
      const reportsRef = ref(db, 'reports');
      const userReportsQuery = query(
        reportsRef,
        orderByChild('userId'),
        equalTo(userId)
      );
      
      const snapshot = await get(userReportsQuery);
      
      if (snapshot.exists()) {
        const reports = snapshot.val();
        
        for (const key in reports) {
          const report = reports[key];
          
          if (report.contentId === contentId && report.sourceId === sourceId) {
            return report.id;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la vérification des rapports existants:', error);
      return null;
    }
  },
  
  /**
   * Obtenir tous les rapports pour un contenu spécifique
   * @param contentId ID du contenu
   * @returns Liste des rapports
   */
  async getReportsByContent(contentId: string): Promise<VideoReport[]> {
    try {
      const reportsRef = ref(db, 'reports');
      const contentReportsQuery = query(
        reportsRef,
        orderByChild('contentId'),
        equalTo(contentId)
      );
      
      const snapshot = await get(contentReportsQuery);
      
      if (snapshot.exists()) {
        const reports = snapshot.val();
        return Object.values(reports);
      }
      
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports:', error);
      return [];
    }
  }
}; 
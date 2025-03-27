export interface Content {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: 'series' | 'movie' | 'anime';
  genre: string[];
  releaseYear: number;
  videoUrl?: string;
  videoSources?: VideoSource[];
  duration?: number;
  seasons?: Season[];
  featuredId?: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Source vidéo pour un contenu ou un épisode
 */
export interface VideoSource {
  id: string;
  provider: string;     // Nom du fournisseur (e.g. "Mail.ru", "VK", "YouTube")
  embedUrl: string;     // URL d'intégration iframe
  quality?: string;     // Qualité de la vidéo (HD, 720p, etc.)
  isWorking?: boolean;  // Si la source fonctionne toujours
  reportCount?: number; // Nombre de signalements reçus
}

/**
 * Signalement de source vidéo
 */
export interface VideoReport {
  id: string;
  contentId: string;
  sourceId: string;
  userId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: number;
  resolution?: string;
  resolvedAt?: number;
}

export interface Season {
  id: string;
  title: string;
  number: number;      // Numéro de la saison
  episodes: Episode[];
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  number: number;      // Numéro de l'épisode
  duration?: number;
  videoUrl?: string;         // Ancien champ, maintenu pour compatibilité
  videoSources?: VideoSource[]; // Nouveau champ pour les sources multiples
  thumbnail?: string;
}

export interface UserProgress {
  userId: string;
  contentId: string;
  progress: number; // Pourcentage de visionnage (0-100)
  lastWatchedAt: number;
  episodeId?: string; // Pour les séries
  seasonId?: string; // Pour les séries
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
  history: UserProgress[];
  role?: 'user' | 'admin'; // Rôle de l'utilisateur
} 
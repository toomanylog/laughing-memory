// Types utilisateur
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Types pour le contenu (films et séries)
export interface Episode {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  releaseDate?: string;
}

export interface Content {
  id: string;
  title: string;
  type: 'movie' | 'series';
  description: string;
  posterUrl: string;
  backdropUrl?: string;
  year: number;
  genres?: string[];
  rating?: number;
  duration?: number; // en minutes
  videoUrl?: string; // Uniquement pour les films
  episodes?: Episode[]; // Uniquement pour les séries
  cast?: string[];
  director?: string;
  createdAt: string;
  updatedAt?: string;
}

// Types pour les watchlists et l'historique
export interface WatchlistItem {
  contentId: string;
  addedAt: string;
}

export interface ProgressItem {
  contentId: string;
  episodeId?: string; // Pour les séries
  position: number; // Position en secondes
  duration: number; // Durée totale en secondes
  percentage: number; // Pourcentage de visionnage
  lastWatchedAt: string;
}

// Types pour les préférences utilisateur
export interface UserPreferences {
  theme: 'light' | 'dark';
  subtitles: boolean;
  quality: 'auto' | '480p' | '720p' | '1080p' | '4k';
  notifications: boolean;
}

// Types pour les états des requêtes
export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

export interface QueryState<T> {
  data: T | null;
  status: QueryStatus;
  error: string | null;
} 
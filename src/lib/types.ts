// Types pour les utilisateurs
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin?: boolean;
  createdAt: number;
}

// Types pour l'historique de visionnage
export interface WatchHistory {
  contentId: string;
  timestamp: number;
  progress: number; // Pourcentage de visionnage (0-100)
  completed: boolean;
}

// Types pour le contenu (films/séries)
export interface MediaContent {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl?: string;
  trailerUrl?: string;
  videoUrl?: string; // URL vidéo pour les films
  type: 'movie' | 'series';
  releaseYear: number;
  genres: string[];
  duration?: number; // En minutes pour les films
  createdAt: number;
  updatedAt: number;
  progress?: number; // Pourcentage de visionnage (0-100)
}

// Types spécifiques pour les séries
export interface Series extends MediaContent {
  type: 'series';
  seasons: Season[];
}

export interface Season {
  number: number;
  title: string;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  thumbnailUrl?: string;
  duration: number; // En minutes
  videoUrl: string;
}

// Types spécifiques pour les films
export interface Movie extends MediaContent {
  type: 'movie';
  videoUrl: string;
} 
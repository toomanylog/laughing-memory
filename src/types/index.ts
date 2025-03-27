export interface Content {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  type: 'movie' | 'series';
  releaseYear: number;
  genre: string[];
  duration?: number; // Pour les films
  seasons?: Season[]; // Pour les séries
  createdAt: number;
  updatedAt: number;
}

export interface Season {
  id: string;
  number: number;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  title: string;
  number: number;
  description: string;
  imageUrl?: string;
  videoUrl: string;
  duration: number;
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
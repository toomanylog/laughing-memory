import { VideoSource } from "../types";
import { v4 as uuidv4 } from 'uuid';

/**
 * Détecte les URL vidéo et les convertit en sources d'embed
 * @param input String contenant potentiellement des URL vidéo
 * @returns Array de sources vidéo
 */
export function parseVideoSources(input: string): VideoSource[] {
  if (!input) return [];
  
  const sources: VideoSource[] = [];
  const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  for (const line of lines) {
    // Détecter si la ligne commence par @ (formatage spécial)
    if (line.startsWith('@')) {
      const url = line.substring(1).trim();
      const source = createSourceFromUrl(url);
      if (source) {
        sources.push(source);
      }
    } else if (isValidUrl(line)) {
      // Si c'est une URL standard
      const source = createSourceFromUrl(line);
      if (source) {
        sources.push(source);
      }
    }
  }
  
  return sources;
}

/**
 * Vérifie si une chaîne est une URL valide
 */
function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Crée une source vidéo à partir d'une URL
 */
function createSourceFromUrl(url: string): VideoSource | null {
  try {
    const parsedUrl = new URL(url);
    
    // Mail.ru
    if (parsedUrl.hostname.includes('mail.ru')) {
      return createMailRuSource(url);
    }
    
    // YouTube
    if (parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname.includes('youtu.be')) {
      const youtubeSource = createYouTubeSource(url);
      if (youtubeSource) return youtubeSource;
    }
    
    // Dailymotion
    if (parsedUrl.hostname.includes('dailymotion.com') || parsedUrl.hostname.includes('dai.ly')) {
      const dailymotionSource = createDailymotionSource(url);
      if (dailymotionSource) return dailymotionSource;
    }
    
    // Si aucun format spécifique n'est reconnu, essayer un embed direct
    return {
      id: uuidv4(),
      provider: parsedUrl.hostname,
      embedUrl: url,
      isWorking: true
    };
  } catch (error) {
    console.error('Erreur lors du parsing de l\'URL:', error);
    return null;
  }
}

/**
 * Crée une source Mail.ru
 * Formats:
 * - https://my.mail.ru/mail/user/video/_myvideo/123.html
 * - https://my.mail.ru/mail/user/video/embed/_myvideo/123.html
 */
function createMailRuSource(url: string): VideoSource {
  // Si c'est déjà un lien d'embed, l'utiliser directement
  if (url.includes('/video/embed/')) {
    return {
      id: uuidv4(),
      provider: 'Mail.ru',
      embedUrl: url,
      quality: 'Standard',
      isWorking: true
    };
  }
  
  // Remplacer /video/ par /video/embed/ pour obtenir l'URL d'embed
  let embedUrl = url;
  
  // Format: https://my.mail.ru/mail/user/video/_myvideo/123.html
  if (url.includes('/video/')) {
    embedUrl = url.replace('/video/', '/video/embed/');
  }
  
  return {
    id: uuidv4(),
    provider: 'Mail.ru',
    embedUrl: embedUrl,
    quality: 'Standard',
    isWorking: true
  };
}

/**
 * Crée une source YouTube
 */
function createYouTubeSource(url: string): VideoSource | null {
  let videoId = '';
  
  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  if (url.includes('youtube.com/watch')) {
    const parsedUrl = new URL(url);
    videoId = parsedUrl.searchParams.get('v') || '';
  }
  
  // Format: https://youtu.be/VIDEO_ID
  else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  }
  
  if (!videoId) return null;
  
  return {
    id: uuidv4(),
    provider: 'YouTube',
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    quality: 'HD',
    isWorking: true
  };
}

/**
 * Crée une source Dailymotion
 */
function createDailymotionSource(url: string): VideoSource | null {
  let videoId = '';
  
  // Format: https://www.dailymotion.com/video/VIDEO_ID
  if (url.includes('dailymotion.com/video/')) {
    videoId = url.split('dailymotion.com/video/')[1].split('?')[0];
  }
  
  // Format: https://dai.ly/VIDEO_ID
  else if (url.includes('dai.ly/')) {
    videoId = url.split('dai.ly/')[1].split('?')[0];
  }
  
  if (!videoId) return null;
  
  return {
    id: uuidv4(),
    provider: 'Dailymotion',
    embedUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
    quality: 'Standard',
    isWorking: true
  };
}

/**
 * Formatte une chaîne contenant plusieurs URL en sources vidéo
 */
export function formatVideoSourcesFromString(input: string): string {
  const sources = parseVideoSources(input);
  return JSON.stringify(sources, null, 2);
} 
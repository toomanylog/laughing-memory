import { v4 as uuidv4 } from 'uuid';
import { VideoSource } from '../types/index.ts';

/**
 * Utilitaire pour parser et formater les URL vidéo
 */
export const videoSourceParser = {
  /**
   * Parse une chaîne de caractères pour extraire des sources vidéo
   * Format supporté: "@URL_VIDEO" ou JSON au format VideoSource[]
   * @param input Chaîne à parser
   * @returns Array de VideoSource ou null si invalide
   */
  parseVideoSources(input: string): VideoSource[] | null {
    if (!input || input.trim() === '') {
      return null;
    }

    try {
      // Si l'entrée commence par "[", essayer de la parser comme JSON
      if (input.trim().startsWith('[')) {
        return JSON.parse(input) as VideoSource[];
      }

      // Sinon, traiter chaque ligne commençant par @ comme une URL vidéo
      const sources: VideoSource[] = [];
      const lines = input.split('\n');

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('@')) {
          const url = trimmedLine.substring(1).trim();
          if (url) {
            const source = this.createSourceFromUrl(url);
            if (source) {
              sources.push(source);
            }
          }
        }
      }

      return sources.length > 0 ? sources : null;
    } catch (error) {
      console.error('Erreur lors du parsing des sources vidéo:', error);
      return null;
    }
  },

  /**
   * Crée un objet VideoSource à partir d'une URL
   * @param url URL de la vidéo
   * @returns Objet VideoSource ou null si URL invalide
   */
  createSourceFromUrl(url: string): VideoSource | null {
    if (!this.isValidUrl(url)) {
      return null;
    }

    // Déterminer le fournisseur à partir de l'URL
    const provider = this.getProviderFromUrl(url);
    const embedUrl = this.getEmbedUrl(url, provider);

    if (!embedUrl) {
      return null;
    }

    return {
      id: uuidv4(),
      provider,
      embedUrl,
      isWorking: true
    };
  },

  /**
   * Vérifie si une URL est valide
   * @param url URL à vérifier
   * @returns true si valide, false sinon
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Détermine le fournisseur à partir de l'URL
   * @param url URL de la vidéo
   * @returns Nom du fournisseur
   */
  getProviderFromUrl(url: string): string {
    const hostname = new URL(url).hostname.toLowerCase();

    if (hostname.includes('mail.ru')) return 'Mail.ru';
    if (hostname.includes('youtube')) return 'YouTube';
    if (hostname.includes('youtu.be')) return 'YouTube';
    if (hostname.includes('vimeo')) return 'Vimeo';
    if (hostname.includes('dailymotion')) return 'Dailymotion';
    if (hostname.includes('facebook')) return 'Facebook';
    if (hostname.includes('vk.com')) return 'VK';
    if (hostname.includes('ok.ru')) return 'Odnoklassniki';
    if (hostname.includes('streamable')) return 'Streamable';
    
    return 'Autre';
  },

  /**
   * Convertit une URL normale en URL d'intégration (iframe)
   * @param url URL originale
   * @param provider Fournisseur identifié
   * @returns URL d'intégration ou null si non supporté
   */
  getEmbedUrl(url: string, provider: string): string | null {
    try {
      const parsedUrl = new URL(url);
      
      switch (provider) {
        case 'YouTube': {
          let videoId = '';
          if (parsedUrl.hostname.includes('youtu.be')) {
            videoId = parsedUrl.pathname.substring(1);
          } else {
            videoId = parsedUrl.searchParams.get('v') || '';
          }
          return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        }
        
        case 'Vimeo': {
          const vimeoId = parsedUrl.pathname.split('/').pop();
          return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : null;
        }
        
        case 'Dailymotion': {
          const match = parsedUrl.pathname.match(/\/video\/([a-zA-Z0-9]+)/);
          const videoId = match ? match[1] : null;
          return videoId ? `https://www.dailymotion.com/embed/video/${videoId}` : null;
        }
        
        case 'Facebook': {
          return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`;
        }
        
        case 'Mail.ru': {
          // Pour Mail.ru, l'URL d'embedding est généralement similaire à l'URL de visionnage
          // mais avec un paramètre embed=1
          const pathParts = parsedUrl.pathname.split('/');
          if (pathParts.length >= 4) {
            // S'assurer que les paramètres nécessaires sont présents
            // Format /mail/{username}/video/{videoPath}/{videoId}.html
            return `https://my.mail.ru/video/embed/${pathParts.slice(2).join('/')}`;
          }
          return url; // Utiliser l'URL telle quelle si le format n'est pas reconnu
        }
        
        case 'VK': {
          const videoId = parsedUrl.pathname.split('/').pop();
          const ownerId = parsedUrl.searchParams.get('ownerId') || parsedUrl.searchParams.get('z').split('video')[1].split('_')[0];
          const id = parsedUrl.searchParams.get('id') || parsedUrl.searchParams.get('z').split('video')[1].split('_')[1];
          return videoId ? `https://vk.com/video_ext.php?oid=${ownerId}&id=${id}&hash=${videoId}` : null;
        }
        
        case 'Odnoklassniki': {
          const videoId = parsedUrl.pathname.split('/').pop();
          return videoId ? `https://ok.ru/videoembed/${videoId}` : null;
        }
        
        case 'Streamable': {
          const videoId = parsedUrl.pathname.split('/').pop();
          return videoId ? `https://streamable.com/e/${videoId}` : null;
        }
        
        default:
          // Pour les autres, utiliser l'URL directe (peut ne pas fonctionner pour l'intégration)
          return url;
      }
    } catch (error) {
      console.error('Erreur lors de la génération de l\'URL d\'intégration:', error);
      return null;
    }
  },

  /**
   * Formater les sources vidéo en chaîne
   * @param sources Liste des sources vidéo
   * @returns Chaîne formatée
   */
  formatVideoSources(sources: VideoSource[]): string {
    return sources.map(source => `@${source.embedUrl}`).join('\n');
  }
};

export default videoSourceParser; 
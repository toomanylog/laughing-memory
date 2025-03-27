import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, CircularProgress, List, ListItem, ListItemText, ListItemButton, Paper } from '@mui/material';
import { useContent } from '../hooks/useContent.ts';
import { Content, Episode } from '../types/index.ts';
import EmbedVideoPlayer from '../components/EmbedVideoPlayer.tsx';

const WatchPage: React.FC = () => {
  const { contentId, seasonId, episodeId } = useParams<{ contentId: string, seasonId?: string, episodeId?: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { getContentById } = useContent();

  useEffect(() => {
    if (!contentId) {
      setError("ID de contenu manquant");
      setLoading(false);
      return;
    }

    const fetchContent = async () => {
      setLoading(true);
      setError(null);

      try {
        // Récupérer le contenu
        const contentData = await getContentById(contentId);
        
        if (!contentData) {
          setError("Contenu non trouvé");
          setLoading(false);
          return;
        }
        
        setContent(contentData);
        
        // Si c'est une série et qu'on a un ID de saison et d'épisode, récupérer l'épisode
        if (contentData.type === 'series' && seasonId && episodeId && contentData.seasons) {
          const season = contentData.seasons.find(s => s.id === seasonId);
          
          if (season) {
            const episode = season.episodes.find(e => e.id === episodeId);
            
            if (episode) {
              setCurrentEpisode(episode);
            } else {
              setError(`Épisode ${episodeId} non trouvé dans la saison ${seasonId}`);
            }
          } else {
            setError(`Saison ${seasonId} non trouvée`);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération du contenu:", error);
        
        // Réessayer jusqu'à 3 fois en cas d'erreur
        if (retryCount < 3) {
          console.log(`Tentative ${retryCount + 1}/3 de récupération du contenu...`);
          setRetryCount(prev => prev + 1);
          setTimeout(fetchContent, 1000); // Réessayer après 1 seconde
        } else {
          setError("Impossible de charger le contenu après plusieurs tentatives. Veuillez réessayer plus tard.");
          setLoading(false);
        }
      }
    };

    fetchContent();
  }, [contentId, seasonId, episodeId, getContentById, retryCount]);

  // Gérer le clic sur un épisode
  const handleEpisodeClick = (sId: string, eId: string) => {
    navigate(`/watch/${contentId}/season/${sId}/episode/${eId}`);
  };

  // Si en cours de chargement, afficher un spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Si erreur, afficher un message d'erreur
  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        p={3}
      >
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body1" paragraph>
          Il y a eu un problème lors du chargement du contenu.
        </Typography>
        <Box display="flex" gap={2}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setRetryCount(prev => prev + 1)}
          >
            Réessayer
          </Button>
          <Button 
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Retour à l'accueil
          </Button>
        </Box>
      </Box>
    );
  }

  // Si aucun contenu trouvé
  if (!content) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
      >
        <Typography variant="h5" gutterBottom>
          Contenu non trouvé
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/')}
        >
          Retour à l'accueil
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      {/* Afficher le lecteur vidéo avec l'épisode actuel ou le contenu */}
      {content && (
        <Container maxWidth="lg">
          <EmbedVideoPlayer 
            content={content}
            episode={currentEpisode || undefined} 
            seasonId={seasonId} 
            episodeId={episodeId}
          />
          
          {/* Si c'est une série, afficher la liste des épisodes */}
          {content.type === 'series' && content.seasons && (
            <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Épisodes
              </Typography>
              
              {content.seasons.map((season) => (
                <Box key={season.id} sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {season.title}
                  </Typography>
                  
                  <List>
                    {season.episodes.map((episode) => (
                      <ListItemButton 
                        key={episode.id}
                        onClick={() => handleEpisodeClick(season.id, episode.id)}
                        sx={{ 
                          borderRadius: 1,
                          mb: 1,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                          }
                        }}
                        selected={seasonId === season.id && episodeId === episode.id}
                      >
                        <ListItemText 
                          primary={episode.title}
                          secondary={`Durée: ${episode.duration ? Math.floor(episode.duration / 60) : '?'} min`}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              ))}
            </Paper>
          )}
        </Container>
      )}
    </Box>
  );
};

export default WatchPage; 
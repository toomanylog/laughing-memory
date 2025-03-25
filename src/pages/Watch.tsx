import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { ref, get, set } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import LazyImage from '../components/LazyImage';

interface Episode {
  id: string;
  title: string;
  videoUrl: string;
}

interface Content {
  id: string;
  title: string;
  type: 'movie' | 'series';
  posterUrl: string;
  description: string;
  year: number;
  videoUrl: string;
  episodes?: Episode[];
}

const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const contentRef = ref(database, `content/${id}`);
        const snapshot = await get(contentRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setContent({ id, ...data });
          if (data.type === 'series' && data.episodes && data.episodes.length > 0) {
            setSelectedEpisode(data.episodes[0]);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  const handleMarkAsWatched = async () => {
    if (!user || !content) return;

    try {
      const progressRef = ref(database, `users/${user.uid}/progress/${content.id}`);
      const progressData = {
        timestamp: Date.now(),
        type: content.type,
        ...(content.type === 'series' && selectedEpisode
          ? { episodeId: selectedEpisode.id }
          : {}),
      };
      await set(progressRef, progressData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!content) {
    return (
      <Container>
        <Typography variant="h5" color="error">
          Contenu non trouvé
        </Typography>
      </Container>
    );
  }

  const videoUrl = content.type === 'series' && selectedEpisode
    ? selectedEpisode.videoUrl
    : content.videoUrl;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ position: 'relative', paddingTop: '56.25%', mb: 3 }}>
            <Box
              component="iframe"
              src={videoUrl}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </Box>
          {user && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleMarkAsWatched}
              sx={{ mb: 3 }}
            >
              Marquer comme vu
            </Button>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <LazyImage
              src={content.posterUrl}
              alt={content.title}
              height={300}
              objectFit="cover"
              sx={{ mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {content.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {content.type === 'movie' ? 'Film' : 'Série'} • {content.year}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {content.description}
            </Typography>
          </Paper>
          {content.type === 'series' && content.episodes && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Épisodes
              </Typography>
              <List>
                {content.episodes.map((episode) => (
                  <ListItem key={episode.id} disablePadding>
                    <ListItemButton
                      selected={selectedEpisode?.id === episode.id}
                      onClick={() => setSelectedEpisode(episode)}
                    >
                      <ListItemText primary={episode.title} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Watch; 
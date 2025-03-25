import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { ref, get, remove } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import LazyImage from '../components/LazyImage';

interface WatchlistItem {
  id: string;
  title: string;
  posterUrl: string;
  type: 'movie' | 'series';
}

interface ProgressItem {
  id: string;
  title: string;
  type: 'movie' | 'series';
  timestamp: number;
  episodeId?: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const [watchlistSnapshot, progressSnapshot] = await Promise.all([
          get(ref(database, `users/${user.uid}/watchlist`)),
          get(ref(database, `users/${user.uid}/progress`)),
        ]);

        const watchlistData = watchlistSnapshot.val() || {};
        const progressData = progressSnapshot.val() || {};

        const watchlistArray = Object.entries(watchlistData).map(([id, item]: [string, any]) => ({
          id,
          ...item,
        }));

        const progressArray = Object.entries(progressData).map(([id, item]: [string, any]) => ({
          id,
          ...item,
        }));

        setWatchlist(watchlistArray);
        setProgress(progressArray);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleRemoveFromWatchlist = async (contentId: string) => {
    if (!user) return;

    try {
      await remove(ref(database, `users/${user.uid}/watchlist/${contentId}`));
      setWatchlist((prev) => prev.filter((item) => item.id !== contentId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (!user) {
    return (
      <Container>
        <Typography variant="h5" color="error">
          Veuillez vous connecter pour accéder à votre profil
        </Typography>
      </Container>
    );
  }

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mon Profil
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {user.email}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Ma Liste de Visionnage
          </Typography>
          <Grid container spacing={2}>
            {watchlist.map((item) => (
              <Grid item key={item.id} xs={12} sm={6}>
                <Card>
                  <Box sx={{ position: 'relative' }}>
                    <LazyImage
                      src={item.posterUrl}
                      alt={item.title}
                      height={200}
                      objectFit="cover"
                    />
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                      }}
                      onClick={() => handleRemoveFromWatchlist(item.id)}
                    >
                      Supprimer
                    </Button>
                  </Box>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.type === 'movie' ? 'Film' : 'Série'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Historique de Visionnage
          </Typography>
          <List>
            {progress.map((item, index) => (
              <Box key={item.id}>
                <ListItem>
                  <ListItemText
                    primary={item.title}
                    secondary={`${item.type === 'movie' ? 'Film' : 'Série'} • ${new Date(
                      item.timestamp
                    ).toLocaleDateString('fr-FR')}`}
                  />
                </ListItem>
                {index < progress.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 
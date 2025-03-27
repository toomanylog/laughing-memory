import React, { useState, useEffect, useRef } from 'react';
import { useContent } from '../hooks/useContent.ts';
import ContentCard from '../components/ContentCard.tsx';
import { Content } from '../types/index.ts';
import { Button, CircularProgress, Alert, Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

// Création d'une grille personnalisée avec Flexbox pour éviter les problèmes de Grid
const ContentGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(1, 1fr)',
  gap: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
}));

const AnimePage: React.FC = () => {
  const { loading: globalLoading, error: globalError, getContentsByType } = useContent();
  const [animes, setAnimes] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Éviter les appels redondants
  const isFetchingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    // Éviter de lancer plusieurs requêtes simultanées
    if (isFetchingRef.current) return;
    
    async function loadAnimes() {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log("Chargement des animes...");
        const result = await getContentsByType('anime');
        
        if (isMounted) {
          if (result && result.length > 0) {
            console.log(`${result.length} animes chargés avec succès`);
            setAnimes(result);
          } else {
            console.warn("Aucun anime trouvé");
            setError("Aucun anime n'est disponible pour le moment.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Erreur lors du chargement des animes:", err);
          setError("Une erreur est survenue lors du chargement des animes. Veuillez réessayer.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          isFetchingRef.current = false;
        }
      }
    }
    
    loadAnimes();
    
    return () => {
      isMounted = false;
    };
  }, [getContentsByType, retryCount]);

  const handleRetry = () => {
    // Réinitialiser l'état et tenter un nouveau chargement
    setRetryCount(prevCount => prevCount + 1);
    isFetchingRef.current = false;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Animés
        </Typography>
      </Box>

      {(loading || globalLoading) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
          <CircularProgress color="error" size={50} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Chargement des animés...
          </Typography>
        </Box>
      )}

      {(error || globalError) && !loading && !globalLoading && (
        <Box sx={{ mb: 4 }}>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" onClick={handleRetry}>
                Réessayer
              </Button>
            }
          >
            {error || globalError}
          </Alert>
        </Box>
      )}

      {!loading && !globalLoading && !error && !globalError && animes.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucun animé n'est disponible pour le moment.
          </Typography>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleRetry}
            sx={{ mt: 2 }}
          >
            Actualiser
          </Button>
        </Box>
      )}

      {!loading && !globalLoading && animes.length > 0 && (
        <ContentGrid>
          {animes.map(anime => (
            <ContentCard key={anime.id} content={anime} />
          ))}
        </ContentGrid>
      )}
    </Container>
  );
};

export default AnimePage; 
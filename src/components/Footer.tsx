import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Grid, Divider } from '@mui/material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ bgcolor: 'black', color: 'white', py: 6, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              StreamFlix
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              La meilleure plateforme de streaming en ligne pour films, séries et animés.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Liens rapides
            </Typography>
            <Link to="/" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.5rem' }}>
              Accueil
            </Link>
            <Link to="/movies" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.5rem' }}>
              Films
            </Link>
            <Link to="/series" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.5rem' }}>
              Séries
            </Link>
            <Link to="/animes" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.5rem' }}>
              Animés
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Informations légales
            </Typography>
            <Link to="/cgu" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.5rem' }}>
              Conditions Générales d'Utilisation
            </Link>
            <Link to="/privacy" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.5rem' }}>
              Politique de Confidentialité
            </Link>
            <Link to="/contact" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.5rem' }}>
              Contact
            </Link>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
        
        <Typography variant="body2" align="center" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          &copy; {currentYear} StreamFlix. Tous droits réservés.
        </Typography>
        <Typography variant="caption" align="center" display="block" sx={{ color: 'rgba(255,255,255,0.3)', mt: 1 }}>
          StreamFlix ne stocke aucun contenu vidéo sur ses serveurs. Tous les contenus sont liés à partir de sources tierces.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 
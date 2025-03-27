import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Grid, Divider, TextField, Button, Snackbar, Alert } from '@mui/material';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaDiscord, FaArrowRight } from 'react-icons/fa';
import logo from '../assets/logo.svg';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSnackbarMessage('Veuillez saisir une adresse email valide');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    // Logique d'inscription à la newsletter (à implémenter)
    console.log('Email soumis:', email);
    setSnackbarMessage('Merci de votre inscription à notre newsletter !');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
    setEmail('');
  };

  return (
    <Box component="footer" sx={{ 
      bgcolor: 'rgba(13, 17, 23, 0.97)', 
      color: 'white', 
      py: { xs: 6, md: 8 }, 
      mt: 'auto',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      position: 'relative',
      backgroundImage: 'radial-gradient(circle at 20% 35%, rgba(229, 9, 20, 0.15) 0%, transparent 40%)'
    }}>
      {/* Élément décoratif */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '4px', 
        background: 'linear-gradient(90deg, #E50914 0%, #E50914 50%, transparent 100%)' 
      }} />
      
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <img src={logo} alt="StreamFlix" style={{ height: '45px', marginRight: '12px' }} />
              <Typography variant="h5" component="div" sx={{ 
                fontWeight: 700, 
                letterSpacing: 1,
                background: 'linear-gradient(90deg, #E50914, #FF5F6D)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                StreamFlix
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.7)', 
              mb: 3, 
              textAlign: { xs: 'center', md: 'left' },
              maxWidth: '400px'
            }}>
              La référence du streaming en ligne pour films, séries et animés. Découvrez des milliers de contenus, gardez une trace de ce que vous regardez et créez votre liste personnalisée.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <a 
                href="#" 
                className="text-white hover:text-red-500 transition-colors"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaFacebookF size={16} />
              </a>
              <a 
                href="#" 
                className="text-white hover:text-red-500 transition-colors" 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaTwitter size={16} />
              </a>
              <a 
                href="#" 
                className="text-white hover:text-red-500 transition-colors"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaInstagram size={16} />
              </a>
              <a 
                href="#" 
                className="text-white hover:text-red-500 transition-colors"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaYoutube size={16} />
              </a>
              <a 
                href="#" 
                className="text-white hover:text-red-500 transition-colors"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaDiscord size={16} />
              </a>
            </Box>

            {/* Section newsletter */}
            <Box 
              component="form" 
              onSubmit={handleNewsletterSubmit}
              sx={{ 
                width: '100%', 
                maxWidth: { xs: '100%', md: '380px' },
                mb: { xs: 4, md: 0 }
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Abonnez-vous à notre newsletter
              </Typography>
              <Box sx={{ display: 'flex' }}>
                <TextField
                  variant="outlined"
                  placeholder="Votre email"
                  fullWidth
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.05)',
                      borderRadius: '4px 0 0 4px',
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.2)',
                        borderRight: 'none'
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#E50914',
                      }
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255,255,255,0.5)',
                      opacity: 1
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  variant="contained"
                  sx={{ 
                    bgcolor: '#E50914', 
                    color: 'white',
                    borderRadius: '0 4px 4px 0',
                    '&:hover': { bgcolor: '#C30812' }
                  }}
                >
                  <FaArrowRight />
                </Button>
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1, display: 'block' }}>
                Recevez les nouvelles sorties et mises à jour
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 600, 
              position: 'relative',
              display: 'inline-block',
              pb: 1,
              '&:after': {
                content: '""',
                position: 'absolute',
                width: '40px',
                height: '2px',
                background: '#E50914',
                bottom: 0,
                left: 0
              }
            }}>
              Navigation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
              <Link to="/" className="text-gray-300 hover:text-red-500 transition-colors">
                Accueil
              </Link>
              <Link to="/movies" className="text-gray-300 hover:text-red-500 transition-colors">
                Films
              </Link>
              <Link to="/series" className="text-gray-300 hover:text-red-500 transition-colors">
                Séries
              </Link>
              <Link to="/animes" className="text-gray-300 hover:text-red-500 transition-colors">
                Animés
              </Link>
              <Link to="/login" className="text-gray-300 hover:text-red-500 transition-colors">
                Mon compte
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 600, 
              position: 'relative',
              display: 'inline-block',
              pb: 1,
              '&:after': {
                content: '""',
                position: 'absolute',
                width: '40px',
                height: '2px',
                background: '#E50914',
                bottom: 0,
                left: 0
              }
            }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
              <Link to="/contact" className="text-gray-300 hover:text-red-500 transition-colors">
                Contact
              </Link>
              <Link to="/faq" className="text-gray-300 hover:text-red-500 transition-colors">
                FAQ
              </Link>
              <Link to="/dmca" className="text-gray-300 hover:text-red-500 transition-colors">
                DMCA
              </Link>
              <Link to="/help" className="text-gray-300 hover:text-red-500 transition-colors">
                Aide
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 600, 
              position: 'relative',
              display: 'inline-block',
              pb: 1,
              '&:after': {
                content: '""',
                position: 'absolute',
                width: '40px',
                height: '2px',
                background: '#E50914',
                bottom: 0,
                left: 0
              }
            }}>
              Légal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
              <Link to="/cgu" className="text-gray-300 hover:text-red-500 transition-colors">
                Conditions d'utilisation
              </Link>
              <Link to="/privacy" className="text-gray-300 hover:text-red-500 transition-colors">
                Politique de confidentialité
              </Link>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', mt: 2, maxWidth: '280px' }}>
                StreamFlix ne stocke aucun fichier sur ses serveurs. Tous les contenus sont fournis par des services tiers non affiliés.
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 5, bgcolor: 'rgba(255,255,255,0.1)' }} />
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            &copy; {currentYear} StreamFlix. Tous droits réservés.
          </Typography>
          
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            Conçu et développé avec ❤️ par l'équipe StreamFlix
          </Typography>
        </Box>
      </Container>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Footer; 
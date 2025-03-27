import React, { useState } from 'react';
import { Container, Typography, Paper, Box, TextField, Button, Divider, Alert, Snackbar, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { FaGavel, FaClipboardCheck, FaExclamationTriangle, FaEnvelope, FaExclamationCircle } from 'react-icons/fa';

const DmcaPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contentTitle: '',
    contentUrl: '',
    copyrightOwner: '',
    copyrightProof: '',
    statement: false,
    message: ''
  });
  
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      statement: e.target.checked
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simuler l'envoi du formulaire
    console.log('Formulaire DMCA soumis:', formData);
    
    // Afficher une confirmation
    setSnackbarMessage('Votre demande DMCA a été soumise avec succès. Nous la traiterons dans les plus brefs délais.');
    setShowSnackbar(true);
    
    // Réinitialiser le formulaire
    setFormData({
      name: '',
      email: '',
      contentTitle: '',
      contentUrl: '',
      copyrightOwner: '',
      copyrightProof: '',
      statement: false,
      message: ''
    });
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 8, mt: 8 }}>
      <Paper elevation={3} sx={{ 
        p: { xs: 3, md: 5 }, 
        borderRadius: 2, 
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(to bottom, #1a1a1a, #111)'
      }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white', fontWeight: 700 }}>
            Demande de retrait DMCA
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            StreamFlix respecte les droits de propriété intellectuelle d'autrui et attend de ses utilisateurs qu'ils fassent de même.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FaExclamationTriangle size={20} color="#E50914" style={{ marginRight: '10px' }} />
            <Typography variant="h6" component="h2" sx={{ color: 'white' }}>
              Informations importantes
            </Typography>
          </Box>
          
          <Typography paragraph sx={{ color: 'rgba(255,255,255,0.8)' }}>
            StreamFlix ne stocke aucun contenu vidéo sur ses serveurs. Tous les contenus sont hébergés par des tiers et simplement intégrés via des iframes. StreamFlix agit uniquement comme un annuaire de liens vers des contenus hébergés ailleurs.
          </Typography>
          
          <Typography paragraph sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Néanmoins, nous prenons très au sérieux les violations présumées du droit d'auteur et nous nous conformons aux lois sur le DMCA (Digital Millennium Copyright Act). Si vous êtes propriétaire d'un contenu et que vous pensez que votre travail a été utilisé d'une manière qui constitue une violation du droit d'auteur, veuillez nous fournir les informations demandées ci-dessous.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FaClipboardCheck size={20} color="#E50914" style={{ marginRight: '10px' }} />
            <Typography variant="h6" component="h2" sx={{ color: 'white' }}>
              Procédure de notification de retrait
            </Typography>
          </Box>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#E50914', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>1</Box>
              </ListItemIcon>
              <ListItemText 
                primary="Identification précise de l'œuvre protégée" 
                secondary="Fournissez une description précise de l'œuvre protégée par le droit d'auteur que vous estimez avoir été violée."
                sx={{ '& .MuiListItemText-primary': { color: 'white' }, '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' } }}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#E50914', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>2</Box>
              </ListItemIcon>
              <ListItemText 
                primary="Identification du matériel prétendument en infraction" 
                secondary="Indiquez l'URL exacte du contenu que vous souhaitez faire retirer."
                sx={{ '& .MuiListItemText-primary': { color: 'white' }, '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' } }}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#E50914', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>3</Box>
              </ListItemIcon>
              <ListItemText 
                primary="Informations de contact" 
                secondary="Fournissez-nous vos coordonnées pour que nous puissions vous contacter si nécessaire."
                sx={{ '& .MuiListItemText-primary': { color: 'white' }, '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' } }}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#E50914', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>4</Box>
              </ListItemIcon>
              <ListItemText 
                primary="Déclaration de bonne foi" 
                secondary="Vous devez déclarer de bonne foi que l'utilisation du matériel identifié n'est pas autorisée par le propriétaire du droit d'auteur, son agent ou la loi."
                sx={{ '& .MuiListItemText-primary': { color: 'white' }, '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' } }}
              />
            </ListItem>
          </List>
        </Box>
        
        <Divider sx={{ my: 5, bgcolor: 'rgba(255,255,255,0.1)' }} />
        
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <FaGavel size={20} color="#E50914" style={{ marginRight: '10px' }} />
            <Typography variant="h6" component="h2" sx={{ color: 'white' }}>
              Formulaire de demande de retrait DMCA
            </Typography>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { sm: '1fr', md: '1fr 1fr' } }}>
              <TextField
                required
                fullWidth
                id="name"
                label="Votre nom complet"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    color: 'white', 
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } 
                  },
                  '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' }
                }}
              />
              
              <TextField
                required
                fullWidth
                id="email"
                label="Votre adresse email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    color: 'white', 
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } 
                  },
                  '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' }
                }}
              />
            </Box>
            
            <Box sx={{ mt: 3, display: 'grid', gap: 3, gridTemplateColumns: { sm: '1fr', md: '1fr 1fr' } }}>
              <TextField
                required
                fullWidth
                id="contentTitle"
                label="Titre du contenu protégé"
                name="contentTitle"
                value={formData.contentTitle}
                onChange={handleChange}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    color: 'white', 
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } 
                  },
                  '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' }
                }}
              />
              
              <TextField
                required
                fullWidth
                id="contentUrl"
                label="URL du contenu à retirer"
                name="contentUrl"
                value={formData.contentUrl}
                onChange={handleChange}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    color: 'white', 
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } 
                  },
                  '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' }
                }}
              />
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <TextField
                required
                fullWidth
                id="copyrightOwner"
                label="Nom du propriétaire du droit d'auteur"
                name="copyrightOwner"
                value={formData.copyrightOwner}
                onChange={handleChange}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    color: 'white', 
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } 
                  },
                  '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' }
                }}
              />
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <TextField
                required
                fullWidth
                id="copyrightProof"
                label="Preuve de propriété (description ou lien)"
                name="copyrightProof"
                value={formData.copyrightProof}
                onChange={handleChange}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    color: 'white', 
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } 
                  },
                  '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' }
                }}
              />
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                id="message"
                label="Informations supplémentaires"
                name="message"
                multiline
                rows={4}
                value={formData.message}
                onChange={handleChange}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    color: 'white', 
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } 
                  },
                  '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' }
                }}
              />
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="statement"
                checked={formData.statement}
                onChange={handleCheckboxChange}
                style={{ marginRight: '10px' }}
                required
              />
              <label htmlFor="statement" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Je déclare sous peine de parjure que j'ai une croyance de bonne foi que l'utilisation du matériel de la manière contestée n'est pas autorisée par le propriétaire du droit d'auteur, son agent ou la loi.
              </label>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Remarque : La soumission de fausses réclamations peut entraîner des responsabilités légales.
                </Typography>
              </Alert>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  py: 1.5, 
                  bgcolor: '#E50914', 
                  '&:hover': { bgcolor: '#C2000D' },
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
                disabled={!formData.statement}
              >
                Soumettre la demande de retrait
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default DmcaPage; 
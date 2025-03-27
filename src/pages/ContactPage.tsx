import React, { useState } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, Snackbar, Alert, Grid } from '@mui/material';
import { FaEnvelope, FaQuestion, FaComments, FaBug } from 'react-icons/fa';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [open, setOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simuler l'envoi des données
    console.log('Formulaire soumis:', formData);
    
    // En production, on enverrait les données à un serveur
    // fetch('/api/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // }).then(...)
    
    // Simuler une réponse réussie
    setTimeout(() => {
      setSubmitStatus('success');
      setOpen(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1000);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const ContactCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Box sx={{ 
      p: 3, 
      bgcolor: 'rgba(0, 0, 0, 0.2)', 
      borderRadius: 2, 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      transition: 'transform 0.3s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
      }
    }}>
      <Box sx={{ mb: 2, color: '#E50914', fontSize: '2rem' }}>
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
        {description}
      </Typography>
    </Box>
  );
  
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
            Contactez-nous
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: '700px', mx: 'auto' }}>
            Notre équipe est prête à vous aider pour toute question, suggestion ou problème rencontré sur notre plateforme.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <ContactCard 
                icon={<FaQuestion />}
                title="Questions générales"
                description="Des questions sur notre plateforme ou nos services ? N'hésitez pas à nous contacter."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ContactCard 
                icon={<FaBug />}
                title="Signaler un problème"
                description="Rencontrez-vous un bug ou un problème technique ? Faites-nous en part."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ContactCard 
                icon={<FaEnvelope />}
                title="Demandes commerciales"
                description="Pour toutes questions relatives aux partenariats ou opportunités professionnelles."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ContactCard 
                icon={<FaComments />}
                title="Suggestions"
                description="Vous avez des idées pour améliorer StreamFlix ? Nous sommes toujours à l'écoute."
              />
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Typography variant="h6" gutterBottom sx={{ 
                fontWeight: 600, 
                position: 'relative',
                display: 'inline-block',
                pb: 1,
                color: 'white',
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
                Comment pouvons-nous vous aider?
              </Typography>
              <Typography paragraph sx={{ color: 'rgba(255,255,255,0.8)', mt: 3 }}>
                Notre équipe est prête à répondre à toutes vos questions. Que ce soit pour signaler un problème, suggérer une amélioration ou simplement nous faire part de vos commentaires, n'hésitez pas à nous contacter.
              </Typography>
              <Typography paragraph sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Vous pouvez également nous contacter pour signaler un contenu inapproprié ou pour toute question relative à nos Conditions Générales d'Utilisation ou à notre Politique de Confidentialité.
              </Typography>
              <Typography paragraph sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Nous nous efforçons de répondre à toutes les demandes dans un délai de 48 heures.
              </Typography>
              
              <Alert severity="info" sx={{ mt: 4 }}>
                Pour les demandes de retrait DMCA, veuillez consulter notre <a href="/dmca" style={{ color: '#E50914', textDecoration: 'none' }}>page dédiée</a>.
              </Alert>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ 
                p: 3, 
                bgcolor: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
                  Formulaire de contact
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Votre nom"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    value={formData.name}
                    onChange={handleChange}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': { 
                        color: 'white', 
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } 
                      },
                      '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' }
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Adresse email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': { 
                        color: 'white', 
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } 
                      },
                      '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' }
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="subject"
                    label="Sujet"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': { 
                        color: 'white', 
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } 
                      },
                      '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' }
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="message"
                    label="Votre message"
                    id="message"
                    multiline
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': { 
                        color: 'white', 
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' } 
                      },
                      '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' }
                    }}
                  />
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
                  >
                    Envoyer
                  </Button>
                  
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 2, textAlign: 'center' }}>
                    En soumettant ce formulaire, vous acceptez notre politique de confidentialité et le traitement de vos données.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={submitStatus === 'success' ? 'success' : 'error'} sx={{ width: '100%' }}>
          {submitStatus === 'success' 
            ? 'Votre message a été envoyé avec succès! Nous vous répondrons dans les plus brefs délais.' 
            : 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer plus tard.'}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ContactPage; 
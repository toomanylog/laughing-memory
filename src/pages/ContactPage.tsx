import React, { useState } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, Snackbar, Alert, Grid } from '@mui/material';

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
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Contactez-nous
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Comment pouvons-nous vous aider?
              </Typography>
              <Typography paragraph>
                Notre équipe est prête à répondre à toutes vos questions. Que ce soit pour signaler un problème, suggérer une amélioration ou simplement nous faire part de vos commentaires, n'hésitez pas à nous contacter.
              </Typography>
              <Typography paragraph>
                Vous pouvez également nous contacter pour signaler un contenu inapproprié ou pour toute question relative à nos Conditions Générales d'Utilisation ou à notre Politique de Confidentialité.
              </Typography>
              <Typography paragraph>
                Nous nous efforçons de répondre à toutes les demandes dans un délai de 48 heures.
              </Typography>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Informations de contact
                </Typography>
                <Typography paragraph>
                  Email: contact@streamflix.com
                </Typography>
                <Typography paragraph>
                  Adresse: 123 Rue du Streaming, 75000 Paris, France
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box component="form" onSubmit={handleSubmit} noValidate>
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
                  sx={{ mb: 2 }}
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
                  sx={{ mb: 2 }}
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
                  sx={{ mb: 2 }}
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
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ p: 1.5 }}
                >
                  Envoyer
                </Button>
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
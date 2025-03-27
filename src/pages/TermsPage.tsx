import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const TermsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Conditions Générales d'Utilisation
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
          Dernière mise à jour : {new Date().toLocaleDateString()}
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            1. Acceptation des conditions
          </Typography>
          <Typography paragraph>
            En accédant et en utilisant StreamFlix, vous acceptez d'être lié par ces Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            2. Description du service
          </Typography>
          <Typography paragraph>
            StreamFlix est une plateforme de référencement de contenu vidéo en ligne qui agrège et organise des liens vers des contenus hébergés sur des plateformes tierces. StreamFlix ne stocke aucun contenu vidéo sur ses serveurs.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            3. Responsabilité des utilisateurs
          </Typography>
          <Typography paragraph>
            Les utilisateurs s'engagent à :
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Ne pas utiliser le service à des fins illégales ou non autorisées</li>
            <li>Ne pas tenter de contourner les mesures de sécurité du site</li>
            <li>Ne pas utiliser le service d'une manière qui pourrait endommager, désactiver ou surcharger nos serveurs</li>
            <li>Ne pas partager leur compte avec d'autres personnes</li>
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            4. Propriété intellectuelle
          </Typography>
          <Typography paragraph>
            StreamFlix respecte les droits de propriété intellectuelle et s'engage à répondre rapidement à toute notification de contenu qui porterait atteinte aux droits d'un tiers. Si vous pensez qu'un contenu référencé sur notre plateforme porte atteinte à vos droits, veuillez nous contacter à travers la page de contact.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            5. Limitation de responsabilité
          </Typography>
          <Typography paragraph>
            StreamFlix ne stocke aucun contenu vidéo et n'est qu'un moteur de recherche spécialisé dans le contenu vidéo en ligne. Nous ne sommes pas responsables de la disponibilité ou de la légalité des contenus référencés, ni de l'exactitude des informations fournies par les sites tiers.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            6. Modification des conditions
          </Typography>
          <Typography paragraph>
            Nous nous réservons le droit de modifier ces Conditions Générales d'Utilisation à tout moment. Les modifications entreront en vigueur dès leur publication sur le site. Il est de votre responsabilité de consulter régulièrement ces conditions.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            7. Résiliation
          </Typography>
          <Typography paragraph>
            Nous nous réservons le droit de suspendre ou de résilier votre accès au service, sans préavis, pour toute raison, y compris, sans limitation, si vous ne respectez pas ces Conditions Générales d'Utilisation.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            8. Loi applicable
          </Typography>
          <Typography paragraph>
            Ces Conditions Générales d'Utilisation sont régies par la loi française. Tout litige relatif à leur interprétation et/ou à leur exécution relève des tribunaux français.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsPage; 
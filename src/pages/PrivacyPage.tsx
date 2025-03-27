import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const PrivacyPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Politique de Confidentialité
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
          Dernière mise à jour : {new Date().toLocaleDateString()}
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            1. Collecte des données
          </Typography>
          <Typography paragraph>
            StreamFlix collecte les informations suivantes lors de votre inscription et utilisation du service :
          </Typography>
          <Typography component="ul" sx={{ pl: 4, mb: 2 }}>
            <li>Adresse email</li>
            <li>Nom d'utilisateur</li>
            <li>Historique de visionnage</li>
            <li>Préférences de contenu</li>
            <li>Informations de connexion (adresse IP, type de navigateur, etc.)</li>
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            2. Utilisation des données
          </Typography>
          <Typography paragraph>
            Nous utilisons vos données personnelles pour :
          </Typography>
          <Typography component="ul" sx={{ pl: 4, mb: 2 }}>
            <li>Gérer votre compte et vous fournir notre service</li>
            <li>Personnaliser votre expérience utilisateur et vos recommandations</li>
            <li>Améliorer et optimiser notre plateforme</li>
            <li>Communiquer avec vous concernant votre compte ou nos services</li>
            <li>Assurer la sécurité de notre service</li>
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            3. Partage des données
          </Typography>
          <Typography paragraph>
            StreamFlix ne vend pas vos données personnelles à des tiers. Nous pouvons partager certaines informations avec :
          </Typography>
          <Typography component="ul" sx={{ pl: 4, mb: 2 }}>
            <li>Nos prestataires de services qui nous aident à fournir et améliorer notre service</li>
            <li>Les autorités légales lorsque nous sommes tenus de le faire par la loi</li>
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            4. Sécurité des données
          </Typography>
          <Typography paragraph>
            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès, utilisation ou divulgation non autorisés. Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est totalement sécurisée, et nous ne pouvons garantir une sécurité absolue.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            5. Cookies et technologies similaires
          </Typography>
          <Typography paragraph>
            StreamFlix utilise des cookies et des technologies similaires pour améliorer votre expérience sur notre plateforme, analyser l'utilisation de notre service et personnaliser le contenu. Vous pouvez configurer votre navigateur pour refuser tous les cookies ou pour indiquer quand un cookie est envoyé. Cependant, certaines fonctionnalités de notre service peuvent ne pas fonctionner correctement si vous désactivez les cookies.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            6. Vos droits
          </Typography>
          <Typography paragraph>
            Vous avez le droit d'accéder à vos données personnelles, de les rectifier, de les supprimer ou d'en limiter le traitement. Vous pouvez également vous opposer au traitement de vos données ou demander leur portabilité. Pour exercer ces droits, veuillez nous contacter via notre page de contact.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            7. Conservation des données
          </Typography>
          <Typography paragraph>
            Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir notre service et respecter nos obligations légales. Lorsque vous supprimez votre compte, nous supprimons vos données personnelles dans un délai raisonnable, sauf si la loi nous oblige à les conserver.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            8. Modifications de cette politique
          </Typography>
          <Typography paragraph>
            Nous pouvons mettre à jour notre politique de confidentialité de temps à autre. Nous vous informerons de tout changement en publiant la nouvelle politique de confidentialité sur cette page. Il est recommandé de consulter régulièrement cette politique pour prendre connaissance de toute modification.
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            9. Contact
          </Typography>
          <Typography paragraph>
            Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter via notre page de contact.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPage; 
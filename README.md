# Laughing Memory - Plateforme de Streaming

Une plateforme de streaming moderne permettant aux utilisateurs de regarder des films et des séries, avec suivi de progression et fonctionnalités d'administration.

## Fonctionnalités

- 🎬 **Catalogue de contenus** : Films et séries organisés par catégories
- 👤 **Authentification** : Inscription et connexion via Firebase
- 🎯 **Suivi de progression** : Enregistrement de la progression de visionnage
- 💾 **Stockage local** : Suivi de progression même pour les utilisateurs non connectés
- 📱 **Design responsive** : Interface adaptée aux mobiles et ordinateurs
- 🔍 **Recherche et filtrage** : Facilité de navigation dans le catalogue
- 👑 **Panel d'administration** : Gestion complète des contenus

## Technologies utilisées

- **Frontend** : React, TypeScript, Tailwind CSS
- **Backend** : Firebase (Authentication, Realtime Database)
- **Routage** : React Router
- **Lecteur vidéo** : React Player
- **État global** : Context API, React Hooks personnalisés

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-utilisateur/laughing-memory.git
   cd laughing-memory
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Créez un fichier `.env` à la racine du projet en utilisant `.env.example` comme modèle, et remplissez-le avec vos informations Firebase.

4. Lancez l'application en mode développement :
   ```bash
   npm start
   ```

## Déploiement

L'application est préconfigurée pour être déployée sur Netlify :

1. Connectez votre dépôt GitHub à Netlify
2. Configurez les variables d'environnement dans Netlify (copier les valeurs du fichier `.env`)
3. Utilisez les paramètres de build suivants :
   - Build command: `npm run build`
   - Publish directory: `build`
4. Déployez !

## Structure du projet

```
laughing-memory/
├── public/             # Fichiers statiques
├── src/
│   ├── components/     # Composants réutilisables
│   │   └── admin/      # Composants d'administration
│   ├── contexts/       # Contextes React (Auth, etc.)
│   ├── hooks/          # Hooks personnalisés
│   ├── pages/          # Pages principales de l'application
│   └── types/          # Types TypeScript
├── .env                # Variables d'environnement (non versionné)
└── .env.example        # Exemple de variables d'environnement
```

## Pages principales

- **HomePage** : Présentation des contenus populaires et suggestions
- **MoviesPage** : Liste des films disponibles
- **SeriesPage** : Liste des séries disponibles
- **WatchPage** : Lecteur vidéo avec contrôles et informations sur le contenu
- **ProfilePage** : Historique de visionnage et informations utilisateur
- **AdminPage** : Gestion des contenus (ajout, modification, suppression)
- **AuthPage** : Connexion et inscription
- **NotFoundPage** : Page d'erreur 404 personnalisée

## Règles de sécurité Firebase

Des règles de sécurité sont définies pour protéger les données :
- Lecture publique pour les contenus
- Écriture limitée aux utilisateurs authentifiés
- Administration réservée aux utilisateurs avec rôle "admin"

## Licence

Ce projet est sous licence MIT.

---

Développé avec ❤️ par [Votre Nom]

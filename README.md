# Laughing Memory

Une application de streaming de films et séries construite avec React, TypeScript et Firebase.

## Fonctionnalités

- Visionnage de films et séries
- Système d'authentification
- Suivi de la progression
- Liste de visionnage
- Interface d'administration
- Thème clair/sombre
- Support multilingue (FR/EN)
- Interface responsive

## Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn
- Compte Firebase

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-username/laughing-memory.git
cd laughing-memory
```

2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet et copiez les variables d'environnement depuis `.env.example` :
```bash
cp .env.example .env
```

4. Configurez vos variables d'environnement Firebase dans le fichier `.env`

5. Lancez l'application en mode développement :
```bash
npm run dev
```

## Déploiement

L'application est configurée pour être déployée sur Netlify. Pour déployer :

1. Créez un compte Netlify si ce n'est pas déjà fait
2. Connectez votre dépôt GitHub à Netlify
3. Configurez les variables d'environnement dans les paramètres de déploiement Netlify
4. Déployez !

## Structure du projet

```
src/
  ├── components/     # Composants réutilisables
  ├── config/        # Configuration Firebase
  ├── hooks/         # Hooks personnalisés
  ├── pages/         # Pages de l'application
  ├── store/         # État global avec Zustand
  ├── theme.ts       # Configuration du thème
  ├── App.tsx        # Composant principal
  └── main.tsx       # Point d'entrée
```

## Technologies utilisées

- React
- TypeScript
- Material-UI
- Firebase (Auth & Realtime Database)
- Zustand
- React Router
- Vite

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 
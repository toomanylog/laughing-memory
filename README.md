# Laughing Memory

Une application de streaming de films et séries construite avec React, TypeScript et Firebase.

## Fonctionnalités

* Visionnage de films et séries
* Système d'authentification
* Suivi de la progression
* Liste de visionnage
* Interface d'administration
* Thème clair/sombre
* Support multilingue (FR/EN)
* Interface responsive

## Prérequis

* Node.js (v18 ou supérieur)
* npm ou yarn
* Compte Firebase

## Installation

1. Clonez le dépôt :

```bash
git clone https://github.com/toomanylog/laughing-memory.git
cd laughing-memory
```

2. Installez les dépendances :

```bash
npm install
```

3. Créez un fichier `.env.local` à la racine du projet et copiez les variables d'environnement depuis `.env.example` :

```bash
cp .env.example .env.local
```

4. Configurez vos variables d'environnement Firebase dans le fichier `.env.local`
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
  ├── app/          # Pages de l'application (Next.js App Router)
  ├── components/   # Composants réutilisables
  ├── lib/          # Fonctions utilitaires, configuration Firebase
  ├── providers/    # Providers React (contextes)
```

## Technologies utilisées

* React
* Next.js 14
* TypeScript
* Tailwind CSS
* Firebase (Auth & Realtime Database)
* NextAuth.js
* Zustand
* React Hook Form
* Zod

## Configuration de Firebase

Les règles de sécurité Firebase pour la Realtime Database sont définies dans le fichier `firebase.rules.json`. Assurez-vous de les déployer dans votre projet Firebase.

## Variables d'environnement

Pour le déploiement sur Netlify, vous devez configurer les variables d'environnement suivantes :

```
NEXT_PUBLIC_FIREBASE_API_KEY=votre-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-auth-domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=votre-database-url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=votre-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=votre-measurement-id
NEXTAUTH_SECRET=votre-secret
NEXTAUTH_URL=votre-url-de-deploiement
```

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

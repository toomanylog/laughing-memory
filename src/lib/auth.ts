import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Authentification via Firebase
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          
          const user = userCredential.user;
          
          // Vérifier si l'utilisateur est un admin
          const userRef = ref(db, `users/${user.uid}`);
          const userSnapshot = await get(userRef);
          const userData = userSnapshot.val();
          
          // Retourner les données utilisateur pour la session
          return {
            id: user.uid,
            email: user.email,
            name: user.displayName || userData?.displayName || credentials.email,
            image: user.photoURL || userData?.photoURL,
            isAdmin: userData?.isAdmin || false
          };
        } catch (error) {
          console.error('Erreur d\'authentification:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      // Ajout des informations supplémentaires au token
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      // Transmettre les informations du token à la session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Type pour étendre la session NextAuth avec nos propriétés personnalisées
declare module "next-auth" {
  interface User {
    id: string;
    isAdmin?: boolean;
  }
  
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      email: string;
      name?: string;
      image?: string;
    }
  }
} 
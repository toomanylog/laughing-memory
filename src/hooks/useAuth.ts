import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { db } from '../firebase.ts';
import { User } from '../types/index.ts';
import React from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();

  // Fonction pour récupérer les données utilisateur complètes depuis la base de données
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userRef = ref(db, `users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as User;
      } else {
        // Si l'utilisateur n'existe pas dans la base de données, créer un nouvel utilisateur
        const newUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          createdAt: Date.now(),
          history: [],
          role: 'user'
        };
        
        // Enregistrer le nouvel utilisateur dans la base de données
        await set(userRef, newUser);
        return newUser;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  };

  // Détecter les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        // Utilisateur connecté
        try {
          const userData = await fetchUserData(firebaseUser);
          setUser(userData);
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
        }
      } else {
        // Utilisateur déconnecté
        setUser(null);
      }
      
      setLoading(false);
    });
    
    // Nettoyer l'abonnement à la déconnexion
    return () => unsubscribe();
  }, [auth]);

  // Connexion d'un utilisateur existant
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(userCredential.user);
      setUser(userData);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors de la connexion');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Création d'un nouvel utilisateur
  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Créer l'utilisateur dans la base de données
      const newUser: User = {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        photoURL: '',
        createdAt: Date.now(),
        history: [],
        role: 'user'
      };
      
      await set(ref(db, `users/${newUser.uid}`), newUser);
      setUser(newUser);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors de la création du compte');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const signOut = async () => {
    setLoading(true);
    
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors de la déconnexion');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    React.createElement(AuthContext.Provider, 
      { value: { user, loading, error, signIn, signUp, signOut } },
      children
    )
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé au sein d'un AuthProvider");
  }
  
  return context;
}; 
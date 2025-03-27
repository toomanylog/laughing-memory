import { useState, useEffect } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { app } from '../firebase';

// Type simplifiés pour l'utilisateur
interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthHookReturn {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Hook d'authentification simplifié
 */
export const useAuth = (): AuthHookReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth: Auth = getAuth(app);

  // Convertir l'utilisateur Firebase en utilisateur simplifié
  const formatUser = (user: User | null): AuthUser | null => {
    if (!user) return null;
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    };
  };

  // Surveiller les changements d'état d'authentification
  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, 
      (firebaseUser) => {
        setUser(formatUser(firebaseUser));
        setLoading(false);
      }, 
      (error) => {
        console.error('Erreur d\'authentification:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  // Connexion
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      // L'utilisateur sera mis à jour via onAuthStateChanged
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erreur de connexion");
      }
      setLoading(false);
      throw error;
    }
  };

  // Inscription
  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
      // L'utilisateur sera mis à jour via onAuthStateChanged
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erreur d'inscription");
      }
      setLoading(false);
      throw error;
    }
  };

  // Déconnexion
  const logout = async (): Promise<void> => {
    if (!auth.currentUser) return;
    
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erreur de déconnexion");
      }
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    logout
  };
};

export default useAuth; 
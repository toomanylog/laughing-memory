import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '../../config/firebase';
import { UserProfile } from '../../types';

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Une erreur est survenue lors de la connexion'
    );
  }
};

export const signUp = async (email: string, password: string, displayName?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Mettre à jour le profil avec le nom d'affichage si fourni
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Vérifier s'il y a des utilisateurs existants
    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    
    // Déterminer si c'est le premier utilisateur (admin)
    const isFirstUser = !usersSnapshot.exists();

    // Créer le profil utilisateur dans la base de données
    const userProfile: Omit<UserProfile, 'uid'> = {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      isAdmin: isFirstUser, // Premier utilisateur = admin
      createdAt: new Date().toISOString(),
    };

    await set(ref(database, `users/${user.uid}`), userProfile);
    
    return user;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Une erreur est survenue lors de la création du compte'
    );
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Une erreur est survenue lors de la déconnexion'
    );
  }
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return { uid, ...snapshot.val() } as UserProfile;
    }
    
    return null;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Une erreur est survenue lors de la récupération du profil'
    );
  }
}; 
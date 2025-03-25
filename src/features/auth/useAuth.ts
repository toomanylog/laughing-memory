import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { signIn, signUp, signOut, getUserProfile } from './authService';
import { UserProfile } from '../../types';

// Clés de requête
const AUTH_USER_KEY = 'auth-user';
const USER_PROFILE_KEY = 'user-profile';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [authChecked, setAuthChecked] = useState(false);

  // Observer l'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      queryClient.setQueryData<User | null>(AUTH_USER_KEY, user);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [queryClient]);

  // Obtenir l'utilisateur actuellement authentifié
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: [AUTH_USER_KEY],
    queryFn: () => auth.currentUser,
    enabled: authChecked,
    staleTime: Infinity,
  });

  // Obtenir le profil de l'utilisateur depuis la base de données
  const { 
    data: userProfile, 
    isLoading: isLoadingProfile 
  } = useQuery({
    queryKey: [USER_PROFILE_KEY, user?.uid],
    queryFn: () => user ? getUserProfile(user.uid) : null,
    enabled: !!user,
  });

  // Mutation pour la connexion
  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      signIn(email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_USER_KEY, user);
      if (user) {
        queryClient.invalidateQueries({ queryKey: [USER_PROFILE_KEY, user.uid] });
      }
    },
  });

  // Mutation pour l'inscription
  const signUpMutation = useMutation({
    mutationFn: ({ 
      email, 
      password, 
      displayName 
    }: { 
      email: string; 
      password: string; 
      displayName?: string 
    }) => signUp(email, password, displayName),
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_USER_KEY, user);
      if (user) {
        queryClient.invalidateQueries({ queryKey: [USER_PROFILE_KEY, user.uid] });
      }
    },
  });

  // Mutation pour la déconnexion
  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_USER_KEY, null);
      queryClient.setQueryData([USER_PROFILE_KEY, user?.uid], null);
    },
  });

  // Vérifier si l'utilisateur est administrateur
  const isAdmin = userProfile?.isAdmin || false;

  // État de chargement global
  const isLoading = !authChecked || isLoadingUser || isLoadingProfile;

  return {
    user,
    userProfile,
    isAdmin,
    isLoading,
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,
    signInError: signInMutation.error,
    signUpError: signUpMutation.error,
    signOutError: signOutMutation.error,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  };
}; 
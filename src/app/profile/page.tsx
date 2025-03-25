'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ref, get, update } from 'firebase/database';
import { db, auth } from '@/lib/firebase';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Button } from '@/components/ui/Button';
import { FaUser, FaSignOutAlt, FaKey, FaEdit } from 'react-icons/fa';
import { User } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schéma de validation pour le profil
const profileSchema = z.object({
  displayName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Schéma de validation pour le changement de mot de passe
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      email: '',
    }
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  // Rediriger si non connecté
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Récupérer les données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const userRef = ref(db, `users/${session.user.id}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const data = snapshot.val() as User;
            setUserData(data);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

  // Mettre à jour les champs du formulaire quand les données utilisateur sont chargées
  useEffect(() => {
    if (userData) {
      const form = document.getElementById('profile-form') as HTMLFormElement;
      if (form) {
        const displayNameElement = form.elements.namedItem('displayName');
        const emailElement = form.elements.namedItem('email');
        
        if (displayNameElement && 'value' in displayNameElement) {
          displayNameElement.value = userData.displayName || '';
        }
        
        if (emailElement && 'value' in emailElement) {
          emailElement.value = userData.email || '';
        }
      }
    }
  }, [userData]);

  const onUpdateProfile = async (data: ProfileFormValues) => {
    if (!auth.currentUser || !session?.user?.id) return;
    
    setError('');
    setSuccessMessage('');
    setUpdateLoading(true);
    
    try {
      // Mise à jour du profil dans Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: data.displayName,
      });
      
      // Mise à jour de l'email si modifié
      if (data.email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, data.email);
      }
      
      // Mise à jour des données dans la base de données
      const userRef = ref(db, `users/${session.user.id}`);
      await update(userRef, {
        displayName: data.displayName,
        email: data.email,
      });
      
      // Mise à jour de la session
      await updateSession({
        ...session,
        user: {
          ...session.user,
          name: data.displayName,
          email: data.email,
        }
      });
      
      setSuccessMessage('Profil mis à jour avec succès');
      setUserData(prev => prev ? {...prev, displayName: data.displayName, email: data.email} : null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setError('Une erreur est survenue lors de la mise à jour du profil');
    } finally {
      setUpdateLoading(false);
    }
  };

  const onUpdatePassword = async (data: PasswordFormValues) => {
    if (!auth.currentUser || !session?.user?.id) return;
    
    setError('');
    setSuccessMessage('');
    setPasswordLoading(true);
    
    try {
      // Réauthentifier l'utilisateur
      const email = auth.currentUser.email || '';
      if (!email) {
        throw new Error('Email non disponible');
      }
      
      const credential = EmailAuthProvider.credential(
        email,
        data.currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Mettre à jour le mot de passe
      await updatePassword(auth.currentUser, data.newPassword);
      
      setSuccessMessage('Mot de passe mis à jour avec succès');
      resetPassword();
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      setError('Mot de passe incorrect ou erreur de mise à jour');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Redirection gérée par useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-gray-800/40 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FaUser className="mr-2" />
              Informations personnelles
            </h2>
            
            <form id="profile-form" onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  id="displayName"
                  type="text"
                  {...registerProfile('displayName')}
                  className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600"
                />
                {profileErrors.displayName && (
                  <p className="text-red-400 text-sm mt-1">{profileErrors.displayName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...registerProfile('email')}
                  className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600"
                />
                {profileErrors.email && (
                  <p className="text-red-400 text-sm mt-1">{profileErrors.email.message}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="mt-4"
                disabled={updateLoading}
              >
                {updateLoading ? 'Mise à jour...' : 'Mettre à jour le profil'}
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="flex items-center text-primary hover:underline"
              >
                <FaKey className="mr-2" />
                {showPasswordForm ? 'Annuler' : 'Changer de mot de passe'}
              </button>
              
              {showPasswordForm && (
                <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="space-y-4 mt-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                      Mot de passe actuel
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      {...registerPassword('currentPassword')}
                      className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-red-400 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      {...registerPassword('newPassword')}
                      className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600"
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-red-400 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      {...registerPassword('confirmPassword')}
                      className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    className="mt-4"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? 'Modification...' : 'Modifier le mot de passe'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-gray-800/40 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Mon compte</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Membre depuis</p>
                <p>{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '-'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Type de compte</p>
                <p>{userData?.isAdmin ? 'Administrateur' : 'Utilisateur'}</p>
              </div>
              
              <Button
                variant="destructive"
                className="w-full mt-4"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="mr-2" />
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getDatabase, ref, get, update, set } from 'firebase/database';
import { db, auth } from '@/lib/firebase';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Button } from '@/components/ui/Button';
import { FaUser, FaSignOutAlt, FaKey, FaEdit, FaEnvelope, FaLock, FaSave, FaSpinner, FaUserEdit, FaCheck } from 'react-icons/fa';
import { User } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { FormEvent } from 'react';

// Schéma de validation pour le profil
const profileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  image: z.string().url('URL invalide').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Schéma de validation pour le changement de mot de passe
const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Le mot de passe actuel doit contenir au moins 6 caractères'),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string().min(6, 'La confirmation du mot de passe doit contenir au moins 6 caractères'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

// Étendre le type User pour inclure les nouvelles propriétés
interface ExtendedUser extends User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  isAdmin?: boolean;
  password?: string;
  updatedAt?: number;
}

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
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
            const data = snapshot.val() as ExtendedUser;
            setUserData(data);
            // Pré-remplir le formulaire
            setValue('name', data.name || '');
            setValue('email', data.email || '');
            setValue('image', data.image || '');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
          setError('Erreur lors de la récupération des données utilisateur');
        } finally {
          setLoading(false);
        }
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session, setValue]);

  // Mettre à jour les champs du formulaire quand les données utilisateur sont chargées
  useEffect(() => {
    if (userData) {
      const form = document.getElementById('profile-form') as HTMLFormElement;
      if (form) {
        const nameElement = form.elements.namedItem('name');
        const emailElement = form.elements.namedItem('email');
        const imageElement = form.elements.namedItem('image');
        
        if (nameElement && 'value' in nameElement) {
          nameElement.value = userData.name || '';
        }
        
        if (emailElement && 'value' in emailElement) {
          emailElement.value = userData.email || '';
        }
        
        if (imageElement && 'value' in imageElement) {
          imageElement.value = userData.image || '';
        }
      }
    }
  }, [userData]);

  const onSubmit = async (data: ProfileFormValues) => {
    setError(null);
    setSuccess(null);
    setUpdating(true);

    try {
      const userRef = ref(db, `users/${session?.user?.id}`);
      
      // Mettre à jour les données utilisateur dans Firebase
      await update(userRef, {
        name: data.name,
        email: data.email,
        image: data.image || '',
        updatedAt: Date.now()
      });
      
      // Mettre à jour la session
      await updateSession({
        user: {
          name: data.name,
          email: data.email,
          image: data.image || '',
        }
      });
      
      setSuccess('Profil mis à jour avec succès');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setPasswordError(null);
    setPasswordSuccess(null);
    setChangingPassword(true);

    try {
      const userRef = ref(db, `users/${session?.user?.id}`);
      
      // Vérifier le mot de passe actuel (ceci est simpliste et non sécurisé)
      const snapshot = await get(userRef);
      const userData = snapshot.val() as ExtendedUser;
      
      if (userData.password !== data.currentPassword) {
        setPasswordError('Mot de passe actuel incorrect');
        setChangingPassword(false);
        return;
      }
      
      // Mettre à jour le mot de passe
      await update(userRef, {
        password: data.newPassword,
        updatedAt: Date.now()
      });
      
      setPasswordSuccess('Mot de passe mis à jour avec succès');
      resetPassword();
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError('Erreur lors du changement de mot de passe');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-screen">
        <div className="animate-spin text-primary">
          <FaSpinner size={40} />
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Redirection gérée par useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-dark-card-color rounded-lg shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FaUserEdit className="text-primary" />
            Modifier mon profil
          </h2>
          
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-md p-4 mb-4 text-red-200">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-900/30 border border-green-800 rounded-md p-4 mb-4 text-green-200 flex items-center gap-2">
              <FaCheck />
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-white text-sm font-medium">Nom</label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-white text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="image" className="block text-white text-sm font-medium">URL de l'image de profil (optionnel)</label>
              <input
                id="image"
                type="text"
                {...register('image')}
                className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="https://exemple.com/photo.jpg"
              />
              {errors.image && <p className="text-red-400 text-sm mt-1">{errors.image.message}</p>}
            </div>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updating}
            >
              {updating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mise à jour...
                </span>
              ) : (
                'Mettre à jour le profil'
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-dark-card-color rounded-lg shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FaKey className="text-primary" />
            Changer de mot de passe
          </h2>
          
          {passwordError && (
            <div className="bg-red-900/30 border border-red-800 rounded-md p-4 mb-4 text-red-200">
              {passwordError}
            </div>
          )}
          
          {passwordSuccess && (
            <div className="bg-green-900/30 border border-green-800 rounded-md p-4 mb-4 text-green-200 flex items-center gap-2">
              <FaCheck />
              {passwordSuccess}
            </div>
          )}
          
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="block text-white text-sm font-medium">Mot de passe actuel</label>
              <input
                id="currentPassword"
                type="password"
                {...registerPassword('currentPassword')}
                className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {passwordErrors.currentPassword && <p className="text-red-400 text-sm mt-1">{passwordErrors.currentPassword.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-white text-sm font-medium">Nouveau mot de passe</label>
              <input
                id="newPassword"
                type="password"
                {...registerPassword('newPassword')}
                className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {passwordErrors.newPassword && <p className="text-red-400 text-sm mt-1">{passwordErrors.newPassword.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-white text-sm font-medium">Confirmer le nouveau mot de passe</label>
              <input
                id="confirmPassword"
                type="password"
                {...registerPassword('confirmPassword')}
                className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {passwordErrors.confirmPassword && <p className="text-red-400 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>}
            </div>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={changingPassword}
            >
              {changingPassword ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mise à jour...
                </span>
              ) : (
                'Changer le mot de passe'
              )}
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-8 bg-dark-card-color rounded-lg shadow-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <FaSignOutAlt className="text-red-500" />
          Se déconnecter
        </h2>
        <p className="mb-6">Vous souhaitez vous déconnecter de votre compte ?</p>
        <button
          onClick={handleLogout}
          className="btn btn-danger"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
} 
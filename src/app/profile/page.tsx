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

  if (status === 'loading' || loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Redirection gérée par useEffect
  }

  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="auth-container max-w-full">
          <h2 className="mb-6 flex items-center gap-2">
            <FaUserEdit className="text-primary" />
            Modifier mon profil
          </h2>
          
          {error && (
            <div className="form-message form-message-error">
              {error}
            </div>
          )}
          
          {success && (
            <div className="form-message form-message-success flex items-center gap-2">
              <FaCheck />
              {success}
            </div>
          )}
          
          <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Nom</label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="form-input"
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="form-input"
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="image" className="form-label">URL de l'image de profil (optionnel)</label>
              <input
                id="image"
                type="url"
                {...register('image')}
                className="form-input"
                placeholder="https://exemple.com/image.jpg"
              />
              {errors.image && <p className="form-error">{errors.image.message}</p>}
            </div>
            
            <button
              type="submit"
              className="auth-submit"
              disabled={updating}
            >
              {updating ? (
                <span className="flex items-center gap-2">
                  <div className="loading-spinner w-5 h-5"></div>
                  Mise à jour...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FaSave />
                  Mettre à jour le profil
                </span>
              )}
            </button>
          </form>
        </div>
        
        <div className="auth-container max-w-full">
          <h2 className="mb-6 flex items-center gap-2">
            <FaKey className="text-primary" />
            Changer de mot de passe
          </h2>
          
          {passwordError && (
            <div className="form-message form-message-error">
              {passwordError}
            </div>
          )}
          
          {passwordSuccess && (
            <div className="form-message form-message-success flex items-center gap-2">
              <FaCheck />
              {passwordSuccess}
            </div>
          )}
          
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="auth-form">
            <div className="form-group">
              <label htmlFor="currentPassword" className="form-label">Mot de passe actuel</label>
              <input
                id="currentPassword"
                type="password"
                {...registerPassword('currentPassword')}
                className="form-input"
              />
              {passwordErrors.currentPassword && <p className="form-error">{passwordErrors.currentPassword.message}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">Nouveau mot de passe</label>
              <input
                id="newPassword"
                type="password"
                {...registerPassword('newPassword')}
                className="form-input"
              />
              {passwordErrors.newPassword && <p className="form-error">{passwordErrors.newPassword.message}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
              <input
                id="confirmPassword"
                type="password"
                {...registerPassword('confirmPassword')}
                className="form-input"
              />
              {passwordErrors.confirmPassword && <p className="form-error">{passwordErrors.confirmPassword.message}</p>}
            </div>
            
            <button
              type="submit"
              className="auth-submit"
              disabled={changingPassword}
            >
              {changingPassword ? (
                <span className="flex items-center gap-2">
                  <div className="loading-spinner w-5 h-5"></div>
                  Changement en cours...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FaLock />
                  Changer le mot de passe
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 
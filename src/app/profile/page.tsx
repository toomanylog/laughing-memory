'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ref, get, update } from 'firebase/database';
import { db, auth } from '@/lib/firebase';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Button } from '@/components/ui/Button';
import { FaUser, FaSignOutAlt, FaKey, FaEdit, FaEnvelope, FaLock, FaSave, FaSpinner } from 'react-icons/fa';
import { User } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { FormEvent } from 'react';

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
  const [currentPassword, setCurrentPassword] = useState('');

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError('');
    setSuccessMessage('');
    
    if (!auth.currentUser || !userData) {
      setError('Utilisateur non authentifié');
      setUpdateLoading(false);
      return;
    }

    try {
      const form = e.target as HTMLFormElement;
      const name = form.elements.namedItem('displayName') as HTMLInputElement;
      const email = form.elements.namedItem('email') as HTMLInputElement;
      const newPassword = form.elements.namedItem('newPassword') as HTMLInputElement;

      // Mettre à jour le nom dans Realtime Database
      if (name && name.value !== userData.displayName && session?.user?.id) {
        const userRef = ref(db, `users/${session.user.id}`);
        await update(userRef, {
          displayName: name.value
        });
        setUserData({
          ...userData,
          displayName: name.value
        });
      }

      // Mettre à jour l'email et/ou le mot de passe
      if ((email && email.value !== auth.currentUser.email) || 
          (newPassword && newPassword.value)) {
        
        if (!currentPassword) {
          setError("Mot de passe actuel requis pour modifier l'email ou le mot de passe");
          setUpdateLoading(false);
          return;
        }

        // Réauthentifier l'utilisateur avant de modifier l'email ou le mot de passe
        if (auth.currentUser.email) {
          const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
          await reauthenticateWithCredential(auth.currentUser, credential);
          
          // Mettre à jour l'email
          if (email && email.value !== auth.currentUser.email && session?.user?.id) {
            await updateEmail(auth.currentUser, email.value);
            
            // Mettre à jour les données dans la DB
            const userRef = ref(db, `users/${session.user.id}`);
            await update(userRef, {
              email: email.value
            });
          }
          
          // Mettre à jour le mot de passe
          if (newPassword && newPassword.value) {
            await updatePassword(auth.currentUser, newPassword.value);
          }
        }
      }

      setSuccessMessage('Profil mis à jour avec succès');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setUpdateLoading(false);
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
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto bg-dark rounded-lg shadow-xl overflow-hidden">
        <div className="bg-primary p-6 text-white">
          <h1 className="text-2xl font-bold">Profil Utilisateur</h1>
          <p className="text-sm opacity-80">Gérez vos informations personnelles</p>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded text-red-300">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-500 rounded text-green-300">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="displayName" className="block text-gray-300 mb-2 text-sm font-medium">
                  <FaUser className="inline mr-2" /> Nom
                </label>
                <input
                  type="text"
                  id="displayName"
                  defaultValue={userData?.displayName || ''}
                  className="form-input"
                  placeholder="Votre nom"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-300 mb-2 text-sm font-medium">
                  <FaEnvelope className="inline mr-2" /> Email
                </label>
                <input
                  type="email"
                  id="email"
                  defaultValue={auth.currentUser?.email || ''}
                  className="form-input"
                  placeholder="votre@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="currentPassword" className="block text-gray-300 mb-2 text-sm font-medium">
                  <FaLock className="inline mr-2" /> Mot de passe actuel
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-input"
                  placeholder="Requis pour changer l'email ou le mot de passe"
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-gray-300 mb-2 text-sm font-medium">
                  <FaLock className="inline mr-2" /> Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="form-input"
                  placeholder="Laissez vide pour ne pas changer"
                />
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Mise à jour en cours...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Mettre à jour le profil
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { FaSignInAlt, FaUserPlus, FaUser, FaEnvelope, FaLock, FaCheckCircle } from 'react-icons/fa';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import { signIn } from 'next-auth/react';

// Schéma de validation
const signupSchema = z.object({
  displayName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    setError('');

    try {
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      const user = userCredential.user;
      
      // Mettre à jour le profil avec le nom d'affichage
      await updateProfile(user, {
        displayName: data.displayName,
      });
      
      // Créer l'entrée utilisateur dans la base de données
      await set(ref(db, `users/${user.uid}`), {
        uid: user.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: user.photoURL || null,
        isAdmin: false,
        createdAt: Date.now()
      });

      // Connecter l'utilisateur
      await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      
      router.push(window.location.origin);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé');
      } else {
        setError('Une erreur est survenue lors de l\'inscription');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-dark-card-color rounded-lg shadow-lg p-8 border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center">Créer un compte</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium mb-2 text-white">
              Nom d'utilisateur
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaUser />
              </span>
              <input
                id="displayName"
                type="text"
                {...register('displayName')}
                className="w-full pl-10 pr-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Votre nom"
              />
            </div>
            {errors.displayName && (
              <p className="text-red-400 text-sm mt-2">{errors.displayName.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaEnvelope />
              </span>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full pl-10 pr-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="votre@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-2">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-white">
              Mot de passe
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaLock />
              </span>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="w-full pl-10 pr-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-2">{errors.password.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-white">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaCheckCircle />
              </span>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="w-full pl-10 pr-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-2">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full py-3 mt-4"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription en cours...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FaUserPlus className="mr-2" />
                S'inscrire
              </span>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-300">
            Déjà inscrit ?
          </p>
          <Link href="/auth/signin" className="btn btn-outline w-full mt-3 flex items-center justify-center">
            <FaSignInAlt className="mr-2" />
            <span>Se connecter</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 
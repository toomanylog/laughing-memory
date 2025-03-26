'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { FaUserPlus, FaKey, FaSignInAlt } from 'react-icons/fa';

// Schéma de validation
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-dark-card-color rounded-lg shadow-lg p-8 border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center">Connexion</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
              <input
                id="password"
                type="password"
                {...register('password')}
                className="w-full px-4 py-3 bg-dark-light-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-2">{errors.password.message}</p>
            )}
            <div className="mt-2 text-right">
              <Link href="/auth/reset-password" className="text-primary hover:underline text-sm">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full py-3"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion en cours...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FaSignInAlt className="mr-2" />
                Se connecter
              </span>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-300">
            Pas encore de compte ?
          </p>
          <Link href="/auth/signup" className="btn btn-outline w-full mt-3 flex items-center justify-center">
            <FaUserPlus className="mr-2" />
            <span>S'inscrire</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 
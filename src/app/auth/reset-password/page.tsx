'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { FaSignInAlt, FaEnvelope, FaPaperPlane, FaUserPlus } from 'react-icons/fa';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Schéma de validation
const resetSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await sendPasswordResetEmail(auth, data.email);
      setSuccess('Un email de réinitialisation a été envoyé à votre adresse email.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Aucun compte n\'est associé à cet email');
      } else {
        setError('Une erreur est survenue lors de l\'envoi de l\'email de réinitialisation');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-dark-card-color rounded-lg shadow-lg p-8 border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center">Réinitialiser le mot de passe</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                Envoi en cours...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FaPaperPlane className="mr-2" />
                Envoyer le lien de réinitialisation
              </span>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <div className="flex flex-col space-y-4">
            <div>
              <p className="text-gray-300 mb-2">
                Vous vous souvenez de votre mot de passe ?
              </p>
              <Link href="/auth/signin" className="btn btn-outline w-full flex items-center justify-center">
                <FaSignInAlt className="mr-2" />
                <span>Se connecter</span>
              </Link>
            </div>
            
            <div>
              <p className="text-gray-300 mb-2">
                Pas encore de compte ?
              </p>
              <Link href="/auth/signup" className="btn btn-outline w-full flex items-center justify-center">
                <FaUserPlus className="mr-2" />
                <span>S'inscrire</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
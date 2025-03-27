import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Types de formulaires disponibles
type FormType = 'login' | 'register';

const AuthPage: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer l'URL de redirection s'il y en a une
  const from = (location.state as { from?: string })?.from || '/';
  
  // État du formulaire
  const [formType, setFormType] = useState<FormType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Validation du formulaire
  const validateForm = (): boolean => {
    setError(null);
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs requis');
      return false;
    }
    
    if (!email.includes('@')) {
      setError('Veuillez saisir une adresse email valide');
      return false;
    }
    
    if (formType === 'register' && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    
    return true;
  };
  
  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (formType === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      
      // Rediriger l'utilisateur
      navigate(from);
    } catch (err: any) {
      console.error('Erreur d\'authentification:', err);
      
      // Gestion des messages d'erreur Firebase
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email ou mot de passe incorrect');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Cette adresse email est déjà utilisée');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Basculer entre les formulaires de connexion et d'inscription
  const toggleFormType = () => {
    setError(null);
    setFormType(formType === 'login' ? 'register' : 'login');
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            {formType === 'login' ? 'Connexion' : 'Inscription'}
          </h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            
            {formType === 'register' && (
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            )}
            
            <div className="mb-6">
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Chargement...' : formType === 'login' ? 'Se connecter' : 'S\'inscrire'}
              </button>
            </div>
          </form>
          
          <div className="text-center">
            <button
              onClick={toggleFormType}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              {formType === 'login' 
                ? 'Pas encore de compte ? Inscrivez-vous' 
                : 'Déjà un compte ? Connectez-vous'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 
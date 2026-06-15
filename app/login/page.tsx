'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Wallet, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Welcome state on signup success
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeEmail, setWelcomeEmail] = useState('');
  const [countdownStarted, setCountdownStarted] = useState(false);

  // Redirect if user is already logged in (but not if showing welcome screen)
  useEffect(() => {
    if (!authLoading && user && !showWelcome) {
      router.push('/overview');
    }
  }, [user, authLoading, router, showWelcome]);

  // Handle welcome countdown and redirect
  useEffect(() => {
    if (showWelcome) {
      setTimeout(() => setCountdownStarted(true), 50);
      const timer = setTimeout(() => {
        router.push('/overview');
      }, 4050);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, router]);

  const validateEmail = (emailStr: string) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic Validations
    if (!email || !password) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Veuillez saisir une adresse e-mail valide.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up workflow - call RPC bypass to bypass email rate limit
        const { data, error: signUpError } = await supabase.rpc('signup_user_bypass_email', {
          user_email: email,
          user_password: password,
        });

        if (signUpError) throw signUpError;

        const res = data as { success: boolean; message: string; user_id?: string };
        if (!res.success) {
          throw new Error(res.message);
        }

        // Auto login the newly created user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        setSuccess('Votre compte a été créé avec succès !');
        setWelcomeEmail(email);
        setShowWelcome(true);
      } else {
        // Sign In workflow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        setSuccess('Connexion réussie. Redirection...');
        setTimeout(() => {
          router.push('/overview');
        }, 1000);
      }
    } catch (err: unknown) {
      console.error('Auth action error:', err);
      const errorDetails = err as { message?: string };
      let errorMsg = errorDetails?.message || 'Une erreur est survenue lors de l\'authentification.';
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = 'Identifiants de connexion invalides.';
      } else if (errorMsg.includes('User already registered')) {
        errorMsg = 'Cette adresse e-mail est déjà utilisée.';
      } else if (errorMsg.includes('Email not confirmed')) {
        errorMsg = 'Veuillez confirmer votre adresse e-mail avant de vous connecter.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (user && !showWelcome)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F6]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500 tracking-wide">Chargement...</span>
        </div>
      </div>
    );
  }

  // Welcome page screen
  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-4 md:p-6 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-2xl p-10 z-10 text-center animate-scale-in">
          {/* Glowing Sparkles Icon */}
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-purple-500 text-white shadow-xl shadow-primary/25 mx-auto mb-6 relative animate-bounce">
            <Sparkles className="w-10 h-10" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-400 rounded-full animate-ping" />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Bienvenue sur zdmsFacture !
          </h2>
          <p className="text-sm text-slate-500 font-semibold mb-6">
            Votre compte ({welcomeEmail}) est maintenant configuré.
          </p>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mb-8 text-left space-y-3 animate-fade-in-up">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              Vos premiers pas :
            </p>
            <ul className="text-xs text-slate-600 font-medium space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Configurez vos coordonnées dans les paramètres de l&apos;entreprise.</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Enregistrez vos premiers clients en RDC.</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Générez des factures professionnelles en USD/CDF avec TVA.</span>
              </li>
            </ul>
          </div>

          {/* Action button */}
          <button
            onClick={() => router.push('/overview')}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-md shadow-primary/20 hover:scale-[1.01] hover:translate-y-[-1px] group"
          >
            <span>Accéder au Tableau de Bord</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Autoredirect timer visual bar */}
          <div className="mt-8 flex flex-col items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              Redirection automatique...
            </span>
            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-[4000ms] ease-out" 
                style={{ width: countdownStarted ? '100%' : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-4 md:p-6 overflow-hidden relative">
      {/* Decorative blurred circles for background ambient */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-2xl p-8 z-10 transition-all duration-300 hover:shadow-primary/5">
        
        {/* App Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 text-white shadow-lg shadow-primary/20 mb-4 transform hover:scale-105 duration-300">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            zdmsFacture
          </h1>
          <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase mt-1">
            Logiciel SaaS de Facturation Premium
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
              !isSignUp
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
              isSignUp
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-medium animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-medium">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Adresse E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="block w-full pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password input (only for sign up) */}
          {isSignUp && (
            <div className="space-y-1.5 animate-scale-in">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed hover:translate-y-[-1px]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSignUp ? (
              'Créer un compte'
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Support context indicator */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Propulsé par la République Démocratique du Congo
          </p>
        </div>

      </div>
    </div>
  );
}

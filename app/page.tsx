'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  FileText,
  ArrowRight,
  Play,
  ShieldCheck,
  Lock,
  Wallet,
  Ban,
  Calculator,
  Clock,
  Percent,
  TrendingUp,
  Users,
  CheckCircle2,
  Rocket,
  Globe,
  Smartphone,
  Mail,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import './landing.css';

export default function LandingPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();
  
  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sticky header transition state on scroll
  const [scrolled, setScrolled] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Monitor scroll for header shrinking and glassmorphism updates
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reveal Animations on Scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.05,
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => revealObserver.observe(el));

    return () => {
      elements.forEach((el) => revealObserver.unobserve(el));
    };
  }, []);

  // Magnetic Button Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'translate(0, 0)';
  };

  // Smooth scroll
  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Newsletter submission handler
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setNewsletterStatus('success');
      setToastMessage('Merci ! Votre inscription à notre newsletter a été enregistrée avec succès.');
      setShowToast(true);
      setNewsletterEmail('');
      
      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }, 1200);
  };

  return (
    <div className="font-sans overflow-x-hidden bg-[#F9F9FC] text-[#1E1B4B] min-h-screen">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#7C3AED] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up border border-[#EDE9FE]/20">
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="text-sm font-semibold">{toastMessage}</span>
          <button 
            onClick={() => setShowToast(false)} 
            className="ml-3 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navigation - height, padding, shadow, border adapt dynamically on scroll */}
      <header className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'py-3 bg-white/95 shadow-md border-b border-slate-100' 
          : 'py-5 bg-white/80 backdrop-blur-md border-b border-slate-100/50'
      }`}>
        <nav className="flex justify-between items-center px-6 max-w-7xl mx-auto">
          {/* Logo with rotation and elevation hover micro-animation */}
          <Link href={user ? "/overview" : "/"} className="flex items-center gap-2 group logo-animate">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center shadow-md shadow-[#7C3AED]/25 logo-icon-wrapper">
              <FileText className="w-6 h-6 text-white logo-icon" />
            </div>
            <span className="font-display text-2xl font-black tracking-tight text-[#1E1B4B]">
              zdms<span className="text-[#7C3AED]">Facture</span>
            </span>
          </Link>

          {/* Desktop Navigation Links - slide line animation nav-link-effect */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              className="text-slate-600 hover:text-[#7C3AED] transition-colors duration-300 font-semibold text-sm nav-link-effect" 
              href="#solution"
              onClick={(e) => handleScrollToSection(e, 'solution')}
            >
              Solution
            </a>
            <a 
              className="text-slate-600 hover:text-[#7C3AED] transition-colors duration-300 font-semibold text-sm nav-link-effect" 
              href="#tarifs"
              onClick={(e) => handleScrollToSection(e, 'tarifs')}
            >
              Tarifs
            </a>
            <a 
              className="text-slate-600 hover:text-[#7C3AED] transition-colors duration-300 font-semibold text-sm nav-link-effect" 
              href="#temoignages"
              onClick={(e) => handleScrollToSection(e, 'temoignages')}
            >
              Témoignages
            </a>
            <a 
              className="text-slate-600 hover:text-[#7C3AED] transition-colors duration-300 font-semibold text-sm nav-link-effect" 
              href="#footer"
              onClick={(e) => handleScrollToSection(e, 'footer')}
            >
              Contact
            </a>
          </div>

          {/* Auth Action Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            {authLoading ? (
              <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <Link 
                href="/overview"
                className="bg-[#7C3AED] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#6D28D9] transition-colors shadow-lg shadow-[#7C3AED]/15"
              >
                Tableau de Bord
              </Link>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="text-slate-600 font-semibold text-sm hover:text-[#7C3AED] transition-colors px-4 py-2 nav-link-effect"
                >
                  Connexion
                </Link>
                <Link 
                  href="/login?mode=signup"
                  className="bg-[#7C3AED] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#6D28D9] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#7C3AED]/15 cta-shadow-pulse"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-[#7C3AED] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 animate-scale-in" /> : <Menu className="w-6 h-6 animate-scale-in" />}
          </button>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-6 py-6 absolute top-full left-0 w-full shadow-xl animate-fade-in-up">
            <div className="flex flex-col gap-5">
              <a 
                className="text-slate-700 hover:text-[#7C3AED] transition-colors font-semibold py-2 border-b border-slate-50" 
                href="#solution"
                onClick={(e) => handleScrollToSection(e, 'solution')}
              >
                Solution
              </a>
              <a 
                className="text-slate-700 hover:text-[#7C3AED] transition-colors font-semibold py-2 border-b border-slate-50" 
                href="#tarifs"
                onClick={(e) => handleScrollToSection(e, 'tarifs')}
              >
                Tarifs
              </a>
              <a 
                className="text-slate-700 hover:text-[#7C3AED] transition-colors font-semibold py-2 border-b border-slate-50" 
                href="#temoignages"
                onClick={(e) => handleScrollToSection(e, 'temoignages')}
              >
                Témoignages
              </a>
              <a 
                className="text-slate-700 hover:text-[#7C3AED] transition-colors font-semibold py-2 border-b border-slate-50" 
                href="#footer"
                onClick={(e) => handleScrollToSection(e, 'footer')}
              >
                Contact
              </a>

              <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                {user ? (
                  <Link 
                    href="/overview"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center bg-[#7C3AED] text-white py-3 rounded-xl font-semibold hover:bg-[#6D28D9] transition-colors"
                  >
                    Tableau de Bord
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center text-slate-700 font-semibold py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Connexion
                    </Link>
                    <Link 
                      href="/login?mode=signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center bg-[#7C3AED] text-white py-3 rounded-xl font-semibold hover:bg-[#6D28D9] transition-colors"
                    >
                      Créer un compte
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="gradient-mesh">
        {/* Hero Section */}
        <section className="relative pt-12 md:pt-20 pb-24 md:pb-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="reveal active flex flex-col items-start text-left">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] font-semibold text-xs tracking-wider uppercase mb-6 animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} /> Faites-vous payer immédiatement
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 leading-[1.1] font-black text-[#1E1B4B] tracking-tight">
              Fini les factures sur <span className="text-[#7C3AED] relative inline-block">Word <span className="absolute bottom-1 left-0 w-full h-[6px] bg-[#7C3AED]/15 rounded-full"></span></span> et <span className="text-[#7C3AED] relative inline-block">Excel <span className="absolute bottom-1 left-0 w-full h-[6px] bg-[#7C3AED]/15 rounded-full"></span></span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
              Le SaaS de facturation simple, fluide et moderne conçu spécifiquement pour les entrepreneurs et entreprises d&apos;Afrique en quête de professionnalisme.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => router.push(user ? "/overview" : "/login?mode=signup")}
                className="magnetic-btn bg-[#1E1B4B] text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 group shadow-xl hover:bg-slate-900 transition-all cursor-pointer w-full sm:w-auto cta-shadow-pulse"
              >
                {user ? "Accéder au Tableau de Bord" : "Commencer gratuitement"}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button 
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => router.push(user ? "/overview" : "/login")}
                className="magnetic-btn border-[1.5px] border-slate-200 text-[#1E1B4B] px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#7C3AED]/5 hover:border-[#7C3AED]/30 transition-colors cursor-pointer w-full sm:w-auto"
              >
                Voir la démo
                <Play className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 grayscale opacity-60">
              <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Approuvé par la sécurité</span>
              <div className="flex gap-4">
                <ShieldCheck className="w-6 h-6 text-slate-700" />
                <Lock className="w-6 h-6 text-slate-700" />
                <Wallet className="w-6 h-6 text-slate-700" />
              </div>
            </div>
          </div>

          <div className="relative reveal active delay-200 w-full">
            {/* Dashboard Mock Screen Container */}
            <div className="relative z-10 rounded-[32px] overflow-hidden floating-card aspect-[4/3] bg-white border border-slate-200/50 p-3 sm:p-4 shadow-2xl">
              <img 
                alt="Dashboard zdmsFacture" 
                className="w-full h-full object-cover rounded-2xl shadow-inner border border-slate-100" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7-XCVcO24T0rR_GtLeqHb8ts3nbXgaY1SR8-uXLO3CQtPkyfxetBOYgzxCazmramZtCExWLl04H-ZGMm4gem7H8Gudiqmbf2GG3Garb8Wl37HXKeKJqWxY7UIcJrwdt7N3FMqEbLiIHYl16H81k3qsFtbsvhEB3h-zwiCClVP2N9yPa48LuXPFY0n00vs76MJpHgmwBXGnyn1ufcFTdkjHTk0GC4tHWZ3qrEv8ZYIngJ4iJu8ZlTHpFkKYtgf5ZxqQ2f59AESrSdR" 
              />
            </div>

            {/* Glowing Orbs */}
            <div className="absolute -top-12 -right-8 w-32 sm:w-48 h-32 sm:h-48 bg-[#7C3AED]/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-8 w-48 sm:w-64 h-48 sm:h-64 bg-[#7C3AED]/8 rounded-full blur-[90px]"></div>
            
            {/* Floating Widget - hidden on small screens */}
            <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 hidden md:block z-20">
              <div className="bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 flex flex-col gap-1.5 transition-transform hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Paiement reçu</p>
                    <p className="font-display font-black text-emerald-600 text-lg">+150 000 CDF</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-20 sm:py-24 px-6 bg-slate-100/40">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 sm:mb-20 reveal">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-[#1E1B4B]">
                Pourquoi choisir <span className="text-[#7C3AED]">zdmsFacture</span> ?
              </h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                L&apos;époque des factures Word mal alignées et des erreurs de calcul est révolue. Passez à la vitesse supérieure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Problem 1 */}
              <div className="reveal p-6 sm:p-8 rounded-[32px] bg-white border border-slate-100 floating-card flex flex-col items-start">
                <div className="w-14 h-14 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                  <Ban className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold mb-4 text-[#1E1B4B]">Factures &quot;Amateur&quot;</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Arrêtez d&apos;envoyer des fichiers Word pixelisés ou décalés. Votre image de marque mérite une présentation A4 impeccable qui inspire confiance instantanément.
                </p>
              </div>

              {/* Problem 2 */}
              <div className="reveal delay-100 p-6 sm:p-8 rounded-[32px] bg-white border border-slate-100 floating-card flex flex-col items-start">
                <div className="w-14 h-14 bg-[#7C3AED]/10 text-[#7C3AED] rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                  <Calculator className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold mb-4 text-[#1E1B4B]">Erreurs de TVA</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Les calculs manuels de la TVA fiscale de 18% (ou autres taxes) sont des sources d&apos;erreurs coûteuses. Automatisez vos sous-totaux et taxes instantanément.
                </p>
              </div>

              {/* Problem 3 */}
              <div className="reveal delay-200 p-6 sm:p-8 rounded-[32px] bg-white border border-slate-100 floating-card flex flex-col items-start">
                <div className="w-14 h-14 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold mb-4 text-[#1E1B4B]">Impayés Invisibles</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Difficile de savoir qui vous doit quoi avec un simple fichier Excel. Suivez chaque créance, identifiez les retards et agissez rapidement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid Section */}
        <section className="py-20 sm:py-24 px-6 max-w-7xl mx-auto" id="solution">
          <div className="text-center mb-16 sm:mb-20 reveal">
            <span className="text-[#7C3AED] font-semibold tracking-wider text-xs uppercase mb-4 block">Fonctionnalités</span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E1B4B]">Tout ce dont vous avez besoin</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 reveal">
            {/* Bento Card 1 (Large - spans 2 cols & 2 rows on medium+) */}
            <div className="md:col-span-2 md:row-span-2 p-8 sm:p-12 rounded-[40px] bg-[#1E1B4B] text-white overflow-hidden relative group flex flex-col justify-between min-h-[380px] hover:shadow-2xl transition-all duration-300">
              <div className="relative z-10">
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold mb-6 leading-tight">Factures professionnelles en 2 clics</h3>
                <p className="opacity-75 text-base sm:text-lg mb-8 leading-relaxed">
                  Générez des PDF élégants conformes aux normes de la RDC et internationales. Votre identité, vos devises (USD & CDF), votre succès.
                </p>
              </div>
              <div className="mt-auto relative z-10">
                <button 
                  onClick={() => router.push(user ? "/invoices/new" : "/login?mode=signup")}
                  className="inline-flex items-center gap-2 font-semibold text-sm text-white hover:text-[#7C3AED] transition-colors group-hover:gap-4 cursor-pointer"
                >
                  Découvrir l&apos;éditeur <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              
              {/* Giant Background Icon Deco */}
              <div className="absolute bottom-0 right-0 w-1/2 opacity-15 transform translate-y-12 translate-x-12 group-hover:translate-y-6 group-hover:translate-x-6 transition-transform duration-700 select-none">
                <FileText className="w-[300px] h-[300px]" />
              </div>
            </div>

            {/* Bento Card 2 (Spans 2 columns on medium+) */}
            <div className="md:col-span-2 p-8 sm:p-10 rounded-[40px] bg-[#EDE9FE]/50 border border-[#EDE9FE] flex flex-col sm:flex-row gap-6 floating-card">
              <div className="w-12 h-12 bg-[#7C3AED]/10 text-[#7C3AED] rounded-2xl flex items-center justify-center shrink-0">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold mb-3 text-[#1E1B4B]">TVA & Double Devise fluides</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Configurez vos taux de taxe et convertissez automatiquement vos montants de Dollars (USD) en Francs Congolais (CDF) selon le taux de change en direct.
                </p>
              </div>
            </div>

            {/* Bento Card 3 (1 column) */}
            <div className="p-8 sm:p-10 rounded-[40px] bg-white border border-slate-100 flex flex-col gap-6 floating-card">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold mb-3 text-[#1E1B4B]">Suivi temps réel</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Graphiques interactifs de revenus, indicateurs de croissance mensuels et de recouvrement sur votre Dashboard.
                </p>
              </div>
            </div>

            {/* Bento Card 4 (1 column - Primary Accent) */}
            <div className="p-8 sm:p-10 rounded-[40px] bg-[#7C3AED] text-white flex flex-col gap-6 floating-card">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold mb-3 text-white">Clients & Paiements</h3>
                <p className="text-white/80 text-xs leading-relaxed">
                  Gerez votre base de clients, enregistrez les règlements Mobile Money (M-Pesa, Orange, Airtel) ou Cash en un seul point.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section - dots pattern moved to CSS class 'how-works-pattern' */}
        <section className="py-24 px-6 bg-[#1E1B4B] text-white relative overflow-hidden how-works-pattern">
          <div className="max-w-7xl mx-auto text-center mb-20 sm:mb-24 reveal">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white">Comment ça marche ?</h2>
            <p className="opacity-60 text-base sm:text-lg mt-4 max-w-lg mx-auto">Plus simple que d&apos;envoyer un paiement Mobile Money.</p>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 relative">
            {/* Steps connection line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[1.5px] bg-[#7C3AED]/35"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center reveal">
              <div className="w-24 h-24 rounded-full bg-[#7C3AED]/10 border-2 border-[#7C3AED] flex items-center justify-center mb-6 sm:mb-8 relative z-10 text-3xl font-extrabold text-[#7C3AED] shadow-lg shadow-[#7C3AED]/20">1</div>
              <h3 className="font-display text-xl sm:text-2xl font-bold mb-4">Créez votre compte</h3>
              <p className="opacity-60 px-4 sm:px-6 text-sm">Inscription rapide en 30 secondes avec votre email. Sans carte bancaire.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center reveal delay-100">
              <div className="w-24 h-24 rounded-full bg-[#7C3AED]/10 border-2 border-[#7C3AED] flex items-center justify-center mb-6 sm:mb-8 relative z-10 text-3xl font-extrabold text-[#7C3AED] shadow-lg shadow-[#7C3AED]/20">2</div>
              <h3 className="font-display text-xl sm:text-2xl font-bold mb-4">Configurez & Créez</h3>
              <p className="opacity-60 px-4 sm:px-6 text-sm">Définissez vos informations d&apos;entreprise, ajoutez vos clients et générez votre première facture.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center reveal delay-200">
              <div className="w-24 h-24 rounded-full bg-[#7C3AED]/10 border-2 border-[#7C3AED] flex items-center justify-center mb-6 sm:mb-8 relative z-10 text-3xl font-extrabold text-[#7C3AED] shadow-lg shadow-[#7C3AED]/20">3</div>
              <h3 className="font-display text-xl sm:text-2xl font-bold mb-4">Envoyez & Suivez</h3>
              <p className="opacity-60 px-4 sm:px-6 text-sm">Exportez en format PDF officiel, encaissez les règlements et suivez l&apos;évolution de vos finances en temps réel.</p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 px-6 max-w-7xl mx-auto overflow-hidden" id="temoignages">
          <div className="mb-16 reveal">
            <span className="text-[#7C3AED] font-semibold tracking-wider text-xs uppercase mb-4 block">Témoignages</span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E1B4B]">Ils nous font confiance</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 reveal">
            {/* Testimonial 1 */}
            <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-slate-100 flex flex-col justify-between floating-card">
              <p className="text-slate-600 italic mb-8 text-sm leading-relaxed">
                &quot;Depuis que j&apos;utilise zdmsFacture, mes clients à Abidjan me paient beaucoup plus rapidement. Mes factures font enfin pro.&quot;
              </p>
              <div className="flex items-center gap-4 border-t border-slate-50 pt-4">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#7C3AED]/10">
                  <img 
                    alt="Koffi" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE3G8fJeEzNdt0eMdUuD8AyUgJu36VflNNr68xruRYAL7q6OO9R4GzfJbMpnDUS7Mx1esenRQSBe_GnU5JTcd49h59EqvHiuLQw20I8O_dmRyJmBY3bpXAwZjGeH6kKCJSmi4dki3vOJQejcMNdN9sFNX8C9SimaQAxeF074CAXXSYZVh6ESdpdIPvJE-2ZcLOsOglhiEtPV_cEMuJawekc_nl1H7q5I9VYPVcNMsDAhbZrBlybQZfl1X7tnBXPkG37FuDwU7Yiq7k" 
                  />
                </div>
                <div>
                  <p className="font-bold text-[#1E1B4B] text-sm">Koffi</p>
                  <p className="text-xs text-slate-500">Abidjan, CIV</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-slate-100 flex flex-col justify-between floating-card">
              <p className="text-slate-600 italic mb-8 text-sm leading-relaxed">
                &quot;L&apos;automatisation du calcul de la TVA et de la double devise USD/CDF m&apos;a évité tellement d&apos;erreurs comptables. Un must-have en RDC.&quot;
              </p>
              <div className="flex items-center gap-4 border-t border-slate-50 pt-4">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#7C3AED]/10">
                  <img 
                    alt="Amadou" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuALxhoTFyCdCMJEUrgfZeBGDDrlpgb8iALPhc5Ihj6g_i44RAXKPeJYr9VvOLHMV8RmfwdtwKdNJwQlX9Nr3_bxgSJ3pm7WgPaixaXaDMpyoE-SGAMWffkPAekMKLp05JLF_3YXPprEgTcDir78aItAS2fUgRCSjqQP-VNCoWk940dXhA6HrOFNLj4DMEE7qdJsP_-p8u3lEEE0RV4gfzXHYVkKxUqolR8r1tjxgLFy0Yj4JEnZoZdKw5O2VqkEztPa6JC-T3Ml_7CY" 
                  />
                </div>
                <div>
                  <p className="font-bold text-[#1E1B4B] text-sm">Amadou</p>
                  <p className="text-xs text-slate-500">Douala, CMR</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-slate-100 flex flex-col justify-between floating-card">
              <p className="text-slate-600 italic mb-8 text-sm leading-relaxed">
                &quot;Interface magnifique, fluide et épurée. On sent que c&apos;est fait pour nous, entrepreneurs qui voulons aller vite au quotidien.&quot;
              </p>
              <div className="flex items-center gap-4 border-t border-slate-50 pt-4">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#7C3AED]/10">
                  <img 
                    alt="Mireille" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3q26dNM6tNei5bK27wBAyDZnEQc12u14Qvbh9yhHbVh1L4qMJPluN48_ooiovJts-vSB1rZo_7kXTkaTjmPwBxFIAJ-szv93Dfpf_0WcEFfiHn-TDBVnustp9kZUuMiKM70ATlXDyQWgiWjMTW-wMkOcSCQWcI3-x3HKN5qkyZ2QJhaoDSo5IjhzB0Kmicoo3y3d6o1yOj61iRNzZaw-9MZUhkgSXfeM0tS9FAwdQ6GjV4iLLJchDGr0R7n8rA756JHS8m1ibL4rw" 
                  />
                </div>
                <div>
                  <p className="font-bold text-[#1E1B4B] text-sm">Mireille</p>
                  <p className="text-xs text-slate-500">Libreville, GAB</p>
                </div>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-slate-100 flex flex-col justify-between floating-card">
              <p className="text-slate-600 italic mb-8 text-sm leading-relaxed">
                &quot;Je gère mes clients à Kinshasa et mes encaissements de règlements sans stress. Le module de paiements mobiles est fantastique.&quot;
              </p>
              <div className="flex items-center gap-4 border-t border-slate-50 pt-4">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#7C3AED]/10">
                  <img 
                    alt="Jean-Paul" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVtWbub5RgVzhUEO9vO2CfEqo0V5t8gbYJzsJtDNCYnTTuEe45qYw2-vFIo3VIfooKQTejfkh15T0aY7tEQKgvcowP_-FheruB24JZLA-t3dgaErjCNKGa48tLBboarDru_JOdrimH0Tt8YBz1_0XO3K0xSamJFI78xPkZ4A1r2Y4pe65TeVp4RP7H5afl8OPtylvbZrc0n6ePhL5hnacDkkaFNsgUMNhkaD6QRllGlJt62UGdeIlXifsenZOA5da0VDYMfcntoQjm" 
                  />
                </div>
                <div>
                  <p className="font-bold text-[#1E1B4B] text-sm">Jean-Paul</p>
                  <p className="text-xs text-slate-500">Kinshasa, DRC</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 sm:py-24 px-6 bg-slate-100/40 relative" id="tarifs">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 sm:mb-20 reveal">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E1B4B]">Des tarifs transparents</h2>
              <p className="text-slate-600 text-base sm:text-lg mt-4 max-w-lg mx-auto">Passez au niveau supérieur sans vous ruiner.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
              {/* Card Basic */}
              <div className="reveal p-6 sm:p-8 rounded-[32px] bg-white border border-slate-100 flex flex-col justify-between floating-card">
                <div>
                  <h3 className="font-display text-2xl font-bold mb-2 text-[#1E1B4B]">Gratuit</h3>
                  <p className="text-slate-400 text-sm mb-6">Pour démarrer en douceur</p>
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-[#1E1B4B]">0 USD</span>
                    <span className="text-slate-500 text-sm">/mois</span>
                  </div>
                  <ul className="flex flex-col gap-4 mb-8">
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" /> 5 factures & devis par mois
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" /> 1 utilisateur unique
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" /> Modèle standard de factures
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => router.push(user ? "/subscriptions" : "/login?mode=signup")}
                  className="w-full py-4 border border-slate-200 rounded-xl font-semibold text-sm hover:bg-[#7C3AED]/5 hover:border-[#7C3AED]/30 text-[#1E1B4B] transition-colors cursor-pointer"
                >
                  {user ? "Vérifier mon plan" : "Choisir ce plan"}
                </button>
              </div>

              {/* Card Pro (Highlighted) */}
              <div className="reveal delay-100 p-6 sm:p-8 rounded-[32px] bg-[#1E1B4B] text-white flex flex-col justify-between relative overflow-hidden shadow-2xl scale-100 md:scale-105 z-10 border border-[#7C3AED]/20">
                <div className="absolute top-0 right-0 bg-[#7C3AED] text-white px-5 py-1.5 rounded-bl-2xl font-bold text-[10px] tracking-widest uppercase">
                  Recommandé
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold mb-2">Pro</h3>
                  <p className="opacity-60 text-sm mb-6">Pour les entrepreneurs actifs</p>
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-[#7C3AED]">15 USD</span>
                    <span className="opacity-60 text-sm">/mois</span>
                  </div>
                  <ul className="flex flex-col gap-4 mb-8">
                    <li className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" /> Factures & devis illimités
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" /> Branding personnalisé (Logo, etc.)
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" /> Double devise & Taux automatique
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" /> Support client prioritaire 24/7
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => router.push(user ? "/subscriptions" : "/login?mode=signup")}
                  className="w-full py-4 bg-[#7C3AED] text-white rounded-xl font-semibold text-sm hover:bg-[#6D28D9] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#7C3AED]/20 cursor-pointer"
                >
                  {user ? "S&apos;abonner" : "S&apos;abonner maintenant"}
                </button>
              </div>

              {/* Card Business */}
              <div className="reveal delay-200 p-6 sm:p-8 rounded-[32px] bg-white border border-slate-100 flex flex-col justify-between floating-card">
                <div>
                  <h3 className="font-display text-2xl font-bold mb-2 text-[#1E1B4B]">Business</h3>
                  <p className="text-slate-400 text-sm mb-6">Pour les agences et PME</p>
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-[#1E1B4B]">35 USD</span>
                    <span className="text-slate-500 text-sm">/mois</span>
                  </div>
                  <ul className="flex flex-col gap-4 mb-8">
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" /> Tout en illimité
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" /> Multi-utilisateurs (jusqu&apos;à 5 accès)
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" /> Accès comptable dédié
                    </li>
                    <li className="flex items-center gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" /> Intégration API personnalisée
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => router.push(user ? "/subscriptions" : "/login?mode=signup")}
                  className="w-full py-4 border border-slate-200 rounded-xl font-semibold text-sm hover:bg-[#7C3AED]/5 hover:border-[#7C3AED]/30 text-[#1E1B4B] transition-colors cursor-pointer"
                >
                  {user ? "Négocier" : "Passer en Business"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section - dots pattern moved to CSS class 'cta-dots-pattern' */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto relative rounded-[48px] bg-[#7C3AED] overflow-hidden p-8 sm:p-12 md:p-24 text-center shadow-2xl cta-dots-pattern">
            <div className="relative z-10 reveal">
              <h2 className="font-display text-white text-3xl sm:text-4xl md:text-5xl font-black mb-8 leading-tight max-w-3xl mx-auto">
                Rejoignez les entrepreneurs qui facturent comme des pros
              </h2>
              <p className="text-white/80 text-base sm:text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                Prêt à moderniser la gestion financière de votre entreprise ? Commencez dès aujourd&apos;hui sans frais cachés et augmentez vos encaissements.
              </p>
              <button 
                onClick={() => router.push(user ? "/overview" : "/login?mode=signup")}
                className="bg-white text-[#7C3AED] px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl inline-flex items-center gap-3 cursor-pointer"
              >
                {user ? "Accéder à mon espace" : "Commencer gratuitement"}
                <Rocket className="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 w-full pt-20 pb-12" id="footer">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white">
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-display font-black text-2xl text-[#1E1B4B]">
                zdms<span className="text-[#7C3AED]">Facture</span>
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              La plateforme SaaS de facturation préférée des entrepreneurs africains modernes.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-55 flex items-center justify-center text-slate-500 hover:bg-[#7C3AED] hover:text-white transition-all shadow-sm">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-55 flex items-center justify-center text-slate-500 hover:bg-[#7C3AED] hover:text-white transition-all shadow-sm">
                <Smartphone className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-55 flex items-center justify-center text-slate-500 hover:bg-[#7C3AED] hover:text-white transition-all shadow-sm">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="font-display font-bold text-sm text-[#1E1B4B] mb-6 tracking-wide uppercase">Produit</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-600">
              <li><a className="hover:text-[#7C3AED] transition-colors" href="#solution" onClick={(e) => handleScrollToSection(e, 'solution')}>Solution</a></li>
              <li><a className="hover:text-[#7C3AED] transition-colors" href="#tarifs" onClick={(e) => handleScrollToSection(e, 'tarifs')}>Tarifs</a></li>
              <li><a className="hover:text-[#7C3AED] transition-colors" href="#temoignages" onClick={(e) => handleScrollToSection(e, 'temoignages')}>Témoignages</a></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="font-display font-bold text-sm text-[#1E1B4B] mb-6 tracking-wide uppercase">Entreprise</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-600">
              <li><Link className="hover:text-[#7C3AED] transition-colors" href="/login">Créer un compte</Link></li>
              <li><a className="hover:text-[#7C3AED] transition-colors" href="mailto:contact@bruno.cd">Support technique</a></li>
              <li><a className="hover:text-[#7C3AED] transition-colors" href="#">Politique de Confidentialité</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="font-display font-bold text-sm text-[#1E1B4B] mb-6 tracking-wide uppercase">Newsletter</h4>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Recevez nos conseils de facturation et astuces fiscales pour vos activités.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3">
              <input 
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent focus:bg-white outline-none transition-all placeholder-slate-400" 
                placeholder="Votre adresse email" 
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={newsletterStatus === 'loading'}
              />
              <button 
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="bg-[#1E1B4B] text-white py-3 rounded-xl font-semibold text-sm hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
              >
                {newsletterStatus === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "S&apos;abonner"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-semibold">
          <p>© 2026 zdmsFacture. Fait avec fierté en République Démocratique du Congo.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-[#7C3AED] transition-colors">CGU</a>
            <a href="#" className="hover:text-[#7C3AED] transition-colors">Politique de Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

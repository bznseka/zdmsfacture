'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Check, Sparkles, Zap, Building, Loader2, X, Phone, CheckCircle, AlertCircle, CreditCard, Smartphone, ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { apiFetch } from '@/lib/api-client';
import { useSearchParams, useRouter } from 'next/navigation';

interface PaypalButtonsConfig {
  createSubscription: () => Promise<string>;
  onApprove: (data: { subscriptionID: string }) => Promise<void>;
  onError: (err: unknown) => void;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: PaypalButtonsConfig) => { render: (el: HTMLElement) => void };
    };
  }
}

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  gradient: string;
  popular?: boolean;
}

interface ActiveSubscription {
  planId: string;
  billingPeriod: 'monthly' | 'yearly';
  expiresAt: string;
}

type ModalState = 'closed' | 'method' | 'form' | 'waiting' | 'paypal' | 'success' | 'error';

const plans: Plan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    priceMonthly: 15,
    priceYearly: 12,
    icon: Zap,
    gradient: 'from-blue-500 to-indigo-600',
    features: [
      "Jusqu'à 15 factures par mois",
      'Gestion de 50 clients',
      'Facturation professionnelle en USD',
      '1 utilisateur unique',
      'Support email standard',
    ],
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    priceMonthly: 35,
    priceYearly: 28,
    icon: Sparkles,
    gradient: 'from-primary to-purple-600',
    popular: true,
    features: [
      'Factures & Devis illimités',
      'Nombre de clients illimité',
      'Facturation professionnelle en USD',
      "Jusqu'à 5 utilisateurs collaborateurs",
      'Rapports statistiques avancés',
      'Génération PDF de marque blanche',
      'Support prioritaire 24/7',
    ],
  },
  {
    id: 'plan-business',
    name: 'Business',
    priceMonthly: 79,
    priceYearly: 63,
    icon: Building,
    gradient: 'from-teal-400 to-emerald-600',
    features: [
      'Toutes les fonctionnalités Pro',
      "Nombre d'utilisateurs illimité",
      'Rapprochement bancaire automatique',
      'Intégration API de facturation',
      'Gestionnaire de compte dédié',
      'SLA garanti de 99.9%',
    ],
  },
];

function SubscriptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useApp();

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(
    (searchParams.get('billing') as 'monthly' | 'yearly') || 'monthly'
  );
  const [subscription, setSubscription] = useState<ActiveSubscription | null>(null);

  // État du modal de paiement
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [capturedBilling, setCapturedBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState<'airtel' | 'orange' | 'vodacom'>('airtel');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [stripeBanner, setStripeBanner] = useState<'success' | 'cancelled' | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paypalContainerRef = useRef<HTMLDivElement | null>(null);
  const paypalRenderedFor = useRef<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    const data = await apiFetch<ActiveSubscription | null>('/api/subscriptions/current');
    setSubscription(data);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchSubscription();
  }, [user, fetchSubscription]);

  // Retour depuis Stripe Checkout (?stripe=success|cancelled)
  useEffect(() => {
    const stripeParam = searchParams.get('stripe');
    if (stripeParam === 'success' || stripeParam === 'cancelled') {
      setStripeBanner(stripeParam);
      if (stripeParam === 'success') fetchSubscription();
      router.replace('/subscriptions');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-ouvrir le modal si un plan est passé en URL (?plan=plan-pro)
  useEffect(() => {
    const planId = searchParams.get('plan');
    if (!planId) return;
    const found = plans.find((p) => p.id === planId);
    if (found) openModal(found);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Arrêter le polling au démontage
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  const closeModal = () => {
    stopPolling();
    setModalState('closed');
    setErrorMsg(null);
    setPhone('');
    paypalRenderedFor.current = null;
  };

  const openModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setCapturedBilling(billingPeriod);
    setPhone('');
    setNetwork('airtel');
    setErrorMsg(null);
    setModalState('method');
  };

  const startPolling = useCallback(
    (depId: string, plan: Plan, billing: 'monthly' | 'yearly', userId: string, amount: number) => {
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts++;

        if (attempts > 72) { // 6 minutes max
          stopPolling();
          setModalState('error');
          setErrorMsg('Délai dépassé. Vérifiez votre téléphone puis contactez le support si le montant a été débité.');
          return;
        }

        try {
          const res = await fetch(`/api/payment/status/${depId}`);
          const { status } = await res.json();

          if (status === 'COMPLETED') {
            stopPolling();
            const r = await fetch('/api/payment/activate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ depositId: depId, plan_id: plan.id, billing_period: billing, user_id: userId, amount }),
            });
            if (r.ok) {
              setModalState('success');
              await fetchSubscription();
            } else {
              setModalState('error');
              setErrorMsg("Paiement reçu mais erreur d'activation. Contactez le support.");
            }
          } else if (status === 'FAILED' || status === 'EXPIRED') {
            stopPolling();
            setModalState('error');
            setErrorMsg('Paiement refusé ou expiré. Veuillez réessayer.');
          }
        } catch { /* erreur réseau temporaire, on réessaie */ }
      }, 5000);
    },
    [fetchSubscription]
  );

  const handleSubmit = async () => {
    if (!user || !selectedPlan || !phone.trim()) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    const amount = capturedBilling === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceYearly * 12;

    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          network,
          amount,
          plan_id: selectedPlan.id,
          billing_period: capturedBilling,
          user_id: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Erreur lors de l'initiation du paiement");
        setIsSubmitting(false);
        return;
      }

      setModalState('waiting');
      startPolling(data.depositId, selectedPlan, capturedBilling, user.id, amount);
    } catch {
      setErrorMsg('Erreur réseau. Vérifiez votre connexion et réessayez.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const data = await apiFetch<{ url: string }>('/api/payment/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ planId: selectedPlan.id, billingPeriod: capturedBilling }),
      });
      window.location.href = data.url;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors de la redirection vers Stripe.");
      setIsSubmitting(false);
    }
  };

  const renderPaypalButtons = useCallback(() => {
    if (!selectedPlan || !window.paypal || !paypalContainerRef.current) return;
    const key = `${selectedPlan.id}-${capturedBilling}`;
    if (paypalRenderedFor.current === key) return;
    paypalRenderedFor.current = key;
    paypalContainerRef.current.innerHTML = '';

    window.paypal
      .Buttons({
        createSubscription: async () => {
          const data = await apiFetch<{ subscriptionID: string }>('/api/payment/paypal/create-subscription', {
            method: 'POST',
            body: JSON.stringify({ planId: selectedPlan.id, billingPeriod: capturedBilling }),
          });
          return data.subscriptionID;
        },
        onApprove: async (data: { subscriptionID: string }) => {
          try {
            await apiFetch('/api/payment/paypal/confirm', {
              method: 'POST',
              body: JSON.stringify({ subscriptionID: data.subscriptionID }),
            });
            setModalState('success');
            await fetchSubscription();
          } catch (err) {
            setModalState('error');
            setErrorMsg(err instanceof Error ? err.message : "Erreur lors de la confirmation PayPal.");
          }
        },
        onError: () => {
          setModalState('error');
          setErrorMsg('Le paiement PayPal a échoué. Veuillez réessayer.');
        },
      })
      .render(paypalContainerRef.current);
  }, [selectedPlan, capturedBilling, fetchSubscription]);

  useEffect(() => {
    if (modalState !== 'paypal') return;

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setErrorMsg("PayPal n'est pas configuré.");
      return;
    }

    if (window.paypal) {
      renderPaypalButtons();
      return;
    }

    const existingScript = document.getElementById('paypal-sdk');
    if (existingScript) {
      existingScript.addEventListener('load', renderPaypalButtons);
      return () => existingScript.removeEventListener('load', renderPaypalButtons);
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.addEventListener('load', renderPaypalButtons);
    document.body.appendChild(script);
    return () => script.removeEventListener('load', renderPaypalButtons);
  }, [modalState, renderPaypalButtons]);

  const handleCancelSubscription = async () => {
    if (!confirm('Voulez-vous vraiment annuler votre abonnement ?')) return;
    setIsCancelling(true);
    try {
      await apiFetch('/api/subscriptions/cancel', { method: 'POST' });
      await fetchSubscription();
      alert('Abonnement annulé.');
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'annulation.");
    } finally {
      setIsCancelling(false);
    }
  };

  const activePlanId = subscription?.planId ?? null;

  // ── Calcul du label réseau ───────────────────────────────────────────────
  const networkLabel = network === 'airtel' ? 'Airtel Money' : network === 'orange' ? 'Orange Money' : 'Vodacom M-Pesa';

  return (
    <div className="space-y-8 animate-scale-in opacity-0 [animation-fill-mode:forwards]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:100ms]">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Abonnement
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
            Gérez votre forfait de facturation et découvrez nos services premium.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/40">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              billingPeriod === 'monthly' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1 ${
              billingPeriod === 'yearly' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Annuel</span>
            <span className="bg-primary-light text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-md">-20%</span>
          </button>
        </div>
      </div>

      {stripeBanner && (
        <div className={`flex items-center gap-2 p-4 rounded-xl text-sm font-semibold ${
          stripeBanner === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
        }`}>
          {stripeBanner === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>
            {stripeBanner === 'success'
              ? 'Paiement Stripe réussi, votre abonnement est activé.'
              : 'Paiement Stripe annulé.'}
          </span>
        </div>
      )}

      {/* Grille des forfaits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = plan.id === activePlanId;
          const displayPrice = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly;
          const annualNote = billingPeriod === 'yearly' ? `(soit $${displayPrice * 12} facturés par an)` : '';

          return (
            <div
              key={plan.id}
              className={`bg-white p-8 rounded-2xl border flex flex-col justify-between relative hover-card-effect shadow-sm
                ${plan.popular ? 'border-primary ring-2 ring-primary/10 shadow-lg' : 'border-slate-100'}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Recommandé
                </span>
              )}

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${plan.gradient} text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wide">{plan.name}</h3>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 tracking-tight">${displayPrice}</span>
                    <span className="text-sm font-semibold text-slate-400">/ mois</span>
                  </div>
                  {annualNote && (
                    <span className="text-[10px] font-bold text-slate-400 block mt-1">{annualNote}</span>
                  )}
                </div>

                <div className="h-[1px] bg-slate-100 w-full" />

                <ul className="space-y-3.5 text-xs font-semibold text-slate-600">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                {isCurrent ? (
                  <div className="space-y-2">
                    <button disabled className="w-full h-12 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Forfait actuel</span>
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                      className="w-full h-9 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                    >
                      Annuler mon abonnement
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openModal(plan)}
                    className={`w-full h-12 text-sm font-bold rounded-xl transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-2
                      ${plan.popular
                        ? 'text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20'
                        : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                      }`}
                  >
                    Choisir {plan.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400 font-medium animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms]">
        Paiement sécurisé via Mobile Money · Airtel Money &amp; Orange Money
      </p>

      {/* ── Modal de paiement ─────────────────────────────────────────────── */}
      {modalState !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* En-tête du modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {(modalState === 'form' || modalState === 'paypal') && (
                  <button
                    onClick={() => setModalState('method')}
                    className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {modalState === 'method' && 'Choisir un moyen de paiement'}
                    {modalState === 'form' && 'Paiement Mobile Money'}
                    {modalState === 'paypal' && 'Paiement PayPal'}
                    {modalState === 'waiting' && 'Paiement Mobile Money'}
                    {modalState === 'success' && 'Confirmation'}
                    {modalState === 'error' && 'Erreur'}
                  </p>
                  {selectedPlan && (
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">
                    Forfait {selectedPlan.name} —{' '}
                    <span className="text-primary">
                      ${capturedBilling === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceYearly * 12} USD
                    </span>
                    {capturedBilling === 'yearly' && <span className="text-xs text-slate-400 font-semibold"> / an</span>}
                  </p>
                  )}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5">

              {/* ── Choix du moyen de paiement ── */}
              {modalState === 'method' && (
                <div className="space-y-3">
                  <button
                    onClick={() => setModalState('form')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-primary/40 hover:bg-primary-light/30 transition-all duration-150 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Mobile Money</p>
                      <p className="text-xs text-slate-400 font-medium">Airtel Money, Orange Money, M-Pesa</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { setErrorMsg(null); handleStripeCheckout(); }}
                    disabled={isSubmitting}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-primary/40 hover:bg-primary-light/30 transition-all duration-150 text-left disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Carte bancaire</p>
                      <p className="text-xs text-slate-400 font-medium">Visa, Mastercard, Amex — via Stripe</p>
                    </div>
                  </button>

                  {errorMsg && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-xs font-semibold text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {errorMsg}
                    </div>
                  )}

                  <button
                    onClick={() => { setErrorMsg(null); setModalState('paypal'); }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-primary/40 hover:bg-primary-light/30 transition-all duration-150 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 font-black text-xs">
                      PP
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">PayPal</p>
                      <p className="text-xs text-slate-400 font-medium">Payer avec votre compte PayPal</p>
                    </div>
                  </button>
                </div>
              )}

              {/* ── PayPal ── */}
              {modalState === 'paypal' && (
                <div className="space-y-4">
                  {errorMsg && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-xs font-semibold text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {errorMsg}
                    </div>
                  )}
                  <div ref={paypalContainerRef} />
                </div>
              )}

              {/* ── Formulaire ── */}
              {modalState === 'form' && (
                <div className="space-y-5">
                  {/* Sélection du réseau */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                      Choisissez votre réseau
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { id: 'airtel', label: 'Airtel Money', emoji: '🔴', active: 'border-red-500 bg-red-50 text-red-700' },
                        { id: 'orange', label: 'Orange Money', emoji: '🟠', active: 'border-orange-500 bg-orange-50 text-orange-700' },
                        { id: 'vodacom', label: 'M-Pesa', emoji: '🔵', active: 'border-blue-500 bg-blue-50 text-blue-700' },
                      ] as const).map((net) => (
                        <button
                          key={net.id}
                          onClick={() => setNetwork(net.id)}
                          className={`py-3 px-2 rounded-xl border-2 text-sm font-bold transition-all duration-150 flex flex-col items-center gap-1
                            ${network === net.id ? net.active : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                        >
                          <span className="text-xl">{net.emoji}</span>
                          <span className="text-[11px] text-center leading-tight">{net.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Numéro de téléphone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                      Numéro {networkLabel}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none">
                        +243
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="812 345 678"
                        className="w-full pl-14 pr-4 h-12 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-300 transition-all"
                      />
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                      Vous recevrez une invite USSD pour confirmer le paiement
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-xs font-semibold text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {errorMsg}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !phone.trim()}
                    className="w-full h-12 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Connexion en cours…</>
                    ) : (
                      `Payer avec ${networkLabel}`
                    )}
                  </button>
                </div>
              )}

              {/* ── Attente d'approbation ── */}
              {modalState === 'waiting' && (
                <div className="flex flex-col items-center gap-5 py-4 text-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="w-7 h-7 text-primary" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                      <span className="relative inline-flex h-5 w-5 rounded-full bg-primary" />
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-slate-900">En attente de confirmation</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      Vérifiez votre téléphone <span className="font-bold text-slate-700">(+243 {phone})</span>
                      <br />et approuvez le paiement via l&apos;invite USSD {networkLabel}.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Vérification automatique toutes les 5 secondes…
                  </div>
                </div>
              )}

              {/* ── Succès ── */}
              {modalState === 'success' && (
                <div className="flex flex-col items-center gap-5 py-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-slate-900">Abonnement activé !</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      Votre forfait <span className="font-bold text-slate-700">{selectedPlan?.name}</span> est maintenant actif.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/overview')}
                    className="w-full h-12 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    Accéder au tableau de bord
                  </button>
                </div>
              )}

              {/* ── Erreur ── */}
              {modalState === 'error' && (
                <div className="flex flex-col items-center gap-5 py-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-slate-900">Paiement échoué</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">{errorMsg}</p>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => { setModalState('form'); setErrorMsg(null); }}
                      className="flex-1 h-12 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover transition-colors"
                    >
                      Réessayer
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 h-12 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense>
      <SubscriptionsContent />
    </Suspense>
  );
}

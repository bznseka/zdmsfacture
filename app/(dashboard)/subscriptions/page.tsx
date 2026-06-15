'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Zap, Building } from 'lucide-react';

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

export default function SubscriptionsPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [activePlanId, setActivePlanId] = useState<string>('plan-pro'); // Default to Pro

  const plans: Plan[] = [
    {
      id: 'plan-starter',
      name: 'Starter',
      priceMonthly: 15,
      priceYearly: 12, // $12/month billed yearly
      icon: Zap,
      gradient: 'from-blue-500 to-indigo-600',
      features: [
        'Jusqu’à 15 factures par mois',
        'Gestion de 50 clients',
        'Double devise USD & Franc Congolais',
        '1 utilisateur unique',
        'Support email standard',
      ]
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
        'Double devise USD & CDF',
        'Jusqu’à 5 utilisateurs collaborateurs',
        'Rapports statistiques avancés',
        'Génération PDF de marque blanche',
        'Support prioritaire 24/7',
      ]
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
        'Nombre d’utilisateurs illimité',
        'Rapprochement bancaire automatique',
        'Intégration API de facturation',
        'Gestionnaire de compte dédié',
        'SLA garanti de 99.9%',
      ]
    }
  ];

  const handleUpgrade = (planId: string, planName: string) => {
    setActivePlanId(planId);
    alert(`Votre abonnement a été mis à jour vers le forfait ${planName} (${
      billingPeriod === 'monthly' ? 'Paiement mensuel' : 'Facturation annuelle'
    }) !`);
  };

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

        {/* Toggle Switch */}
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
            <span className="bg-primary-light text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-md">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = plan.id === activePlanId;
          const monthlyPrice = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly;
          const formattedAnnual = billingPeriod === 'yearly' ? `(soit $${monthlyPrice * 12} facturés par an)` : '';

          return (
            <div
              key={plan.id}
              className={`
                bg-white p-8 rounded-2xl border flex flex-col justify-between relative hover-card-effect shadow-sm
                ${plan.popular ? 'border-primary ring-2 ring-primary/10 shadow-lg' : 'border-slate-100'}
              `}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Recommandé
                </span>
              )}

              {/* Top details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${plan.gradient} text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wide">
                    {plan.name}
                  </h3>
                </div>

                {/* Price Display */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 tracking-tight">${monthlyPrice}</span>
                    <span className="text-sm font-semibold text-slate-400">/ mois</span>
                  </div>
                  {formattedAnnual && (
                    <span className="text-[10px] font-bold text-slate-400 block mt-1">
                      {formattedAnnual}
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-slate-100 w-full" />

                {/* Features List */}
                <ul className="space-y-3.5 text-xs font-semibold text-slate-600">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Upgrade Button */}
              <div className="mt-8">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full h-12 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center gap-2"
                  >
                    <span>Forfait actuel</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id, plan.name)}
                    className={`
                      w-full h-12 text-sm font-bold rounded-xl transition-all duration-200 hover:scale-[1.01]
                      ${plan.popular
                        ? 'text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20'
                        : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                      }
                    `}
                  >
                    <span>Choisir {plan.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Send, CheckCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export default function SupportPage() {
  // Accordion open/close state
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Ticket submission states
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'billing',
    message: '',
  });

  const faqs: FaqItem[] = [
    {
      question: 'Comment configurer le taux de TVA de mon entreprise ?',
      answer: 'Allez dans la page "Paramètres" depuis la barre latérale. Dans la section "Configuration fiscale", vous pouvez définir le taux de TVA applicable à votre activité (18% par défaut). Si votre entreprise n’est pas assujettie à la TVA, vous pouvez modifier ce taux à 0%.'
    },
    {
      question: 'Comment enregistrer un paiement Mobile Money (M-Pesa, Orange Money, Airtel Money) ?',
      answer: 'Lorsqu’un client vous règle via mobile money, accédez à la page "Paiements" et cliquez sur "Enregistrer un paiement". Sélectionnez la facture concernée, choisissez la méthode "Mobile Money", saisissez le montant perçu et n’oubliez pas de mentionner la référence de la transaction (ex: MPESA-TX-XXXXX) pour un suivi comptable optimal.'
    },
    {
      question: 'Puis-je modifier une facture déjà marquée comme "Payée" ?',
      answer: 'Oui. Allez dans la liste des factures, cliquez sur la facture pour voir ses détails, puis cliquez sur le bouton "Modifier" dans la barre d’actions supérieure. Le formulaire de facturation se chargera avec les données pré-remplies.'
    }
  ];

  const handleToggleFaq = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setTicketSubmitted(true);
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      subject: 'billing',
      message: '',
    });
    setTicketSubmitted(false);
  };

  return (
    <div className="space-y-8 animate-scale-in opacity-0 [animation-fill-mode:forwards]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:100ms]">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Aide & Support
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
            Consultez notre FAQ ou soumettez un ticket d&apos;assistance à notre équipe.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: FAQ ACCORDION */}
        <div className="lg:col-span-7 space-y-6 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span>Foire aux questions (FAQ)</span>
            </h3>

            {/* Accordion List */}
            <div className="divide-y divide-slate-100">
              {faqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0">
                    <button
                      onClick={() => handleToggleFaq(idx)}
                      className="w-full flex justify-between items-center text-left text-sm font-bold text-slate-800 hover:text-primary transition-colors focus:outline-none"
                    >
                      <span className="pr-4">{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {isOpen && (
                      <div className="mt-3 text-xs font-semibold text-slate-500 leading-relaxed animate-fade-in">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTACT SUPPORT FORM */}
        <div className="lg:col-span-5 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms]">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            
            {!ticketSubmitted ? (
              <>
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span>Contacter l&apos;assistance</span>
                </h3>
                
                <form onSubmit={handleSendTicket} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Votre nom complet
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Bruno Z."
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Votre adresse email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: contact@bruno.cd"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Sujet de la demande
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary transition-all duration-200"
                    >
                      <option value="billing">Problème de facturation / calcul</option>
                      <option value="account">Gestion du forfait d&apos;abonnement</option>
                      <option value="bug">Signaler un dysfonctionnement (Bug)</option>
                      <option value="other">Autre demande générale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Détails de votre message
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Décrivez votre problème avec le plus de précisions possibles..."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full p-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 h-11 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-[1.01]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Envoyer la demande</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-scale-in">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight mt-4">Message envoyé !</h3>
                <p className="text-xs text-slate-500 font-medium mt-2 max-w-[280px] leading-relaxed">
                  Merci, <strong>{formData.name}</strong>. Notre support technique a bien reçu votre demande et reviendra vers vous sous 24 heures à l&apos;adresse <strong>{formData.email}</strong>.
                </p>
                <button
                  onClick={handleResetForm}
                  className="mt-6 flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-200"
                >
                  <span>Créer un autre ticket</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

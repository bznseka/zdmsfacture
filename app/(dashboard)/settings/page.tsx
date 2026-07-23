'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Save, Sparkles, Building2, Landmark, RefreshCw, Image as ImageIcon, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CURRENCIES, Currency } from '@/lib/currency';

interface SettingsData {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  taxRate: number;
  mobileMoneyDetails: string;
  currency: Currency;
}

const DEFAULT_FORM_DATA: SettingsData = {
  companyName: 'Ma Société',
  email: '',
  phone: '',
  address: '',
  taxNumber: '',
  taxRate: 18,
  mobileMoneyDetails: '',
  currency: 'USD',
};

export default function SettingsPage() {
  const { settings, updateSettings, setLogoUrl, loading } = useApp();

  const [formData, setFormData] = useState<SettingsData>(DEFAULT_FORM_DATA);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);
    setLogoUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/settings/logo', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) {
        setLogoError(data.error || "Erreur lors de l'envoi du logo.");
        return;
      }
      setLogoUrl(data.logoUrl);
    } catch {
      setLogoError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogoRemove = async () => {
    if (!confirm('Supprimer le logo actuel ?')) return;
    setLogoError(null);
    setLogoUploading(true);
    try {
      const res = await fetch('/api/settings/logo', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setLogoError(data.error || 'Erreur lors de la suppression.');
        return;
      }
      setLogoUrl('');
    } catch {
      setLogoError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLogoUploading(false);
    }
  };

  // Sync with settings context when loaded
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      alert('Paramètres de l’entreprise sauvegardés avec succès !');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde des paramètres.');
    }
  };

  const handleResetDefaults = async () => {
    if (confirm('Voulez-vous réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      try {
        await updateSettings(DEFAULT_FORM_DATA);
        setFormData(DEFAULT_FORM_DATA);
        alert('Valeurs par défaut restaurées.');
      } catch (err) {
        console.error(err);
        alert('Erreur lors de la restauration.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-scale-in opacity-0 [animation-fill-mode:forwards]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:100ms]">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Paramètres
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
            Gérez la configuration globale de votre profil d&apos;entreprise et de facturation.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT & CENTER PANEL: GENERAL & BILLING CONFIG */}
        <div className="lg:col-span-2 space-y-6 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">

          {/* Logo */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <span>Logo de l&apos;entreprise</span>
            </h3>

            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {settings.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-300" />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <div className="flex gap-2">
                  <label
                    htmlFor="logo-upload"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
                  >
                    {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                    <span>{settings.logoUrl ? 'Changer le logo' : 'Ajouter un logo'}</span>
                  </label>
                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={handleLogoRemove}
                      disabled={logoUploading}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium">PNG, JPEG, WEBP ou SVG — 2 Mo maximum.</p>
              </div>
            </div>

            {logoError && (
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs font-semibold text-rose-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {logoError}
              </div>
            )}
          </div>

          {/* Company Identity */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Identité de l&apos;entreprise</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Raison sociale / Nom commercial
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Numéro d&apos;identification fiscale (Optionnel)
                </label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxNumber: e.target.value }))}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Adresse email de facturation
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Téléphone de contact
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Adresse physique
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Billing configuration */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" />
              <span>Configuration fiscale</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Taux de TVA (%)
                </label>
                <input
                  type="number"
                  required
                  value={formData.taxRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Devise par défaut
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as Currency }))}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Devise proposée par défaut à la création d&apos;une nouvelle facture. Vous pouvez toujours choisir l&apos;autre devise facture par facture.
            </p>
          </div>

          {/* Payment Terms Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Détails de paiement (Mobile Money / Banque)</span>
            </h3>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Coordonnées de virement par défaut pour le bas des factures
            </label>
            <textarea
              rows={3}
              value={formData.mobileMoneyDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, mobileMoneyDetails: e.target.value }))}
              className="w-full p-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none"
            />
          </div>
        </div>

        {/* RIGHT PANEL: ACTIONS & STATS */}
        <div className="lg:col-span-1 space-y-6 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms]">
          {/* Quick Actions Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Actions</h3>
            
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 h-11 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-[1.01]"
            >
              <Save className="w-4 h-4" />
              <span>Sauvegarder les modifications</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="w-full flex items-center justify-center gap-2 h-11 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restaurer les valeurs d&apos;origine</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

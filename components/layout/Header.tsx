'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Search, Bell, Menu, ChevronDown, LogOut, Settings as SettingsIcon, X, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getDisplayName, getInitials } from '@/lib/display-name';
import { formatCurrency } from '@/lib/currency';
import { Invoice } from '@/types';

interface HeaderProps {
  onMenuToggle: () => void;
}

function parseFrenchDate(dateStr: string): Date | null {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return null;
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getOverdueInvoices(invoices: Invoice[]): (Invoice & { daysLate: number })[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return invoices
    .filter((inv) => inv.status !== 'paid' && inv.status !== 'draft')
    .map((inv) => {
      const due = parseFrenchDate(inv.dueDate);
      if (!due) return null;
      const daysLate = Math.round((today.getTime() - due.getTime()) / 86400000);
      return daysLate > 0 ? { ...inv, daysLate } : null;
    })
    .filter((inv): inv is Invoice & { daysLate: number } => inv !== null)
    .sort((a, b) => b.daysLate - a.daysLate);
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const { user, settings, invoices, clients } = useApp();
  const displayName = getDisplayName(user?.email, settings.companyName) || user?.email || '';
  const initials = getInitials(displayName);
  const roleLabel = user?.role === 'admin' ? 'Administrateur' : 'Utilisateur';

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchQuery('');
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
        setMobileSearchOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const overdueInvoices = useMemo(() => getOverdueInvoices(invoices), [invoices]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const clientResults = clients
      .filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({ type: 'client' as const, id: c.id, label: c.name, sublabel: c.email }));

    const invoiceResults = invoices
      .filter((i) => i.invoiceNumber.toLowerCase().includes(q) || i.client.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map((i) => ({ type: 'invoice' as const, id: i.id, label: i.invoiceNumber, sublabel: i.client.name }));

    return [...invoiceResults, ...clientResults];
  }, [searchQuery, clients, invoices]);

  const goToResult = (result: { type: 'client' | 'invoice'; id: string; label: string }) => {
    setSearchQuery('');
    setMobileSearchOpen(false);
    router.push(result.type === 'invoice' ? `/invoices/${result.id}` : `/clients?q=${encodeURIComponent(result.label)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/invoices?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setMobileSearchOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-md border-b border-slate-100">
      {/* Search Bar / Left Section */}
      <div className="flex items-center gap-4 flex-1">
        {/* Toggle Menu Button for mobile */}
        <button
          onClick={onMenuToggle}
          className="flex items-center justify-center w-10 h-10 -ml-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 lg:hidden focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search Input (desktop) */}
        <div ref={searchRef} className="relative max-w-md w-full hidden sm:block">
          <form onSubmit={handleSearchSubmit}>
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher des factures, clients ou rapports..."
              className="w-full h-10 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </form>

          {searchResults.length > 0 && (
            <div className="absolute top-12 left-0 w-full bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden z-40">
              {searchResults.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => goToResult(r)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-800 truncate">{r.label}</span>
                  <span className="text-xs text-slate-400 truncate ml-2">{r.sublabel}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notifications & Profile / Right Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Search Button (for screens smaller than sm) */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="sm:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications Button */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            {overdueInvoices.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-rose-500 ring-2 ring-white text-white text-[10px] font-bold">
                {overdueInvoices.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute top-12 right-0 w-80 max-w-[85vw] bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-40">
              <div className="px-4 py-3 border-b border-slate-50">
                <h3 className="text-sm font-bold text-slate-900">Alertes de facturation</h3>
                <p className="text-xs text-slate-400 font-medium">
                  {overdueInvoices.length > 0
                    ? `${overdueInvoices.length} facture${overdueInvoices.length > 1 ? 's' : ''} en retard de paiement`
                    : 'Aucune facture en retard'}
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {overdueInvoices.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-slate-400 font-medium">
                    Tout est à jour, aucune alerte pour le moment.
                  </p>
                ) : (
                  overdueInvoices.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => {
                        setNotifOpen(false);
                        router.push(`/invoices/${inv.id}`);
                      }}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate">{inv.invoiceNumber}</p>
                        <p className="text-xs text-slate-400 font-medium truncate">{inv.client.name}</p>
                        <p className="text-xs text-rose-600 font-semibold mt-0.5">
                          En retard de {inv.daysLate} jour{inv.daysLate > 1 ? 's' : ''} · {formatCurrency(inv.totalUsd, inv.currency)}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-slate-200" />

        {/* User Profile Info */}
        <div ref={profileRef} className="relative">
          <div
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-3 pl-1 cursor-pointer group"
          >
            {/* Avatar */}
            <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all duration-200 bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              {initials}
            </div>
            {/* Name & Role (hidden on tiny screens) */}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-900 leading-none group-hover:text-primary transition-colors">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                {roleLabel}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>

          {profileOpen && (
            <div className="absolute top-12 right-0 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-40">
              <div className="px-4 py-3 border-b border-slate-50">
                <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-xs text-slate-400 font-medium truncate" title={user?.email ?? undefined}>
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push('/settings');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Paramètres</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div ref={mobileSearchRef} className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-4 sm:hidden z-40">
          <form onSubmit={handleSearchSubmit} className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full h-11 pl-10 pr-10 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-2 rounded-xl border border-slate-100 overflow-hidden">
              {searchResults.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => goToResult(r)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-800 truncate">{r.label}</span>
                  <span className="text-xs text-slate-400 truncate ml-2">{r.sublabel}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

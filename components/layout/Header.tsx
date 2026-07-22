'use client';

import React from 'react';
import { Search, Bell, Menu, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getDisplayName, getInitials } from '@/lib/display-name';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, settings } = useApp();
  const displayName = getDisplayName(user?.email, settings.companyName) || user?.email || '';
  const initials = getInitials(displayName);
  const roleLabel = user?.role === 'admin' ? 'Administrateur' : 'Utilisateur';

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

        {/* Global Search Input */}
        <div className="relative max-w-md w-full hidden sm:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="search"
            placeholder="Rechercher des factures, clients ou rapports..."
            className="w-full h-10 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
          />
        </div>
      </div>

      {/* Notifications & Profile / Right Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Search Button (for screens smaller than sm) */}
        <button className="sm:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications Button */}
        <button className="relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 focus:outline-none">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
        </button>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-slate-200" />

        {/* User Profile Info */}
        <div className="flex items-center gap-3 pl-1 cursor-pointer group">
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
      </div>
    </header>
  );
}

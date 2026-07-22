'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function AdminLogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-1.5 hover:text-rose-400 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      <span>Déconnexion</span>
    </button>
  );
}

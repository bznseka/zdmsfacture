'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  CreditCard, 
  Undo2, 
  Sparkles, 
  Settings, 
  LogOut,
  X,
  Wallet,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useApp();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const navGroups: NavGroup[] = [
    {
      title: 'Principal',
      items: [
        { name: 'Vue d’ensemble', href: '/overview', icon: LayoutDashboard },
        { name: 'Factures', href: '/invoices', icon: FileText },
        { name: 'Clients', href: '/clients', icon: Users },
        { name: 'Paiements', href: '/payments', icon: CreditCard },
      ]
    },
    {
      title: 'Gestion',
      items: [
        { name: 'Remboursements', href: '/refunds', icon: Undo2 },
        { name: 'Abonnements', href: '/subscriptions', icon: Sparkles },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { name: 'Paramètres', href: '/settings', icon: Settings },
        { name: 'Aide & Support', href: '/support', icon: HelpCircle },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      {/* z-[60]: must render above BottomNav (z-50) so the logout button in the
          footer isn't hidden behind the mobile bottom nav bar. */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-[60] flex flex-col w-64 bg-white border-r border-slate-100 transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-50">
          <Link href="/overview" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-500 text-white shadow-md shadow-primary/20 transition-transform group-hover:scale-105 duration-300">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 via-primary to-purple-600 bg-clip-text text-transparent">
                zdmsFacture
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                SaaS Invoicing
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-7">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <span className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {group.title}
              </span>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/overview' && pathname?.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group
                          ${isActive 
                            ? 'bg-primary-light text-primary font-semibold shadow-sm scale-[1.02]' 
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                          }
                        `}
                      >
                        <Icon className={`
                          w-5 h-5 transition-all duration-300
                          ${isActive 
                            ? 'text-primary' 
                            : 'text-slate-400 group-hover:text-primary group-hover:scale-110'
                          }
                        `} />
                        <span className={`
                          transition-transform duration-300
                          ${isActive ? '' : 'group-hover:translate-x-1'}
                        `}>
                          {item.name}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer Section (User Profile & Logout) */}
        <div className="p-4 border-t border-slate-50 space-y-2.5">
          {user && (
            <div className="px-3 py-2 bg-slate-50/70 border border-slate-100 rounded-xl flex flex-col gap-0.5 overflow-hidden">
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Utilisateur
              </span>
              <span className="text-xs text-slate-700 font-medium truncate" title={user.email ?? undefined}>
                {user.email}
              </span>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>
    </>
  );
}

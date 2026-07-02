'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  MoreHorizontal,
} from 'lucide-react';

const navItems = [
  { name: 'Accueil', href: '/overview', icon: LayoutDashboard },
  { name: 'Factures', href: '/invoices', icon: FileText },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Paiements', href: '/payments', icon: CreditCard },
  { name: 'Plus', href: '/settings', icon: MoreHorizontal },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 safe-area-bottom shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.06)]">
      <div className="flex items-stretch justify-around h-16">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/overview' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center flex-1 gap-1 px-1 pt-1 pb-safe
                transition-all duration-200 relative
                ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}
              `}
            >
              {/* Active indicator pill */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}

              {/* Icon container */}
              <span className={`
                flex items-center justify-center w-9 h-7 rounded-xl transition-all duration-200
                ${isActive ? 'bg-primary-light scale-110' : 'bg-transparent'}
              `}>
                <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'text-primary' : ''}`} />
              </span>

              {/* Label */}
              <span className={`
                text-[10px] font-bold tracking-wide leading-none transition-all duration-200
                ${isActive ? 'text-primary' : 'text-slate-400'}
              `}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

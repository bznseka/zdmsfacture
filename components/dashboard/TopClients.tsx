import React from 'react';

interface TopClientItem {
  id: string;
  name: string;
  totalUsd: number;
  totalCdf: number;
  invoicesCount: number;
  initials: string;
}

interface TopClientsProps {
  clients: TopClientItem[];
}

export default function TopClients({ clients }: TopClientsProps) {
  // Array of gradients for avatars
  const avatarGradients = [
    'from-violet-500 to-purple-600',
    'from-teal-400 to-emerald-500',
    'from-rose-400 to-pink-500',
    'from-amber-400 to-orange-500',
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
      <div>
        <h3 className="text-base font-bold text-slate-900">Top Clients</h3>
        <p className="text-xs text-slate-400 font-medium">Clients ayant généré le plus de chiffre d&apos;affaires</p>
      </div>

      <div className="flex-1 divide-y divide-slate-50 mt-4 overflow-y-auto">
        {clients.map((client, index) => {
          const gradient = avatarGradients[index % avatarGradients.length];
          return (
            <div key={client.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group">
              <div className="flex items-center gap-3">
                {/* Initial Avatar */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white font-bold text-sm flex items-center justify-center shadow-sm`}>
                  {client.initials}
                </div>
                {/* Client Info */}
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">
                    {client.name}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {client.invoicesCount} facture{client.invoicesCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Billed totals */}
              <div className="text-right">
                <span className="block text-sm font-bold text-slate-900">
                  ${client.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="block text-[10px] font-bold text-slate-400 mt-0.5">
                  {Math.round(client.totalCdf).toLocaleString('fr-FR')} FC
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

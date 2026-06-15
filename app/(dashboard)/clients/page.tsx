'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Search, Edit2, Trash2, Mail, Phone, MapPin, X, Save } from 'lucide-react';
import { Client } from '@/types';

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } = useApp();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    country: 'CD',
  });

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      country: 'CD',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      country: client.country || 'CD',
    });
    setIsModalOpen(true);
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement le client ${name} ?`)) {
      try {
        await deleteClient(id);
        alert('Client supprimé avec succès.');
      } catch (err) {
        console.error(err);
        alert('Une erreur est survenue lors de la suppression.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Le nom et l’adresse email sont obligatoires.');
      return;
    }

    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
        alert('Client mis à jour avec succès.');
      } else {
        await addClient(formData);
        alert('Client ajouté avec succès.');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue lors de l’enregistrement.');
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avatarGradients = [
    'from-violet-500 to-purple-600',
    'from-teal-400 to-emerald-500',
    'from-rose-400 to-pink-500',
    'from-amber-400 to-orange-500',
  ];

  return (
    <div className="space-y-8 animate-scale-in opacity-0 [animation-fill-mode:forwards]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:100ms]">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Clients
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
            Gérez vos comptes et informations clients.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-2xl shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] group self-start sm:self-auto"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Ajouter un client</span>
        </button>
      </div>

      {/* Search Bar Container */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un client par nom ou email..."
            className="w-full h-10 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:300ms]">
        {filteredClients.length > 0 ? (
          filteredClients.map((client, idx) => {
            const gradient = avatarGradients[idx % avatarGradients.length];
            const initials = client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            return (
              <div key={client.id} className="bg-white p-6 rounded-2xl border border-slate-100 hover-card-effect shadow-sm flex flex-col justify-between h-[230px]">
                {/* Header card details */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} text-white font-bold text-base flex items-center justify-center shadow-sm`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
                        {client.name}
                      </h3>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-lg border border-slate-200/60 mt-1 inline-block">
                        {client.country === 'CD' ? 'République Démocratique du Congo' : client.country}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(client)}
                      title="Modifier"
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id, client.name)}
                      title="Supprimer"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body details */}
                <div className="space-y-2.5 mt-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="line-clamp-1">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2 leading-relaxed">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm flex flex-col items-center">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 mt-4">Aucun client trouvé</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px] font-medium">
              Aucun compte client ne correspond à votre recherche actuelle.
            </p>
          </div>
        )}
      </div>

      {/* CRUD FORM DIALOG/MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-2xl p-6 md:p-8 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {editingClient ? `Modifier ${editingClient.name}` : 'Ajouter un nouveau client'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form content */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Nom Complet / Nom de l’entreprise
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vodacom Congo RDC"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Adresse Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: finance@vodacom.cd"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Numéro de Téléphone
                </label>
                <input
                  type="text"
                  placeholder="Ex: +243 812 345 678"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Adresse Physique
                </label>
                <input
                  type="text"
                  placeholder="Ex: Boulevard du 30 Juin, Kinshasa Gombe"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-50 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-11 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 h-11 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/20 transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

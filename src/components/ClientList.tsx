import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Client, Language, SeniorityLevel } from '../types';
import { Plus, Search, Mail, Phone, Briefcase, Globe, Filter, ChevronRight, Loader2, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ClientListProps {
  user: any;
  onSelectClient: (client: Client) => void;
  lang: Language;
}

export const ClientList: React.FC<ClientListProps> = ({ user, onSelectClient, lang }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newClient, setNewClient] = useState({
    fullName: '',
    email: '',
    phone: '',
    targetRole: '',
    targetIndustry: '',
    targetCountry: '',
    targetSeniority: 'Professional' as SeniorityLevel
  });

  const fetchClients = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'clients'),
        where('ownerId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const clientList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];
      setClients(clientList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const docRef = await addDoc(collection(db, 'clients'), {
        ...newClient,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      const createdClient: Client = {
        id: docRef.id,
        ...newClient,
        ownerId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setClients([createdClient, ...clients]);
      setShowAddModal(false);
      setNewClient({
        fullName: '',
        email: '',
        phone: '',
        targetRole: '',
        targetIndustry: '',
        targetCountry: '',
        targetSeniority: 'Professional'
      });
    } catch (error) {
      handleFirestoreError(error, 'create', 'clients');
    }
  };

  const filteredClients = clients.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.targetRole.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder={lang === 'es' ? "Buscar por nombre, email o cargo..." : "Search by name, email or role..."}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-executive-gold/20 focus:border-executive-gold outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-executive-navy transition-colors">
            <Filter className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="luxury-button gap-2 py-2"
          >
            <Plus className="w-4 h-4" />
            {lang === 'es' ? "Agregar Cliente" : "Add Client"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p className="text-sm font-medium">
            {lang === 'es' ? "Asegurando datos de clientes..." : "Securing client data..."}
          </p>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <motion.div
              layoutId={client.id}
              key={client.id}
              onClick={() => onSelectClient(client)}
              className="executive-card p-6 cursor-pointer group hover:border-executive-gold transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-executive-paper border border-slate-100 flex items-center justify-center font-serif text-xl font-bold text-executive-navy group-hover:bg-executive-navy group-hover:text-executive-gold transition-colors">
                  {client.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                  {client.targetSeniority}
                </div>
              </div>
              
              <div className="space-y-1 mb-6">
                <h3 className="font-bold text-executive-navy group-hover:text-executive-gold transition-colors">{client.fullName}</h3>
                <p className="text-sm text-slate-500 font-medium">{client.targetRole}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="truncate">{client.targetIndustry}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{client.targetCountry}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end">
                <span className="text-xs font-bold text-executive-gold flex items-center gap-1 group-hover:gap-2 transition-all">
                  {lang === 'es' ? "Abrir Espacio de Trabajo" : "Open Workspace"} <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-serif text-executive-navy mb-2">
            {lang === 'es' ? "Sin clientes gestionados aún" : "No clients managed yet"}
          </h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">
            {lang === 'es' 
              ? "Comienza tu consultoría de carrera ejecutiva agregando tu primer perfil de cliente." 
              : "Start your executive career consulting by adding your first client profile."}
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="luxury-button-outline gap-2"
          >
            <Plus className="w-4 h-4" />
            {lang === 'es' ? "Crear Perfil de Cliente" : "Create Client Profile"}
          </button>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-executive-navy/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden relative z-10 shadow-2xl"
          >
            <div className="bg-executive-navy p-6 flex items-center justify-between text-white">
              <h3 className="text-xl font-serif">
                {lang === 'es' ? "Nuevo Perfil de Cliente" : "New Client Profile"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleAddClient} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                    {lang === 'es' ? "Nombre Completo" : "Full Name"}
                  </label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-executive-gold/20 outline-none transition-all"
                    placeholder="John Doe"
                    value={newClient.fullName}
                    onChange={e => setNewClient({...newClient, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                    {lang === 'es' ? "Email Corporativo" : "Corporate Email"}
                  </label>
                  <input 
                    required
                    type="email"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-executive-gold/20 outline-none transition-all"
                    placeholder="j.doe@company.com"
                    value={newClient.email}
                    onChange={e => setNewClient({...newClient, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                    {lang === 'es' ? "Cargo Objetivo" : "Target Role"}
                  </label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-executive-gold/20 outline-none transition-all"
                    placeholder="VP of Engineering"
                    value={newClient.targetRole}
                    onChange={e => setNewClient({...newClient, targetRole: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                    {lang === 'es' ? "Nivel de Seniority" : "Seniority Level"}
                  </label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-executive-gold/20 outline-none transition-all"
                    value={newClient.targetSeniority}
                    onChange={e => setNewClient({...newClient, targetSeniority: e.target.value as SeniorityLevel})}
                  >
                    {['Junior', 'Professional', 'Lead', 'Manager', 'Director', 'VP', 'C-Level'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                    {lang === 'es' ? "Industria" : "Industry"}
                  </label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-executive-gold/20 outline-none transition-all"
                    placeholder="Healthcare / Biotech"
                    value={newClient.targetIndustry}
                    onChange={e => setNewClient({...newClient, targetIndustry: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                    {lang === 'es' ? "País Objetivo" : "Target Country"}
                  </label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-executive-gold/20 outline-none transition-all"
                    placeholder="USA / Global"
                    value={newClient.targetCountry}
                    onChange={e => setNewClient({...newClient, targetCountry: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 rounded-full text-slate-500 font-medium hover:bg-slate-50"
                >
                  {lang === 'es' ? "Cancelar" : "Cancel"}
                </button>
                <button 
                  type="submit"
                  className="luxury-button"
                >
                  {lang === 'es' ? "Guardar Perfil" : "Save Profile"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

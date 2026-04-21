import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  Users, 
  LayoutDashboard, 
  FileText, 
  Search, 
  Settings, 
  LogOut, 
  Plus, 
  Briefcase, 
  TrendingUp, 
  ChevronRight,
  User as UserIcon,
  Loader2,
  AlertCircle,
  Globe,
  Bell,
  ArrowRight
} from 'lucide-react';
import { auth, signIn, logout } from './services/firebase';
import { AppState, Language, Client } from './types';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ClientList } from './components/ClientList';
import { ClientDetail } from './components/ClientDetail';

// Views
const LoginView = () => (
  <div className="min-h-screen bg-executive-navy flex flex-col items-center justify-center p-4 relative overflow-hidden">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-executive-gold blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400 blur-[120px]" />
    </div>
    
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full text-center space-y-8 relative z-10"
    >
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight">
          Executive <span className="text-executive-gold">ATS</span>
        </h1>
        <p className="text-slate-400 font-light text-lg">
          Intelligence Platform for Outplacement & Executive Search
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl text-white font-medium">Consultant Access</h2>
          <p className="text-slate-400 text-sm">Sign in with your corporate Google identity to manage clients.</p>
        </div>
        
        <button 
          onClick={signIn}
          className="w-full luxury-button flex items-center justify-center gap-3 py-4 text-lg hover:scale-[1.02]"
        >
          <Globe className="w-5 h-5 text-executive-gold" />
          Enter Command Center
        </button>
      </div>

      <div className="flex justify-center gap-8 text-slate-500 text-xs uppercase tracking-widest font-semibold pt-8">
        <span>Greenhouse Validated</span>
        <span>•</span>
        <span>iCIMS Logic</span>
        <span>•</span>
        <span>C-Level Quality</span>
      </div>
    </motion.div>
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
      active 
        ? "bg-executive-navy text-white shadow-lg shadow-executive-navy/20" 
        : "text-slate-500 hover:bg-slate-100/80 hover:text-executive-navy"
    )}
  >
    <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", active ? "text-executive-gold" : "text-slate-400 group-hover:text-executive-navy")} />
    {label}
  </button>
);

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppState>(AppState.DASHBOARD);
  const [lang, setLang] = useState<Language>('es');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Default Guest User for "Open Access" mode
  const GUEST_USER = {
    uid: 'executive-guest-consultant',
    displayName: 'Consultor Ejecutivo',
    email: 'consultor@executive-ats.com',
    photoURL: null
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // If we have a real user, use it. Otherwise, use guest for open access.
      if (firebaseUser) {
        setUser(firebaseUser);
        setView(AppState.DASHBOARD);
      } else {
        setUser(GUEST_USER);
        setView(AppState.DASHBOARD);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setView(AppState.CLIENT_DETAIL);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-executive-paper flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-executive-navy animate-spin" />
      </div>
    );
  }

  // Login is now bypassed
  // if (!user) return <LoginView />;

  return (
    <div className="min-h-screen bg-executive-paper flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-executive-navy rounded-xl flex items-center justify-center">
            <TrendingUp className="text-executive-gold w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl leading-none">Executive</h1>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">ATS Intelligence</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label={lang === 'es' ? "Panel General" : "Dashboard"} 
            active={view === AppState.DASHBOARD}
            onClick={() => setView(AppState.DASHBOARD)}
          />
          <SidebarItem 
            icon={Users} 
            label={lang === 'es' ? "Mis Clientes" : "My Clients"} 
            active={view === AppState.CLIENTS}
            onClick={() => setView(AppState.CLIENTS)}
          />
          <SidebarItem 
            icon={Search} 
            label={lang === 'es' ? "Market Pulse" : "Market Pulse"} 
            onClick={() => {}} 
          />
          <SidebarItem 
            icon={Settings} 
            label={lang === 'es' ? "Configuración" : "Settings"} 
            onClick={() => {}} 
          />
        </nav>

        <div className="mt-auto space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-executive-navy truncate">{user.displayName}</p>
                <p className="text-[10px] text-slate-400 truncate tracking-tight">
                  {lang === 'es' ? "Consultor Certificado" : "Certified Consultant"}
                </p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              {lang === 'es' ? "Cerrar Sesión" : "Logout"}
            </button>
          </div>

          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Executive engine
            </span>
            <div className="flex flex-col gap-1">
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold self-end",
                (window as any).__ENGINE_CONFIG__?.GEMINI_API_KEY && (window as any).__ENGINE_CONFIG__?.GEMINI_API_KEY.length > 30 
                  ? "bg-emerald-50 text-emerald-600" 
                  : "bg-rose-50 text-rose-600"
              )}>
                <div className={cn("w-1.5 h-1.5 rounded-full", ((window as any).__ENGINE_CONFIG__?.GEMINI_API_KEY && (window as any).__ENGINE_CONFIG__?.GEMINI_API_KEY.length > 30) ? "bg-emerald-500" : "bg-rose-500 animate-pulse")} />
                {((window as any).__ENGINE_CONFIG__?.GEMINI_API_KEY && (window as any).__ENGINE_CONFIG__?.GEMINI_API_KEY.length > 30) ? "ONLINE" : "OFFLINE"}
              </div>
              {!((window as any).__ENGINE_CONFIG__?.GEMINI_API_KEY && (window as any).__ENGINE_CONFIG__?.GEMINI_API_KEY.length > 30) && (
                <div className="space-y-2 text-right">
                  <div className="text-[8px] text-rose-400 font-bold uppercase leading-tight px-1">
                    Motor Crítico: Llave inválida detectada.
                  </div>
                  <button 
                    onClick={() => {
                      const config = (window as any).__ENGINE_CONFIG__;
                      const msg = "DIAGNÓSTICO DE CONEXIÓN:\n\n" +
                        "1. Estado: OFFLINE\n" +
                        "2. Llave elegida: " + (config?.source || 'NINGUNA') + "\n" +
                        "3. Longitud: " + (config?.GEMINI_API_KEY?.length || 0) + "\n" +
                        "4. Encontradas en Server:\n" + 
                        (config?.envKeysDetected?.map((k: any) => `- ${k.name}: ${k.len} chars`).join('\n') || 'No se detectaron llaves') + "\n\n" +
                        "SOLUCIÓN:\n" +
                        "En el deploy de GitHub/Shared App, asegúrate de añadir 'GEMINI_API_KEY' en los Secrets del proyecto desplegado.";
                      alert(msg);
                    }}
                    className="ml-auto flex items-center gap-1 px-2 py-1 bg-rose-500 text-white text-[9px] font-bold rounded hover:bg-rose-600 transition-colors"
                  >
                    <AlertCircle className="w-3 h-3" /> ARREGLAR AHORA
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {lang === 'es' ? "Idioma" : "Language"}
            </span>
            <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
              {(['es', 'en'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "px-2 py-1 text-[10px] uppercase font-bold rounded-md transition-all",
                    lang === l ? "bg-white text-executive-navy shadow-sm" : "text-slate-500"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <header className="h-20 bg-white/50 backdrop-blur-sm border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm font-medium">{lang === 'es' ? "Inicio /" : "Home /"}</span>
            <span className="text-executive-navy text-sm font-bold capitalize">
              {lang === 'es' ? (
                view === AppState.DASHBOARD ? "Panel de Control" :
                view === AppState.CLIENTS ? "Clientes" :
                view === AppState.CLIENT_DETAIL ? "Espacio de Trabajo" :
                view.toLowerCase().replace('_', ' ')
              ) : view.toLowerCase().replace('_', ' ')}
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-executive-gold rounded-full border-2 border-white" />
            </div>
            <button 
              onClick={() => setView(AppState.CLIENTS)}
              className="luxury-button !py-2 !px-5 gap-2 text-sm shadow-lg shadow-executive-navy/10"
            >
              <Plus className="w-4 h-4" />
              {lang === 'es' ? "Nuevo Análisis" : "New Analysis"}
            </button>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {view === AppState.DASHBOARD && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl font-serif text-executive-navy">
                    {lang === 'es' ? `Bienvenido de nuevo, ${user.displayName?.split(' ')[0]}` : `Welcome back, ${user.displayName?.split(' ')[0]}`}
                  </h2>
                  <p className="text-slate-500 font-light">
                    {lang === 'es' ? "Esto es lo que está pasando en tu cartera de clientes hoy." : "Here is what is happening across your client portfolio today."}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="executive-card p-6 border-l-4 border-l-executive-navy">
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-2">
                      {lang === 'es' ? "Total Clientes" : "Total Clients"}
                    </p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-4xl font-serif">12</h3>
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <Users className="w-5 h-5 text-executive-navy" />
                      </div>
                    </div>
                  </div>
                  <div className="executive-card p-6 border-l-4 border-l-executive-gold">
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-2">
                      {lang === 'es' ? "Análisis Pendientes" : "Pending Analysis"}
                    </p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-4xl font-serif">8</h3>
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <FileText className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                  </div>
                  <div className="executive-card p-6 border-l-4 border-l-emerald-500">
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-2">
                      {lang === 'es' ? "Score Medio de Colocación" : "Avg. Placement Score"}
                    </p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-4xl font-serif">84%</h3>
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                  <div className="executive-card p-6 border-l-4 border-l-blue-500">
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-2">
                      {lang === 'es' ? "Matches de Mercado" : "Market Matches"}
                    </p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-4xl font-serif">156</h3>
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-serif text-executive-navy">
                        {lang === 'es' ? "Diagnósticos Clínicos Recientes" : "Recent Clinical Diagnostics"}
                      </h3>
                      <button onClick={() => setView(AppState.CLIENTS)} className="text-xs font-bold text-executive-gold flex items-center gap-1 hover:underline">
                        {lang === 'es' ? "Ver Todo" : "View All"} <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-serif text-xl font-bold text-slate-400 group-hover:bg-executive-navy group-hover:text-executive-gold transition-colors">
                              {i === 1 ? 'JD' : i === 2 ? 'ML' : 'RB'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-executive-navy">
                                {lang === 'es' ? `Nombre Cliente ${i}` : `Client Name ${i}`}
                              </p>
                              <p className="text-xs text-slate-500">
                                {lang === 'es' ? "VP Operaciones • Sector Tecnología" : "VP Operations • Technology Industry"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="text-xs font-bold text-emerald-600">82% ATS Score</p>
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                                {lang === 'es' ? "Match Optimizado" : "Match Optimized"}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-executive-navy group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-serif text-executive-navy">
                      {lang === 'es' ? "Pulso Estratégico de Mercado" : "Strategic Market Pulse"}
                    </h3>
                    <div className="executive-card p-6 bg-executive-navy text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
                        <Globe className="w-24 h-24 text-executive-gold" />
                      </div>
                      <div className="relative z-10 space-y-4">
                        <span className="px-2 py-1 bg-executive-gold/20 text-executive-gold rounded text-[10px] font-bold uppercase tracking-wider">
                          {lang === 'es' ? "Tendencia Ahora" : "Trending Now"}
                        </span>
                        <h4 className="text-lg font-serif italic text-executive-gold/90">
                          {lang === 'es' ? "Expansión en Fintech LATAM" : "Expansion into LATAM Fintech"}
                        </h4>
                        <p className="text-sm text-slate-300 font-light leading-relaxed">
                          {lang === 'es' 
                            ? "Vemos un aumento del 15% en la demanda de ejecutivos C-Level con experiencia regulatoria multi-país." 
                            : "We are seeing a 15% surge in demand for C-Level executives with multi-country regulatory experience."}
                        </p>
                        <button className="text-xs font-bold text-white flex items-center gap-2 pt-2 group">
                          {lang === 'es' ? "Ver Análisis de Industria" : "View Industry Analysis"} <ChevronRight className="w-4 h-4 text-executive-gold group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === AppState.CLIENTS && (
              <motion.div key="clients" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex flex-col gap-1 mb-8">
                  <h2 className="text-3xl font-serif text-executive-navy">
                    {lang === 'es' ? "Cartera de Clientes" : "Client Portfolio"}
                  </h2>
                  <p className="text-slate-500 font-light">
                    {lang === 'es' ? "Gestión y mapeo estratégico de carrera para tus candidatos ejecutivos." : "Management and strategic career mapping for your executive candidates."}
                  </p>
                </div>
                <ClientList user={user} lang={lang} onSelectClient={handleSelectClient} />
              </motion.div>
            )}

            {view === AppState.CLIENT_DETAIL && selectedClient && (
              <motion.div key="client-detail" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <ClientDetail 
                  user={user}
                  client={selectedClient} 
                  lang={lang} 
                  onBack={() => {
                    setSelectedClient(null);
                    setView(AppState.CLIENTS);
                  }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

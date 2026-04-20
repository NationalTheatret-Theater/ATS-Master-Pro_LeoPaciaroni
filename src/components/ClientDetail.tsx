import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  History, 
  Target, 
  Award, 
  TrendingUp, 
  Briefcase, 
  Download, 
  Trash2, 
  Upload, 
  ChevronRight,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileSearch,
  CheckCircle2,
  ArrowUpRight,
  ExternalLink,
  Globe
} from 'lucide-react';
import { db, auth } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { Client, Resume, JobDescription, Analysis, Language } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { processFile } from '../services/fileProcessing';
import { geminiService } from '../services/gemini';
import { ExecutiveReport } from './ExecutiveReport';

interface ClientDetailProps {
  user: any;
  client: Client;
  lang: Language;
  onBack: () => void;
}

export const ClientDetail: React.FC<ClientDetailProps> = ({ user, client, lang, onBack }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'resumes' | 'jobs' | 'analyses'>('overview');
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [viewAnalysisId, setViewAnalysisId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const qResumes = query(collection(db, 'clients', client.id, 'resumes'), orderBy('createdAt', 'desc'));
      const qJobs = query(collection(db, 'clients', client.id, 'jobs'), orderBy('createdAt', 'desc'));
      const qAnalyses = query(collection(db, 'clients', client.id, 'analyses'), orderBy('createdAt', 'desc'));

      const [rSnap, jSnap, aSnap] = await Promise.all([
        getDocs(qResumes),
        getDocs(qJobs),
        getDocs(qAnalyses)
      ]);

      setResumes(rSnap.docs.map(d => ({ id: d.id, ...d.data() } as Resume)));
      setJobs(jSnap.docs.map(d => ({ id: d.id, ...d.data() } as JobDescription)));
      setAnalyses(aSnap.docs.map(d => ({ id: d.id, ...d.data() } as Analysis)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [client.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'job') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      const rawText = await processFile(file);
      
      if (type === 'resume') {
        const parsed = await geminiService.parseResume(rawText, lang);
        await addDoc(collection(db, 'clients', client.id, 'resumes'), {
          clientId: client.id,
          fileName: file.name,
          fileType: file.name.endsWith('.pdf') ? 'pdf' : 'docx',
          rawText,
          parsedJson: parsed,
          language: lang,
          versionName: `Version ${resumes.length + 1}`,
          ownerId: user.uid,
          createdAt: serverTimestamp()
        });
      } else {
        const parsed = await geminiService.parseJob(rawText, lang);
        await addDoc(collection(db, 'clients', client.id, 'jobs'), {
          clientId: client.id,
          title: parsed.role || file.name,
          companyName: parsed.company || 'Unknown',
          rawText,
          parsedJson: parsed,
          language: lang,
          ownerId: user.uid,
          createdAt: serverTimestamp()
        });
      }
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Error processing file');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedResumeId || !user) return;
    
    const resume = resumes.find(r => r.id === selectedResumeId);
    const job = jobs.find(j => j.id === selectedJobId);
    
    if (!resume) return;

    setIsAnalyzing(true);
    try {
      const results = await geminiService.analyzeExecutive(resume.parsedJson, job?.parsedJson || null, lang);
      
      const analysisData = {
        clientId: client.id,
        resumeId: selectedResumeId,
        jobDescriptionId: selectedJobId || null,
        analysisName: job ? (lang === 'es' ? `Match: ${job.title}` : `Match: ${job.title}`) : (lang === 'es' ? 'Diagnóstico General' : 'General Diagnosis'),
        scores: results.scores,
        strengths: results.strengths,
        gaps: results.gaps,
        alerts: results.alerts,
        recommendations: results.recommendations,
        marketPulse: results.marketPulse,
        linkedInPulse: results.linkedInPulse,
        careerOrientation: results.careerOrientation,
        careerMap: results.careerMap,
        improvedCV: results.improvedCV,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'clients', client.id, 'analyses'), analysisData);
      fetchData();
      setActiveTab('analyses');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Profile */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-executive-navy flex items-center justify-center font-serif text-3xl font-bold text-executive-gold shadow-xl shadow-executive-navy/20">
            {client.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-serif text-executive-navy">{client.fullName}</h2>
              <span className="px-3 py-1 bg-executive-gold text-executive-navy rounded-full text-[10px] font-bold uppercase tracking-wider">{client.targetSeniority}</span>
            </div>
            <p className="text-slate-500 font-medium text-lg">{client.targetRole} | {client.targetIndustry}</p>
            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {client.targetCountry}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-executive-gold" /> {resumes.length} CVs Optimized</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-500 font-medium hover:bg-slate-50 transition-colors"
          >
            {lang === 'es' ? "Volver a la Lista" : "Back to List"}
          </button>
          <button className="luxury-button gap-2">
            <Plus className="w-4 h-4" />
            {lang === 'es' ? "Nueva Nota de Cliente" : "New Client Note"}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-8 border-b border-slate-100 overflow-x-auto">
        {(['overview', 'resumes', 'jobs', 'analyses'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
              activeTab === tab ? "text-executive-navy" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab === 'overview' ? (lang === 'es' ? "Resumen" : "Overview") : 
             tab === 'resumes' ? (lang === 'es' ? "CVs / Resumes" : "Resumes") : 
             tab === 'jobs' ? (lang === 'es' ? "Cargos / JDs" : "Jobs") : 
             (lang === 'es' ? "Análisis" : "Analyses")}
            {activeTab === tab && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-executive-gold rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              <div className="executive-card p-8">
                <h3 className="text-xl font-serif mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-executive-gold" />
                  {lang === 'es' ? "Resumen de Diagnóstico" : "Diagnostic Summary"}
                </h3>
                {analyses.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                          {lang === 'es' ? "Último Match Personalizado" : "Last Personalized Match"}
                        </p>
                        <p className="text-2xl font-serif text-executive-navy">{analyses[0].scores.personalization}%</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                          {lang === 'es' ? "Presencia Ejecutiva" : "Exec. Presence"}
                        </p>
                        <p className="text-2xl font-serif text-executive-navy">{analyses[0].scores.executive}%</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                          {lang === 'es' ? "Señal de Parsing" : "Parsing Signal"}
                        </p>
                        <p className="text-2xl font-serif text-executive-navy">{analyses[0].scores.parsing}%</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">
                        {lang === 'es' ? "Fortaleza Estratégica Principal" : "Top Strategic Strength"}
                      </p>
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                          {analyses[0].strengths[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-400 mb-6 italic">
                      {lang === 'es' ? "Sube un CV para comenzar el diagnóstico clínico." : "Upload a resume to start the clinical diagnosis."}
                    </p>
                    <button onClick={() => setActiveTab('resumes')} className="luxury-button-outline !py-2">
                      {lang === 'es' ? "Subir Primer CV" : "Upload First Resume"}
                    </button>
                  </div>
                )}
              </div>

              {resumes.length > 0 && (
                <div className="executive-card p-8">
                  <h3 className="text-xl font-serif mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-executive-navy" />
                    {lang === 'es' ? "Versionado de Carrera Reciente" : "Recent Career Versioning"}
                  </h3>
                  <div className="space-y-4">
                    {resumes.slice(0, 5).map(r => (
                      <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group cursor-pointer" onClick={() => setActiveTab('resumes')}>
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-lg border border-slate-200 text-executive-navy group-hover:bg-executive-navy group-hover:text-executive-gold">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-executive-navy">{r.versionName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {r.createdAt?.toDate ? new Date(r.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-executive-navy transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="p-8 bg-executive-navy rounded-3xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Target className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-6">
                  <h3 className="text-xl font-serif text-executive-gold underline underline-offset-8">
                    {lang === 'es' ? "Análisis Estratégico" : "Strategic Analysis"}
                  </h3>
                  <div className="space-y-4">
                    {resumes.length === 0 ? (
                      <div className="p-6 bg-white/5 border border-dashed border-white/20 rounded-2xl text-center space-y-4">
                        <p className="text-xs text-slate-300">
                          {lang === 'es' ? "Para comenzar un análisis, primero debes subir el currículum de tu cliente." : "To start an analysis, you must first upload your client's resume."}
                        </p>
                        <label className="luxury-button mx-auto py-2 flex items-center justify-center gap-2 cursor-pointer w-full">
                          <Upload className="w-4 h-4" />
                          {lang === 'es' ? "Subir CV Ahora" : "Upload CV Now"}
                          <input type="file" className="hidden" accept=".pdf,.docx" onChange={e => handleFileUpload(e, 'resume')} />
                        </label>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                            {lang === 'es' ? "Seleccionar CV" : "Select Resume"}
                          </label>
                          <select 
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                            value={selectedResumeId || ''}
                            onChange={e => setSelectedResumeId(e.target.value)}
                          >
                            <option value="" className="bg-executive-navy text-white">
                              {lang === 'es' ? "Selecciona una versión..." : "Select a version..."}
                            </option>
                            {resumes.map(r => <option key={r.id} value={r.id} className="bg-executive-navy text-white">{r.versionName}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                             {lang === 'es' ? "Seleccionar Cargo (Opcional)" : "Select Target Job (Optional)"}
                          </label>
                          <select 
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                            value={selectedJobId || ''}
                            onChange={e => setSelectedJobId(e.target.value)}
                          >
                            <option value="" className="bg-executive-navy text-white">
                              {lang === 'es' ? "Pulso de Mercado General..." : "General Market Pulse..."}
                            </option>
                            {jobs.map(j => <option key={j.id} value={j.id} className="bg-executive-navy text-white">{j.title}</option>)}
                          </select>
                        </div>
                        <button 
                          disabled={!selectedResumeId || isAnalyzing}
                          onClick={handleStartAnalysis}
                          className="w-full py-3 bg-executive-gold text-executive-navy font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50"
                        >
                          {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSearch className="w-5 h-5" />}
                          {lang === 'es' ? "Ejecutar Escaneo Intelectivo" : "Execute Intel Scan"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="executive-card p-6 border-slate-200">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                  {lang === 'es' ? "Inteligencia de Mercado Objetivo" : "Target Market Intelligence"}
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-1 h-12 bg-executive-gold rounded-full" />
                    <div>
                      <p className="text-xs font-bold text-executive-navy">
                        {lang === 'es' ? "Tendencia de la Industria" : "Industry Trend"}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        {lang === 'es' ? "Fase de Consolidación" : "Consolidation Phase"}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {lang === 'es' 
                          ? "Alta demanda de especialistas en gestión de transición en este sector." 
                          : "High demand for transition management specialists in this sector."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'resumes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-serif text-executive-navy">
                {lang === 'es' ? "Repositorio de CVs" : "CV Repository"}
              </h3>
              <label className="luxury-button gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                {lang === 'es' ? "Subir Versión" : "Upload Version"}
                <input type="file" className="hidden" accept=".pdf,.docx" onChange={e => handleFileUpload(e, 'resume')} />
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map(resume => (
                <div key={resume.id} className="executive-card group">
                  <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                    <div className="p-3 bg-slate-50 group-hover:bg-executive-navy transition-colors rounded-xl">
                      <FileText className="w-6 h-6 text-executive-navy group-hover:text-executive-gold" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{resume.fileType}</p>
                      <button className="text-slate-300 hover:text-rose-500 transition-colors mt-2"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50/50">
                    <h4 className="font-bold text-executive-navy mb-1">{resume.versionName}</h4>
                    <p className="text-xs text-slate-500 mb-4 truncate italic">{resume.fileName}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Uploaded {new Date(resume.createdAt?.toDate()).toLocaleDateString()}</span>
                      <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                        <Download className="w-4 h-4 text-executive-navy" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'jobs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-serif text-executive-navy">
                {lang === 'es' ? "Especificaciones de Cargos" : "Role Specifications"}
              </h3>
              <label className="luxury-button gap-2 cursor-pointer">
                <Plus className="w-4 h-4" />
                {lang === 'es' ? "Agregar Aviso" : "Add Job Notice"}
                <input type="file" className="hidden" accept=".pdf,.docx" onChange={e => handleFileUpload(e, 'job')} />
              </label>
            </div>
            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job.id} className="executive-card p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-executive-paper border border-slate-100 flex items-center justify-center">
                      <Briefcase className="w-7 h-7 text-executive-navy" />
                    </div>
                    <div>
                      <h4 className="font-bold text-executive-navy">{job.title}</h4>
                      <p className="text-sm text-slate-500">{job.companyName}</p>
                      <div className="flex gap-2 mt-2">
                        {job.parsedJson?.atsKeywords?.slice(0, 3).map((k: string) => (
                          <span key={k} className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded uppercase">{k}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-white">View Details</button>
                    <button className="text-rose-500 p-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'analyses' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
             {viewAnalysisId ? (
               <div className="space-y-6">
                 <button 
                  onClick={() => setViewAnalysisId(null)}
                  className="flex items-center gap-2 text-sm font-bold text-executive-navy hover:text-executive-gold transition-colors"
                 >
                   <ArrowRight className="w-4 h-4 rotate-180" /> {lang === 'es' ? "Volver a Reportes" : "Back to Reports"}
                 </button>
                 <ExecutiveReport 
                  analysis={analyses.find(a => a.id === viewAnalysisId)!} 
                  lang={lang} 
                 />
               </div>
             ) : (
               <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-serif text-executive-navy">
                    {lang === 'es' ? "Reportes de Inteligencia" : "Intelligence Reports"}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium">
                      {lang === 'es' ? "Registros Históricos:" : "Historical Records:"} {analyses.length}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {analyses.map(analysis => (
                    <div key={analysis.id} className="executive-card p-6 flex items-center justify-between group hover:border-executive-gold transition-all">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center font-serif text-2xl font-bold border",
                          analysis.scores.overall >= 80 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-amber-50 border-amber-100 text-amber-600"
                        )}>
                          {Math.round(analysis.scores.overall)}%
                        </div>
                        <div>
                          <h4 className="font-bold text-executive-navy text-lg">{analysis.analysisName}</h4>
                          <p className="text-sm text-slate-500">{analysis.createdAt?.toDate ? new Date(analysis.createdAt.toDate()).toLocaleString() : 'Recent'}</p>
                          <div className="flex gap-4 mt-3">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                {lang === 'es' ? "Compatibilidad ATS" : "ATS Compatibility"}
                              </span>
                              <span className="text-xs font-bold text-executive-navy">{analysis.scores.ats}%</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                {lang === 'es' ? "Posición Ejecutiva" : "Executive Positioning"}
                              </span>
                              <span className="text-xs font-bold text-executive-navy">{analysis.scores.executive}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button className="luxury-button-outline !py-2 !px-5 gap-2 text-xs">
                          <Download className="w-3.5 h-3.5" />
                          {lang === 'es' ? "Exportar Reporte" : "Export Report"}
                        </button>
                        <button 
                          onClick={() => setViewAnalysisId(analysis.id)}
                          className="luxury-button !py-2 !px-5 gap-2 text-xs"
                        >
                          {lang === 'es' ? "Abrir Engine Report" : "Open Engine Report"} <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
               </>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay for Analysis */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-executive-navy/60 backdrop-blur-md">
           <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-[2rem] max-w-lg w-full text-center space-y-8 shadow-2xl relative"
           >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 rounded-3xl bg-executive-gold flex items-center justify-center shadow-2xl animate-bounce">
                  <Loader2 className="w-10 h-10 text-executive-navy animate-spin" />
                </div>
              </div>
              <div className="space-y-4 pt-4">
                <h3 className="text-3xl font-serif text-executive-navy">
                  {lang === 'es' ? "Ejecutando Escaneo Intelectivo" : "Executing Intelligence Scan"}
                </h3>
                <p className="text-slate-500 font-light text-lg">
                  {lang === 'es' 
                    ? "Cruzando señales ejecutivas contra benchmarks industriales y algoritmos ATS." 
                    : "Cross-referencing executive signals against industry benchmarks and ATS algorithms."}
                </p>
              </div>
              <div className="space-y-6">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 10, ease: "linear" }}
                    className="h-full bg-executive-navy"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase">
                     <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {lang === 'es' ? "Procesando CV" : "Parsing Resume"}
                   </div>
                   <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase">
                     <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {lang === 'es' ? "Mapeando Logros" : "Mapping Achievements"}
                   </div>
                   <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase">
                     <Loader2 className="w-4 h-4 animate-spin text-executive-gold" /> {lang === 'es' ? "Gaps Críticos" : "Critical Gaps"}
                   </div>
                   <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase">
                     <Loader2 className="w-4 h-4 text-slate-200" /> {lang === 'es' ? "Pulso de Mercado" : "Market Pulse"}
                   </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {lang === 'es' ? "Aplicando Motor de Simulación iCIMS & Greenhouse" : "Applying iCIMS & Greenhouse Simulation Engine"}
              </p>
           </motion.div>
        </div>
      )}
    </div>
  );
};

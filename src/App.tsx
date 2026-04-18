import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Briefcase, RefreshCw, AlertTriangle, Maximize2, 
  Home, TrendingUp, BrainCircuit, CheckCircle, LayoutDashboard, 
  FileEdit, Target, ChevronRight, Menu, X, ShieldCheck, PieChart, Search, Sparkles, Layers, ArrowRight, Linkedin, PlayCircle, Globe,
  UploadCloud, FileType, Check, Github
} from 'lucide-react';
import { AppState, ATSAnalysis, OptimizationResult, TailoredResult, LinkedInInsight, Language, GitHubInsight } from './types';
import { UI_TEXTS } from './constants';
import * as LocalEngine from './services/localEngine';
import * as FileProcessingService from './services/fileProcessing';
import { ScoreGauge } from './components/AnalysisCharts';
import { CVDisplay } from './components/CVDisplay';
import { AnalysisModal } from './components/AnalysisModal';
import { VocationalReport } from './components/VocationalReport';
import { LinkedInInsights } from './components/LinkedInInsights';
import { GitHubInsights } from './components/GitHubInsights';
import { ChatAssistant } from './components/ChatAssistant';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('es');
  const [currentState, setCurrentState] = useState<AppState>(AppState.INPUT);
  const [cvText, setCvText] = useState<string>('');
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [originalScore, setOriginalScore] = useState<number | null>(null);
  const [optimizedCV, setOptimizedCV] = useState<OptimizationResult | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [tailoredResult, setTailoredResult] = useState<TailoredResult | null>(null);
  const [linkedInInsight, setLinkedInInsight] = useState<LinkedInInsight | null>(null);
  const [gitHubInsight, setGitHubInsight] = useState<GitHubInsight | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const t = UI_TEXTS[lang];

  useEffect(() => {
    // Initial check for mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const resetApp = () => {
    setCurrentState(AppState.INPUT);
    setCvText('');
    setAnalysis(null);
    setOptimizedCV(null);
    setJobDescription('');
    setTailoredResult(null);
    setLinkedInInsight(null);
    setGitHubInsight(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processUploadedFile(file);
    }
  };

  const processUploadedFile = async (file: File) => {
    setIsProcessing(true);
    setProcessingMsg(t.fileProcessing);
    setErrorMsg(null);
    try {
      const text = await FileProcessingService.processFile(file);
      setCvText(text);
      setSuccessMsg(lang === 'es' ? "Archivo procesado y limpiado correctamente" : "File processed and cleaned successfully");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (lang === 'es' ? "Error al leer el archivo" : "Error reading file"));
    } finally {
      setIsProcessing(false);
      setProcessingMsg('');
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processUploadedFile(file);
    }
  };

  const handleAnalyze = async (textToAnalyze: string = cvText, isComparison: boolean = false) => {
    if (textToAnalyze.trim().length < 50) { 
        setErrorMsg(lang === 'es' ? "El CV es demasiado corto." : "CV is too short."); 
        return; 
    }
    setIsProcessing(true); 
    setProcessingMsg(t.analyzing);
    setErrorMsg(null);
    try {
      // 1. Core Analysis
      const ana = await LocalEngine.analyzeCV(textToAnalyze, lang);
      
      if (isComparison && originalScore !== null) {
        ana.originalScore = originalScore;
        ana.optimizedScore = ana.overallScore;
      } else {
        setOriginalScore(ana.overallScore);
      }

      setAnalysis(ana);
      
      // 2. Optimization
      const opt = await LocalEngine.optimizeCV(textToAnalyze, ana, lang);
      setOptimizedCV(opt);
      
      setSuccessMsg(t.successAnalysis);
      setCurrentState(AppState.RESULTS);
    } catch (e) { 
      setErrorMsg(lang === 'es' ? "Error en el análisis Neural." : "Analysis failed."); 
    } finally { 
      setIsProcessing(false); 
      setProcessingMsg('');
    }
  };

  const handleReanalyzeOptimized = () => {
    if (optimizedCV?.markdownCV) {
        handleAnalyze(optimizedCV.markdownCV, true);
    }
  };

  const handleTailor = async () => {
    if (!jobDescription.trim() || !optimizedCV) return;
    setIsProcessing(true);
    setProcessingMsg(t.syncing);
    try {
      const res = await LocalEngine.tailorCVToJob(optimizedCV.markdownCV, jobDescription, lang);
      setTailoredResult(res);
      setSuccessMsg(t.successTailor);
    } catch (e) { 
      setErrorMsg(lang === 'es' ? "Error en el calce estratégico." : "Tailoring failed."); 
    } finally { 
      setIsProcessing(false); 
      setProcessingMsg('');
    }
  };

  const handleLinkedInAnalysis = async () => {
     if (!analysis && !cvText) { setCurrentState(AppState.INPUT); return; }
     if (linkedInInsight) { setCurrentState(AppState.LINKEDIN); return; } 

     setIsProcessing(true);
     setProcessingMsg(t.connectLinkedIn);
     try {
        const insights = await LocalEngine.getLinkedInInsights(optimizedCV?.markdownCV || cvText, lang);
        setLinkedInInsight(insights);
        setCurrentState(AppState.LINKEDIN);
     } catch (e) {
        setErrorMsg(lang === 'es' ? "Error conectando con LinkedIn Insights." : "LinkedIn error.");
     } finally {
        setIsProcessing(false);
        setProcessingMsg('');
     }
  };

  const handleNavClick = (state: AppState) => {
    setCurrentState(state);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleGitHubAnalysis = async () => {
    if (!analysis && !cvText) { setCurrentState(AppState.INPUT); return; }
    if (gitHubInsight) { setCurrentState(AppState.GITHUB); return; }

    setIsProcessing(true);
    setProcessingMsg(t.connectGitHub);
    try {
       const insights = await LocalEngine.getGitHubInsights(optimizedCV?.markdownCV || cvText, lang);
       setGitHubInsight(insights);
       setCurrentState(AppState.GITHUB);
    } catch (e) {
       setErrorMsg(lang === 'es' ? "Error conectando con GitHub Neural Core." : "GitHub error.");
    } finally {
       setIsProcessing(false);
       setProcessingMsg('');
    }
  };

  const NavItem = ({ state, icon: Icon, label, onClickOverride }: { state?: AppState, icon: any, label: string, onClickOverride?: () => void }) => (
    <button 
      onClick={onClickOverride ? () => { onClickOverride(); if(window.innerWidth < 768) setIsSidebarOpen(false); } : () => state && handleNavClick(state)}
      className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 group ${
        currentState === state 
          ? 'bg-primary text-white shadow-vibrant' 
          : 'text-text-muted hover:bg-indigo-50 hover:text-primary'
      }`}
    >
      <Icon size={20} className={currentState === state ? 'text-white' : 'text-slate-400 group-hover:text-primary'} />
      <span className={`font-bold text-sm ${!isSidebarOpen && 'md:hidden'}`}>{label}</span>
      {currentState === state && isSidebarOpen && <ChevronRight size={16} className="ml-auto" />}
    </button>
  );

  const EmptyState = ({ title, description, icon: Icon, actionLabel, onAction }: any) => (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-slate-100 p-6 rounded-full mb-6">
        <Icon size={48} className="text-slate-300" />
      </div>
      <h3 className="text-xl font-black text-slate-700 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-md mb-8 leading-relaxed">{description}</p>
      <button 
        onClick={onAction}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
      >
        {actionLabel} <ArrowRight size={16} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-app-bg flex overflow-hidden selection:bg-indigo-100">
      
      {/* SUCCESS BANNER OVERLAY */}
      {successMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
           <div className="bg-primary text-white px-8 py-4 rounded-pill shadow-vibrant flex items-center gap-3 border border-indigo-400">
              <div className="bg-white/20 p-1 rounded-full"><CheckCircle size={20} /></div>
              <span className="font-black text-sm uppercase tracking-widest">{successMsg}</span>
           </div>
        </div>
      )}

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={`fixed inset-y-0 left-0 md:relative bg-white border-r border-indigo-100 flex flex-col transition-all duration-300 z-50 print:hidden 
          ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 w-72 md:w-20'}
        `}
      >
        <div className="h-24 flex items-center px-6 gap-3 border-b border-indigo-50">
          <div className="bg-primary p-2.5 rounded-2xl shadow-vibrant flex-shrink-0">
            <FileText className="text-white" size={24} />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
              <h1 className="font-black text-xl text-primary tracking-tighter">ATS MASTER PRO</h1>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] leading-none mt-1">Neural suite v4.2</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-6">
          <NavItem state={AppState.INPUT} icon={Home} label={t.navHome} />
          <NavItem state={AppState.RESULTS} icon={LayoutDashboard} label={t.navResults} />
          <NavItem state={AppState.TAILORING} icon={Target} label={t.navTailor} />
          <NavItem state={AppState.LINKEDIN} icon={Linkedin} label={t.navLinkedIn} onClickOverride={handleLinkedInAnalysis} />
          <NavItem state={AppState.GITHUB} icon={Github} label={t.navGitHub} onClickOverride={handleGitHubAnalysis} />
        </nav>

        <div className="p-4 border-t border-indigo-50">
          {analysis && isSidebarOpen && (
            <button 
              onClick={() => { setIsModalOpen(true); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
              className="w-full mb-4 flex items-center gap-2 px-4 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-vibrant"
            >
              <Maximize2 size={16} /> {lang === 'es' ? 'Ver Dashboard Raw' : 'View Raw Dashboard'}
            </button>
          )}
          
          {/* LANGUAGE TOGGLE */}
          {isSidebarOpen ? (
             <div className="flex bg-indigo-50 p-1 rounded-pill mb-4 border border-indigo-100">
                <button onClick={()=>setLang('es')} className={`flex-1 py-2 rounded-pill text-xs font-black transition-all ${lang === 'es' ? 'bg-primary shadow-vibrant text-white' : 'text-text-muted hover:text-primary'}`}>ES</button>
                <button onClick={()=>setLang('en')} className={`flex-1 py-2 rounded-pill text-xs font-black transition-all ${lang === 'en' ? 'bg-primary shadow-vibrant text-white' : 'text-text-muted hover:text-primary'}`}>EN</button>
             </div>
          ) : (
             <button onClick={()=>setLang(lang === 'es' ? 'en' : 'es')} className="w-full mb-4 flex justify-center p-2 bg-indigo-50 rounded-xl text-primary font-black text-xs">{lang.toUpperCase()}</button>
          )}

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-3 text-text-muted hover:text-primary hover:bg-indigo-50 rounded-2xl transition-all"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-screen print:h-auto print:overflow-visible w-full">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-indigo-100 flex items-center justify-between px-4 md:px-12 flex-shrink-0 print:hidden shadow-sm">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="md:hidden p-3 text-primary bg-indigo-50 rounded-2xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-primary tracking-tighter line-clamp-1">
                {currentState === AppState.INPUT && (lang === 'en' ? "Neural Profile Input" : "Carga de Perfil Neural")}
                {currentState === AppState.RESULTS && t.resultsTitle}
                {currentState === AppState.TAILORING && t.tailorTitle}
                {currentState === AppState.LINKEDIN && t.linkedInTitle}
              </h2>
              <p className="text-[10px] md:text-xs text-text-muted font-bold uppercase tracking-[0.2em] hidden md:block mt-1">
                {currentState === AppState.INPUT && (lang === 'en' ? "Initialize semantic analysis sequence" : "Iniciando secuencia de análisis semántico")}
                {currentState === AppState.RESULTS && t.resultsSubtitle}
                {currentState === AppState.TAILORING && t.tailorSubtitle}
                {currentState === AppState.LINKEDIN && t.linkedInSubtitle}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             {isProcessing && (
               <div className="flex items-center gap-3 px-5 py-2.5 bg-primary text-white rounded-pill text-[11px] font-black uppercase tracking-widest shadow-vibrant animate-pulse border border-indigo-400">
                 <RefreshCw size={16} className="animate-spin" /> <span className="hidden md:inline">{processingMsg}</span>
               </div>
             )}
             <div className="h-10 w-10 md:h-12 md:w-12 bg-indigo-50 rounded-2xl border-2 border-white shadow-vibrant flex items-center justify-center text-primary font-black text-sm uppercase">
               LP
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar print:p-0 print:overflow-visible">
          {currentState === AppState.INPUT && (
            <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-pill text-[10px] font-black uppercase tracking-[0.2em] border border-secondary/20">
                      <Sparkles size={14}/> {t.heroSubtitle}
                  </div>
                  <h3 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter leading-[0.9]">{t.heroTitle}</h3>
              </div>
              
              <div className="bg-white p-6 md:p-12 rounded-container shadow-vibrant border border-white relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent opacity-50"></div>
                  
                  {/* UPLOAD AREA */}
                  <div 
                    className={`mb-8 p-12 border-4 border-dashed rounded-container flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-primary bg-indigo-50 scale-[0.98]' : 'border-indigo-50 hover:border-indigo-200 hover:bg-indigo-50/30'}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                       type="file" 
                       ref={fileInputRef} 
                       className="hidden" 
                       accept=".pdf,.docx,.txt" 
                       onChange={handleFileUpload}
                    />
                    <div className="p-6 bg-primary/10 text-primary rounded-container mb-6 group-hover:scale-110 transition-transform">
                        <UploadCloud size={48} />
                    </div>
                    <p className="text-2xl font-black text-text-main mb-2">{t.uploadTitle}</p>
                    <p className="text-text-muted font-bold uppercase tracking-widest text-xs">{t.uploadDesc}</p>
                  </div>

                  <div className="flex items-center gap-6 mb-8">
                     <div className="h-px bg-indigo-50 flex-1"></div>
                     <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Neural Bridge</span>
                     <div className="h-px bg-indigo-50 flex-1"></div>
                  </div>

                  <textarea 
                      className="w-full h-64 p-8 border-2 border-indigo-50 rounded-card bg-indigo-50/20 text-lg font-medium focus:bg-white focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none resize-none custom-scrollbar" 
                      placeholder={t.placeholder}
                      value={cvText} 
                      onChange={e=>setCvText(e.target.value)} 
                  />
                  
                  <div className="mt-10">
                      <button 
                          onClick={() => handleAnalyze()} 
                          disabled={isProcessing || !cvText.trim()} 
                          className="w-full bg-primary hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-6 rounded-pill flex justify-center items-center gap-4 text-xl uppercase tracking-[0.2em] transition-all shadow-vibrant hover:-translate-y-1 relative group overflow-hidden"
                      >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          {isProcessing ? (
                             <div className="flex items-center gap-3">
                                <RefreshCw className="animate-spin" />
                                <span>{processingMsg}</span>
                             </div>
                          ) : (
                            <>
                               <BrainCircuit size={28} />
                               <span>{t.startBtn}</span>
                            </>
                          )}
                      </button>
                  </div>
                  {errorMsg && (
                    <div className="mt-6 text-secondary font-black flex gap-3 items-center bg-secondary/5 p-6 rounded-card border border-secondary/10 animate-in slide-in-from-top-4">
                      <AlertTriangle size={24}/>
                      <span className="uppercase tracking-widest text-sm">{errorMsg}</span>
                    </div>
                  )}
              </div>
            </div>
          )}

          {currentState === AppState.RESULTS && (
            <>
              {!analysis || !optimizedCV ? (
                <EmptyState 
                  title={t.emptyResultsTitle}
                  description={t.emptyResultsDesc}
                  icon={LayoutDashboard}
                  actionLabel={t.goToUpload}
                  onAction={() => setCurrentState(AppState.INPUT)}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-right-4 duration-500 relative">
                  <div className="lg:col-span-12">
                      <VocationalReport analysis={analysis} lang={lang} />
                      
                      {/* OPTIMIZED CV SECTION */}
                      <div className="mt-10 pt-10 border-t-2 border-indigo-50 no-print">
                          <div className="bg-accent p-8 rounded-card text-white shadow-vibrant flex flex-col md:flex-row items-center justify-between mb-8 gap-6 border-2 border-white/20">
                              <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner"><CheckCircle size={28}/></div>
                                <div>
                                    <p className="text-xl font-black tracking-tight">{t.optimizedReady}</p>
                                    <p className="text-xs font-bold text-accent-content/80 uppercase tracking-widest mt-1 italic">{t.optimizedDesc}</p>
                                </div>
                              </div>
                              <div className="flex gap-4 w-full md:w-auto">
                                <button 
                                  onClick={handleReanalyzeOptimized}
                                  disabled={isProcessing}
                                  className="flex-1 md:flex-none bg-indigo-900/40 hover:bg-indigo-900/60 text-white px-6 py-3 rounded-pill text-xs font-black uppercase tracking-widest transition-all flex justify-center items-center gap-3 disabled:opacity-50 border border-white/20"
                                >
                                  {isProcessing ? <RefreshCw className="animate-spin" size={16}/> : <PlayCircle size={16}/>}
                                  {t.validateBtn}
                                </button>
                                <button 
                                  onClick={() => setCurrentState(AppState.TAILORING)}
                                  className="flex-1 md:flex-none bg-white text-accent px-6 py-3 rounded-pill text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all text-center shadow-lg"
                                >
                                  {t.tailorBtn}
                                </button>
                              </div>
                          </div>
                          <div className="h-[700px] md:h-[900px]">
                            <CVDisplay markdown={optimizedCV.markdownCV} title="Editor Neural - CV Optimizado (Versión Candidata)" />
                          </div>
                      </div>

                      {/* AI ROLE SUGGESTIONS */}
                      <div className="mt-10 pt-10 border-t-2 border-indigo-50 no-print">
                        <div className="bg-white p-10 rounded-container border-2 border-indigo-50 shadow-vibrant">
                           <div className="flex items-center gap-4 mb-10">
                              <div className="p-4 bg-secondary/10 text-secondary rounded-2xl shadow-sm">
                                <Sparkles size={32} />
                              </div>
                              <div>
                                <h3 className="text-2xl font-black text-text-main tracking-tighter uppercase">{t.aiProjection}</h3>
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] mt-1">{t.topRoles}</p>
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                              {analysis.careerMatches.slice(0, 5).map((match, idx) => (
                                <div key={idx} className="bg-indigo-50/30 rounded-card p-6 border-2 border-indigo-50 hover:border-secondary hover:bg-white transition-all group flex flex-col h-full shadow-sm hover:shadow-xl hover:-translate-y-1">
                                    <div className="mb-4">
                                      <span className="inline-block px-3 py-1 bg-white text-secondary text-[10px] font-black rounded-pill border border-secondary-100 shadow-sm mb-3">
                                        RANK #{idx + 1}
                                      </span>
                                      <h4 className="font-black text-text-main text-lg leading-tight group-hover:text-secondary transition-colors line-clamp-2 h-12 uppercase tracking-tight">
                                        {match.role}
                                      </h4>
                                    </div>
                                    <div className="mt-auto">
                                      <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] text-text-muted uppercase font-black tracking-widest">{t.match}</span>
                                        <span className="text-2xl font-black text-text-main tracking-tighter">{match.matchPercentage}%</span>
                                      </div>
                                      <div className="w-full bg-indigo-100 h-2 rounded-pill overflow-hidden shadow-inner">
                                        <div 
                                          className="bg-secondary h-full rounded-pill transition-all duration-1000 shadow-sm" 
                                          style={{width: `${match.matchPercentage}%`}}
                                        ></div>
                                      </div>
                                    </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>

                  </div>
                  {/* CHAT ASSISTANT - RESULTS CONTEXT */}
                  <ChatAssistant 
                    lang={lang} 
                    contextData={JSON.stringify({ 
                        section: 'RESULTS', 
                        analysisSummary: analysis.summary, 
                        score: analysis.overallScore,
                        issues: analysis.criticalIssues
                    })} 
                  />
                </div>
              )}
            </>
          )}

          {currentState === AppState.LINKEDIN && (
             <div className="h-full animate-in fade-in slide-in-from-right-4 duration-500">
                {!linkedInInsight ? (
                     <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-container shadow-vibrant border-4 border-indigo-50">
                         <div className="relative mb-10 group">
                            <div className="p-8 bg-indigo-50 rounded-full group-hover:bg-primary transition-all duration-700"><Linkedin className="text-primary group-hover:text-white transition-colors" size={80} /></div>
                            <div className="absolute inset-0 bg-primary blur-3xl opacity-10 -z-10 animate-pulse"></div>
                         </div>
                         <h3 className="text-3xl font-black text-text-main tracking-tighter uppercase mb-4">{t.connectLinkedIn}</h3>
                         <p className="text-text-muted max-w-sm font-bold uppercase tracking-widest text-[10px] leading-relaxed">{t.linkedInSubtitle}</p>
                         <div className="mt-10 flex gap-4">
                            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-secondary rounded-full animate-bounce delay-100"></div>
                            <div className="w-3 h-3 bg-accent rounded-full animate-bounce delay-200"></div>
                         </div>
                     </div>
                ) : (
                    <LinkedInInsights data={linkedInInsight} lang={lang} />
                )}
             </div>
          )}

          {currentState === AppState.GITHUB && (
             <div className="h-full animate-in fade-in slide-in-from-right-4 duration-500">
                {!gitHubInsight ? (
                     <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-container shadow-vibrant border-4 border-slate-100">
                         <div className="relative mb-10 group">
                            <div className="p-8 bg-slate-900 rounded-full group-hover:bg-slate-700 transition-all duration-700"><Github className="text-white" size={80} /></div>
                            <div className="absolute inset-0 bg-slate-900 blur-3xl opacity-10 -z-10 animate-pulse"></div>
                         </div>
                         <h3 className="text-3xl font-black text-text-main tracking-tighter uppercase mb-4">{t.connectGitHub}</h3>
                         <p className="text-text-muted max-w-sm font-bold uppercase tracking-widest text-[10px] leading-relaxed">{t.githubSubtitle}</p>
                         <div className="mt-10 flex gap-4">
                            <div className="w-3 h-3 bg-slate-900 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                            <div className="w-3 h-3 bg-slate-300 rounded-full animate-bounce delay-200"></div>
                         </div>
                     </div>
                ) : (
                    <GitHubInsights data={gitHubInsight} lang={lang} />
                )}
             </div>
          )}

          {currentState === AppState.TAILORING && (
            <>
              {!optimizedCV ? (
                <EmptyState 
                  title={t.tailorEmptyTitle}
                  description={t.tailorEmptyDesc}
                  icon={Target}
                  actionLabel={t.navHome}
                  onAction={() => setCurrentState(AppState.INPUT)}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-[calc(100vh-220px)] animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                    <div className="flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-4">
                        <div className="bg-white p-10 rounded-container border-2 border-indigo-50 shadow-vibrant relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary opacity-20 group-focus-within:opacity-100 transition-all"></div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-primary shadow-sm"><Briefcase size={24}/></div>
                                <div>
                                    <h3 className="font-black text-2xl tracking-tighter text-text-main uppercase">Job Description Audit</h3>
                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-1">Sincronización de Vacantes Neural</p>
                                </div>
                            </div>
                            <textarea 
                                className="w-full h-48 border-2 border-indigo-50 rounded-card p-6 bg-indigo-50/20 mb-8 text-sm font-bold text-text-main focus:bg-white focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none resize-none placeholder:text-text-muted shadow-inner" 
                                placeholder={t.jdPlaceholder}
                                value={jobDescription} 
                                onChange={e=>setJobDescription(e.target.value)} 
                            />
                            <button 
                                onClick={handleTailor} 
                                disabled={isProcessing || !jobDescription.trim()} 
                                className="w-full bg-primary text-white font-black py-5 rounded-card hover:bg-indigo-700 flex justify-center items-center gap-4 transition-all shadow-vibrant hover:scale-[1.01] active:scale-[0.99] disabled:bg-indigo-100 disabled:shadow-none uppercase tracking-widest text-sm"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-3">
                                        <RefreshCw className="animate-spin" size={20} />
                                        <span>{processingMsg}</span>
                                    </div>
                                ) : (
                                    <>
                                        <Target size={20} />
                                        <span>{t.syncBtn}</span>
                                    </>
                                )}
                            </button>
                        </div>
                        
                        {tailoredResult && (
                            <div className="space-y-8 animate-in fade-in duration-700 pb-10">
                              <div className="bg-text-main text-white p-10 rounded-container shadow-vibrant border-4 border-white relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-4 opacity-5 scale-150 rotate-12"><ShieldCheck size={140} /></div>
                                  <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-6 relative z-10">
                                      <ShieldCheck size={18} /> {t.auditTitle}
                                  </h4>
                                  <div className="grid grid-cols-2 gap-10 mb-8 relative z-10">
                                      <div className="group">
                                          <div className="text-6xl font-black text-white tracking-tighter group-hover:text-accent transition-colors">{tailoredResult.verification?.finalMatchScore}<span className="text-xl">%</span></div>
                                          <div className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em] mt-2 italic">{t.finalMatch}</div>
                                      </div>
                                      <div className="group">
                                          <div className="text-6xl font-black text-accent tracking-tighter group-hover:text-white transition-colors">{tailoredResult.verification?.culturalFitScore}<span className="text-xl">%</span></div>
                                          <div className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] mt-2 italic">{t.culturalFit} (TARGET &gt;95%)</div>
                                      </div>
                                  </div>
                                  <div className="bg-white/10 p-6 rounded-card backdrop-blur-md border border-white/10 shadow-inner group">
                                      <p className="text-sm font-bold italic text-indigo-100 leading-relaxed group-hover:text-white transition-colors">"{tailoredResult.verification?.hiringManagerVerdict}"</p>
                                  </div>
                              </div>
                              
                              <div className="bg-white p-10 rounded-container border-2 border-indigo-50 shadow-vibrant relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-900 group-hover:scale-110 transition-transform"><Sparkles size={120} /></div>
                                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-3 relative z-10">
                                      <Sparkles size={18}/> {t.strategyTitle}
                                  </h4>
                                  <div className="space-y-6 relative z-10">
                                      <div className="bg-indigo-50/50 p-6 rounded-card border-2 border-indigo-50 backdrop-blur-sm">
                                          <p className="text-sm text-text-main leading-relaxed font-bold italic">
                                            "{tailoredResult.analysis}"
                                          </p>
                                      </div>
                                      <div className="space-y-4">
                                        <strong className="text-[10px] text-text-muted block mb-4 uppercase font-black tracking-[0.3em]">{t.optApplied}</strong>
                                        <div className="grid grid-cols-1 gap-3">
                                            {tailoredResult.changesMade.map((change, i) => (
                                                <div key={i} className="flex gap-4 items-center bg-indigo-50/30 p-4 rounded-2xl border border-indigo-50 hover:border-primary transition-all shadow-sm">
                                                  <div className="bg-primary text-white p-1 rounded-full shadow-sm"><Check size={12} strokeWidth={4} /></div>
                                                  <span className="text-xs text-text-main font-black uppercase tracking-tight">{change}</span>
                                                </div>
                                            ))}
                                        </div>
                                      </div>
                                  </div>
                              </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-h-0 h-full">
                        {tailoredResult ? (
                            <CVDisplay markdown={tailoredResult.markdownCV} title={`CV (${tailoredResult.matchScore}% ${t.match})`} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center border-4 border-dashed border-indigo-100 rounded-container text-indigo-200 bg-indigo-50/10 p-12 text-center group hover:bg-indigo-50/30 transition-all">
                                <div className="bg-white p-8 rounded-full shadow-vibrant mb-8 group-hover:scale-110 transition-transform"><Briefcase size={80} className="text-indigo-200 group-hover:text-primary transition-colors" /></div>
                                <h4 className="font-black text-indigo-300 uppercase tracking-[0.4em] mb-4 text-sm">{t.waitingJD}</h4>
                                <p className="text-xs text-text-muted max-w-xs mx-auto font-bold uppercase tracking-widest leading-loose">{t.waitingJDDesc}</p>
                            </div>
                        )}
                    </div>
                     {/* CHAT ASSISTANT - JOB FIT CONTEXT */}
                     {tailoredResult && (
                        <ChatAssistant 
                            lang={lang} 
                            contextData={JSON.stringify({ 
                                section: 'JOB_FIT', 
                                matchScore: tailoredResult.matchScore,
                                gapAnalysis: tailoredResult.verification?.gapAnalysis,
                                jobDescription: jobDescription.substring(0, 500) + "..." // Truncate to save tokens but give context
                            })} 
                        />
                     )}
                </div>
              )}
            </>
          )}
        </div>

        <footer className="h-12 bg-white border-t-2 border-indigo-50 flex items-center justify-center px-10 flex-shrink-0 print:hidden relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
           <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.5em] opacity-40">ATS Master Pro v4.2 • Procedimiento Neural de Proyección de Carrera completado</p>
        </footer>

        {analysis && <AnalysisModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} analysis={analysis} lang={lang} />}
      </main>
    </div>
  );
};

export default App;

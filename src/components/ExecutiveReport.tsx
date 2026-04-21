import React from 'react';
import { 
  Linkedin, 
  Target, 
  Map as MapIcon, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Award,
  Globe,
  Briefcase,
  ChevronDown,
  Download,
  Info,
  TrendingUp as PulseIcon
} from 'lucide-react';
import { Analysis, Language, SuggestedRole } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { exportToWord } from '../lib/exportUtils';

interface ExecutiveReportProps {
  analysis: Analysis;
  lang: Language;
}

export const ExecutiveReport: React.FC<ExecutiveReportProps> = ({ analysis, lang }) => {
  const scores = analysis.scores;
  const [selectedRole, setSelectedRole] = React.useState<SuggestedRole | null>(null);

  const ScoreCard = ({ title, score, weight }: { title: string, score: number, weight: string }) => (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
        <span className="text-[10px] font-bold text-executive-gold">{weight}</span>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-serif text-executive-navy">{score}%</div>
        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-1000", score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500")}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Header & Overall Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-4xl font-serif text-executive-navy">
            {lang === 'es' ? "Dashboard Ejecutivo de Inteligencia" : "Executive Intelligence Dashboard"}
          </h2>
          <p className="text-slate-500 font-light text-lg">
            {lang === 'es' 
              ? "Análisis determinístico de posicionamiento, mercado y transitabilidad ejecutiva." 
              : "Deterministic analysis of positioning, market, and executive transferability."}
          </p>
        </div>
        <div className="bg-executive-navy p-8 rounded-[2.5rem] flex items-center justify-between text-white relative overflow-hidden shadow-2xl shadow-executive-navy/30">
          <div className="relative z-10">
            <p className="text-xs font-bold text-executive-gold uppercase tracking-[0.2em] mb-1">Overall Engine Score</p>
            <h3 className="text-6xl font-serif font-bold">{scores.overall}%</h3>
          </div>
          <div className="w-24 h-24 rounded-full border-8 border-executive-gold/20 flex items-center justify-center relative z-10">
             <div className="absolute inset-0 border-t-8 border-executive-gold rounded-full animate-spin-slow" />
             <Award className="w-10 h-10 text-executive-gold" />
          </div>
        </div>
      </div>

      {/* 2. 8-Dimension Scoring Matrix */}
      <div className="space-y-6">
        <h3 className="text-xl font-serif text-executive-navy border-l-4 border-executive-gold pl-4">
          {lang === 'es' ? "Matriz de Scoring (8 Dimensiones)" : "Scoring Matrix (8 Dimensions)"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ScoreCard title={lang === 'es' ? "Parsing AI" : "AI Parsing"} score={scores.parsing} weight="10%" />
          <ScoreCard title={lang === 'es' ? "Compatibilidad ATS" : "ATS Compatibility"} score={scores.ats} weight="20%" />
          <ScoreCard title={lang === 'es' ? "Posicionamiento Ejecutivo" : "Exec. Positioning"} score={scores.executive} weight="20%" />
          <ScoreCard title={lang === 'es' ? "Fuerza de Logros" : "Achievement Strength"} score={scores.achievements} weight="15%" />
          <ScoreCard title={lang === 'es' ? "Claridad Narrativa" : "Narrative Clarity"} score={scores.clarity} weight="15%" />
          <ScoreCard title={lang === 'es' ? "Relevancia Keywords" : "Keyword Relevance"} score={scores.keywords} weight="10%" />
          <ScoreCard title={lang === 'es' ? "Consistencia de Carrera" : "Career Consistency"} score={scores.consistency} weight="10%" />
          <ScoreCard title={lang === 'es' ? "Potencial Personalización" : "Tailoring Potential"} score={scores.personalization} weight="10%" />
        </div>
      </div>

      {/* 2.5 Market Pulse Section */}
      {analysis.marketPulse && (
        <div className="space-y-6">
          <h3 className="text-xl font-serif text-executive-navy border-l-4 border-executive-gold pl-4 flex items-center gap-2">
            <PulseIcon className="w-5 h-5 text-executive-gold" />
            {lang === 'es' ? "Señales de Mercado & Skill Pulse" : "Market Signals & Skill Pulse"}
          </h3>
          <div className="executive-card p-8 bg-slate-50 border-slate-200">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trending Roles & Bridge Industries</h4>
                   <div className="flex flex-wrap gap-2">
                      {analysis.marketPulse.alternativeRoles.map(r => (
                        <span key={r} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm">{r}</span>
                      ))}
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {analysis.marketPulse.bridgeIndustries.map(i => (
                        <span key={i} className="px-3 py-1 bg-executive-navy/5 border border-executive-navy/10 rounded-lg text-xs font-medium text-executive-navy">{i}</span>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">High-Demand Hard Skills</h4>
                   <div className="flex flex-wrap gap-2">
                      {analysis.marketPulse.hardSkills.map(s => (
                        <span key={s} className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-xs font-medium text-blue-700">{s}</span>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strategic Keywords Pulse</h4>
                   <div className="flex flex-wrap gap-2">
                      {analysis.marketPulse.trendingKeywords.map(k => (
                        <span key={k} className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-medium text-emerald-700">#{k}</span>
                      ))}
                   </div>
                   <div className="pt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400 font-bold uppercase">Demand Level</span>
                        <span className="text-executive-gold font-bold">{analysis.marketPulse.demandLevel}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-executive-gold w-3/4" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3. Improved CV View (Original vs Rewritten) */}
        <div className="executive-card p-8 space-y-6 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif text-executive-navy flex items-center gap-3">
              <Zap className="w-6 h-6 text-executive-gold" />
              {lang === 'es' ? "Evolución de Secciones (Rewrite Engine)" : "Section Evolution (Rewrite Engine)"}
            </h3>
          </div>
          <div className="space-y-6 flex-1">
            {analysis.improvedCV?.sections.map((section, idx) => (
              <div key={idx} className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[9px] font-bold uppercase rounded">Original</span>
                  <ArrowRight className="w-3 h-3 text-slate-300" />
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[9px] font-bold uppercase rounded">Engine Applied</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-xs text-slate-500 italic border-l-2 border-slate-200 pl-3">
                    {section.originalText}
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 text-sm text-executive-navy font-medium shadow-sm">
                    {section.rewrittenText}
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-executive-navy/5 p-3 rounded-lg">
                  <span className="text-[10px] font-bold text-executive-gold uppercase mt-0.5">Why:</span>
                  <p className="text-[11px] text-slate-600 leading-tight">{section.recommendedChange}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. LinkedIn Pulse */}
        <div className="executive-card p-8 space-y-6 flex flex-col bg-slate-50 shadow-inner">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif text-executive-navy flex items-center gap-3">
              <Linkedin className="w-6 h-6 text-[#0077b5]" />
              LinkedIn Pulse Report
            </h3>
            <div className="text-2xl font-serif text-[#0077b5]">{analysis.linkedInPulse?.score}%</div>
          </div>
          {analysis.linkedInPulse && (
            <div className="space-y-6 flex-1">
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Headline Suggestions</h4>
                  <div className="space-y-2">
                    {analysis.linkedInPulse.headlineSuggestions.map((h, i) => (
                      <div key={i} className="text-sm font-medium text-executive-navy p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">About Rewrite (Strategic Positioning)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{analysis.linkedInPulse.aboutRewrite}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action Priorities</h4>
                  <ul className="space-y-1">
                    {analysis.linkedInPulse.priorityActions.map((a, i) => (
                      <li key={i} className="text-[11px] text-slate-500 flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visibility Gaps</h4>
                  <ul className="space-y-1">
                    {analysis.linkedInPulse.gaps.map((g, i) => (
                      <li key={i} className="text-[11px] text-slate-500 flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" /> {g}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Career Orientation & Rankings */}
      <div className="space-y-6">
        <h3 className="text-xl font-serif text-executive-navy border-l-4 border-executive-gold pl-4">
            {lang === 'es' ? "Orientación de Carrera y Fit de Mercado" : "Career Orientation & Market Fit"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analysis.careerOrientation?.roles.sort((a, b) => b.fitPercentage - a.fitPercentage).map((r, i) => (
            <div key={i} className={cn(
              "executive-card p-6 border-t-4 transition-all hover:scale-[1.02]",
              i === 0 ? "border-t-executive-gold bg-executive-navy/5" : "border-t-slate-200"
            )}>
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-bold text-executive-navy leading-tight pr-4">{r.role}</h4>
                <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-executive-navy">
                  {r.fitPercentage}%
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">{r.fitReason}</p>
              <div className="space-y-3">
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-slate-400">Strengths</span>
                    <div className="flex flex-wrap gap-1">
                       {r.strengths.slice(0, 3).map(s => <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] rounded font-medium">{s}</span>)}
                    </div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-slate-400">Gaps to close</span>
                    <div className="flex flex-wrap gap-1">
                       {r.gaps.slice(0, 3).map(g => <span key={g} className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[9px] rounded font-medium">{g}</span>)}
                    </div>
                 </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between group cursor-pointer" onClick={() => setSelectedRole(r)}>
                <span className="text-[10px] font-bold text-executive-gold uppercase">Recommended Angle</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-executive-gold group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Career Map Timeline */}
      <div className="executive-card p-10 bg-executive-paper overflow-hidden relative">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <MapIcon className="w-64 h-64" />
         </div>
         <h3 className="text-2xl font-serif text-executive-navy mb-10 flex items-center gap-3">
            <MapIcon className="w-8 h-8 text-executive-navy" />
            {lang === 'es' ? "Carrera Estratégica: Mapa 5 Años" : "Strategic Career Map: 5 Year View"}
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Year 1 */}
            <div className="space-y-4 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-executive-navy text-executive-gold flex items-center justify-center font-serif text-xl shadow-lg">1</div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Year 1: Positioning</h4>
               </div>
               <p className="text-sm text-executive-navy font-medium bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  {analysis.careerMap?.timeline.year1}
               </p>
            </div>
            {/* Year 3 */}
            <div className="space-y-4 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-executive-gold text-executive-navy flex items-center justify-center font-serif text-xl shadow-lg">3</div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Year 3: Growth</h4>
               </div>
               <p className="text-sm text-executive-navy font-medium bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  {analysis.careerMap?.timeline.year3}
               </p>
            </div>
            {/* Year 5 */}
            <div className="space-y-4 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-serif text-xl shadow-lg">5</div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Year 5: Mastery</h4>
               </div>
               <p className="text-sm text-executive-navy font-medium bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  {analysis.careerMap?.timeline.year5}
               </p>
            </div>
         </div>
         <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 pt-10 border-t border-slate-200">
            <div className="space-y-4">
               <h5 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest italic">Skills to Strengthen</h5>
               <div className="flex flex-wrap gap-2">
                  {analysis.careerMap?.skillGaps.map(s => <span key={s} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-sm">{s}</span>)}
               </div>
            </div>
            <div className="space-y-4">
               <h5 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest italic">Strategic Blocks</h5>
               <div className="flex flex-wrap gap-2">
                  {analysis.careerMap?.blockers.map(b => <span key={b} className="px-3 py-1 bg-rose-50 border border-rose-100 rounded-lg text-xs font-medium text-rose-700">{b}</span>)}
               </div>
            </div>
         </div>
      </div>
      {/* 7. Full Optimization Engine (Holistic Rewrites) */}
      {(analysis.improvedCV?.fullATS || analysis.improvedCV?.fullExecutive) && (
        <div className="space-y-6">
          <h3 className="text-xl font-serif text-executive-navy border-l-4 border-executive-gold pl-4">
            {lang === 'es' ? "Producto Final: CV Optimizado" : "Final Product: Optimized CV"}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {analysis.improvedCV.fullExecutive && (
              <div className="executive-card p-8 bg-white border-executive-gold/30 shadow-xl shadow-executive-gold/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-executive-gold/10 rounded-lg">
                    <Zap className="w-5 h-5 text-executive-gold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-executive-navy">Executive Positioning</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Optimizado para Hunter & C-Level</p>
                  </div>
                </div>
                <div className="bg-slate-100/50 p-6 rounded-2xl border border-slate-100 font-serif text-sm text-executive-navy leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto custom-scrollbar">
                  {analysis.improvedCV.fullExecutive}
                </div>
                <div className="flex gap-2 mt-6">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(analysis.improvedCV?.fullExecutive || '');
                      alert(lang === 'es' ? 'Copiado al portapapeles' : 'Copied to clipboard');
                    }}
                    className="flex-1 luxury-button !py-3 gap-2"
                  >
                     {lang === 'es' ? "Copiar" : "Copy"}
                  </button>
                  <button 
                    onClick={() => exportToWord("CV Ejecutivo Optimizado", analysis.improvedCV?.fullExecutive || '', `CV_Ejecutivo_${analysis.analysisName.replace(/\s+/g, '_')}`)}
                    className="flex items-center justify-center p-3 border border-executive-gold text-executive-gold rounded-xl hover:bg-executive-gold/5 transition-colors"
                    title={lang === 'es' ? "Descargar Word" : "Download Word"}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {analysis.improvedCV.fullATS && (
              <div className="executive-card p-8 bg-slate-50 border-blue-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-executive-navy">ATS Technical Optimization</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Optimizado para iCIMS, Greenhouse & Workday</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-blue-50 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto custom-scrollbar">
                  {analysis.improvedCV.fullATS}
                </div>
                <div className="flex gap-2 mt-6">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(analysis.improvedCV?.fullATS || '');
                      alert(lang === 'es' ? 'Copiado al portapapeles' : 'Copied to clipboard');
                    }}
                    className="flex-1 luxury-button-outline !py-3 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                     {lang === 'es' ? "Copiar" : "Copy"}
                  </button>
                  <button 
                    onClick={() => exportToWord("CV Formato ATS", analysis.improvedCV?.fullATS || '', `CV_ATS_${analysis.analysisName.replace(/\s+/g, '_')}`)}
                    className="flex items-center justify-center p-3 border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                    title={lang === 'es' ? "Descargar Word" : "Download Word"}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <AnimatePresence>
        {selectedRole && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-executive-navy/60 backdrop-blur-sm" onClick={() => setSelectedRole(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-executive-navy text-executive-gold flex items-center justify-center shadow-lg">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif text-executive-navy">{selectedRole.role}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{lang === 'es' ? "Ángulo Recomendado" : "Recommended Angle"}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedRole(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                   <ChevronDown className="w-6 h-6 rotate-180" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-executive-navy leading-relaxed">
                  "{selectedRole.recommendation}"
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Strengths for this position
                    </h4>
                    <ul className="space-y-2">
                      {selectedRole.strengths.map(s => (
                        <li key={s} className="text-sm text-slate-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <AlertTriangle className="w-3 h-3 text-amber-500" /> Strategic Gaps
                    </h4>
                    <ul className="space-y-2">
                      {selectedRole.gaps.map(g => (
                        <li key={g} className="text-sm text-slate-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" /> {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedRole(null)}
                className="mt-8 w-full luxury-button"
              >
                {lang === 'es' ? "Entendido, aplicar recomendación" : "Got it, apply recommendation"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

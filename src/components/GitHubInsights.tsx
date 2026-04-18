import React, { useState } from 'react';
import { GitHubInsight, Language } from '../types';
import { UI_TEXTS } from '../constants';
import { Github, Code, Terminal, GitBranch, GitPullRequest, GitMerge, Zap, Copy, Check, Info, FileCode, Cpu, Shield } from 'lucide-react';

interface GitHubInsightsProps {
  data: GitHubInsight;
  lang: Language;
}

export const GitHubInsights: React.FC<GitHubInsightsProps> = ({ data, lang }) => {
  const [copiedBio, setCopiedBio] = useState(false);
  const [copiedReadme, setCopiedReadme] = useState(false);
  const t = UI_TEXTS[lang];

  const copyToClipboard = async (text: string, setFn: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setFn(true);
      setTimeout(() => setFn(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER - GITHUB BRANDED */}
      <div className="bg-slate-900 text-white p-12 rounded-container shadow-vibrant relative overflow-hidden group border border-slate-800">
        <div className="relative z-10">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
               <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/5"><Github size={32} className="text-white"/></div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter">{t.githubTitle}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1 italic">VCS Neural Auditor v4.2</p>
                  </div>
               </div>
           </div>
           
           <p className="text-xl text-slate-300 font-medium mb-10 max-w-2xl leading-relaxed">{t.githubSubtitle}</p>
           
           <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-card border border-white/10 flex justify-between items-center hover:bg-slate-800/80 transition-all shadow-2xl">
              <div className="flex-1">
                 <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] mb-3">Sugerencia de Bio de Perfil</p>
                 <p className="text-xl font-mono text-accent leading-tight tracking-tight">"{data.suggestedBio}"</p>
              </div>
              <button 
                onClick={() => copyToClipboard(data.suggestedBio, setCopiedBio)}
                className="ml-6 p-4 bg-slate-700 hover:bg-accent hover:text-white rounded-2xl transition-all shadow-lg"
              >
                {copiedBio ? <Check size={24} /> : <Copy size={24} />}
              </button>
           </div>
        </div>
        <Github size={320} className="absolute -bottom-20 -right-20 text-white opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: REPOS & README */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* REPOSITORY STRATEGY */}
            <div className="bg-white p-10 rounded-container shadow-vibrant border border-white">
                <h3 className="flex items-center gap-3 font-black text-text-main text-lg uppercase tracking-wider mb-8">
                    <div className="p-2 bg-slate-100 text-slate-800 rounded-xl"><GitBranch size={20}/></div>
                    Top Repository Ideas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {data.topRepoIdeas.map((repo, i) => (
                      <div key={i} className="flex flex-col p-6 bg-slate-50 rounded-card border-2 border-slate-100 hover:border-slate-300 transition-all group">
                         <div className="flex items-center gap-3 mb-4">
                            <FileCode size={18} className="text-slate-400 group-hover:text-slate-800" />
                            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Public Repo</span>
                         </div>
                         <p className="text-md font-bold text-text-main leading-relaxed">{repo}</p>
                      </div>
                   ))}
                </div>
            </div>

            {/* README STRUCTURE */}
            <div className="bg-white p-10 rounded-container shadow-vibrant border border-white relative group">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="flex items-center gap-3 font-black text-text-main text-lg uppercase tracking-wider">
                        <div className="p-2 bg-accent/10 text-accent rounded-xl"><Code size={20}/></div>
                        README Structure (Markdown)
                    </h3>
                    <button 
                        onClick={() => copyToClipboard(data.readmeStructure, setCopiedReadme)}
                        className="flex items-center gap-3 px-5 py-3 bg-accent/10 text-accent rounded-pill text-xs font-black hover:bg-accent hover:text-white transition-all shadow-sm"
                    >
                        {copiedReadme ? <><Check size={16}/> Copiado</> : <><Copy size={16}/> {t.copy}</>}
                    </button>
                </div>
                <div className="font-mono text-sm bg-slate-900 text-slate-300 p-10 rounded-card border-2 border-slate-800 whitespace-pre-wrap">
                    {data.readmeStructure}
                </div>
            </div>

        </div>

        {/* RIGHT COLUMN: PULSE & TECH */}
        <div className="lg:col-span-4 space-y-8">
            
            {/* DEV PULSE SCORE */}
            <div className="bg-accent p-10 rounded-container shadow-vibrant relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-white scale-150"><Zap size={100} /></div>
                <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-6">Neural Dev Pulse</h4>
                <div className="flex items-end gap-3 mb-4">
                    <span className="text-6xl font-black tracking-tighter">{data.devPulseScore}%</span>
                    <span className="text-white/60 text-xs font-black uppercase mb-3 tracking-widest hidden sm:inline">VCS Aura</span>
                </div>
                <div className="w-full bg-black/10 h-3 rounded-pill mt-4 shadow-inner overflow-hidden">
                    <div className="bg-white h-full rounded-pill transition-all duration-1000 shadow-[0_0_20px_rgba(255,255,255,0.4)]" style={{width: `${data.devPulseScore}%`}}></div>
                </div>
            </div>

            {/* TECH STACK VISIBILITY */}
            <div className="bg-white p-8 rounded-card border-2 border-slate-100 shadow-vibrant">
                <h3 className="flex items-center gap-3 font-black text-text-main mb-6 text-sm uppercase tracking-widest">
                    <div className="p-2 bg-slate-50 text-slate-800 rounded-lg"><Terminal size={18}/></div>
                    Visualized Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                    {data.techKeywords.map((k, i) => (
                        <span key={i} className="px-4 py-2 bg-slate-900 text-accent text-[10px] font-black rounded-pill transition-all hover:scale-110 cursor-default">#{k.replace(/\s+/g, '')}</span>
                    ))}
                </div>
            </div>

            {/* CONTRIBUTION STRATEGY */}
            <div className="bg-slate-50 p-8 rounded-card border-2 border-slate-200">
                <h3 className="flex items-center gap-3 font-black text-slate-800 mb-6 text-sm uppercase tracking-widest">
                    <div className="p-2 bg-white text-slate-800 rounded-xl shadow-sm"><GitPullRequest size={18}/></div>
                    OSS Strategy
                </h3>
                <p className="text-sm text-text-main leading-relaxed font-bold italic">"{data.contributionStrategy}"</p>
                <div className="mt-6 space-y-2">
                    {data.ossRecs.map((rec, i) => (
                        <div key={i} className="flex gap-3 items-center text-[10px] font-black text-slate-500 uppercase">
                            <GitMerge size={12} className="text-accent" />
                            {rec}
                        </div>
                    ))}
                </div>
            </div>

            {/* SECURITY & INFRA */}
            <div className="bg-indigo-50/50 p-8 rounded-container border-2 border-indigo-100 shadow-vibrant">
               <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white rounded-2xl text-primary"><Shield size={24}/></div>
                  <h4 className="text-xs font-black text-text-main uppercase tracking-widest">Audit Stability</h4>
               </div>
               <p className="text-[10px] font-bold text-text-muted leading-relaxed uppercase tracking-tight">Your technical profile highlights a strong focus on maintainability and scalable patterns. Integration with modern dev tools and VCS best practices is prioritized.</p>
            </div>

        </div>

      </div>
    </div>
  );
};

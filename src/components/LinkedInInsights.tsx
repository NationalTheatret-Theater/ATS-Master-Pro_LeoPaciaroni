import React, { useState } from 'react';
import { LinkedInInsight, Language } from '../types';
import { UI_TEXTS } from '../constants';
import { Linkedin, Hash, TrendingUp, Users, PenTool, Zap, Copy, Check, Info, Layout, ClipboardList, FileText } from 'lucide-react';

interface LinkedInInsightsProps {
  data: LinkedInInsight;
  lang: Language;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const LinkedInInsights: React.FC<LinkedInInsightsProps> = ({ data, lang }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAbout, setCopiedAbout] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const t = UI_TEXTS[lang];

  const capitalizedHeadline = data.headlineSuggestion.split('|').map(p => p.trim()).map(capitalize).join(' | ');
  const capitalizedHeadlines = data.suggestedHeadlines.map(h => h.split('|').map(p => p.trim()).map(capitalize).join(' | '));

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (typeof index === 'number') {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        setCopiedAbout(true);
        setTimeout(() => setCopiedAbout(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyAllHeadlines = async () => {
    try {
      const allHeadlines = data.suggestedHeadlines.join('\n');
      await navigator.clipboard.writeText(allHeadlines);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportWord = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
      <head><meta charset='utf-8'><title>LinkedIn Market Pulse</title>
      <style>
        body { font-family: 'Calibri', sans-serif; color: #1e293b; }
        h1 { color: #0077b5; font-size: 24pt; margin-bottom: 5px; }
        .subtitle { color: #64748b; font-size: 11pt; margin-bottom: 20px; }
        h2 { color: #0f172a; font-size: 14pt; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 20px; margin-bottom: 10px; }
        h3 { color: #334155; font-size: 12pt; margin-top: 15px; font-weight: bold; }
        p { font-size: 11pt; line-height: 1.5; margin-bottom: 10px; }
        ul { margin-bottom: 10px; }
        li { font-size: 11pt; margin-bottom: 5px; }
        .highlight { background-color: #f1f5f9; padding: 15px; border-radius: 5px; border: 1px solid #e2e8f0; }
        .metric { color: #0077b5; font-weight: bold; }
        .tag { display: inline-block; background-color: #e2e8f0; padding: 2px 8px; border-radius: 10px; font-size: 10pt; margin-right: 5px; color: #475569; }
      </style>
      </head>
      <body>
        <h1>LinkedIn Market Pulse</h1>
        <p class="subtitle">Neural Analysis by ATS Master Pro • ${new Date().toLocaleDateString()}</p>
        
        <div class="section">
            <h2>Headline Strategy</h2>
            <h3>Top Recommendation</h3>
            <div class="highlight">
                <p><strong>${data.headlineSuggestion}</strong></p>
            </div>
            
            <h3>Alternatives</h3>
            <ul>
                ${capitalizedHeadlines.map(h => `<li>${h}</li>`).join('')}
            </ul>
        </div>

        <div class="section">
            <h2>About Section</h2>
            <div class="highlight">
                <p style="white-space: pre-wrap;">${data.aboutSection}</p>
            </div>
        </div>

        <div class="section">
            <h2>Market Intelligence</h2>
            <p><span class="metric">Estimated Viral Potential:</span> ${data.viralPotentialScore}%</p>
            <p><span class="metric">Hiring Trends:</span> ${data.hiringTrends}</p>
        </div>

        <div class="section">
            <h2>Target Keywords</h2>
            <p>${data.trendingKeywords.map(k => `<span class="tag">#${k}</span>`).join('')}</p>
        </div>

         <div class="section">
            <h2>Skill Gaps (Hot Market Skills)</h2>
            <p>${data.skillGapsForMarket.map(k => `<span class="tag">${k}</span>`).join('')}</p>
        </div>

        <div class="section">
            <h2>Strategic Networking</h2>
             <ul>
                ${data.suggestedConnections.map(h => `<li>${h}</li>`).join('')}
            </ul>
        </div>

         <div class="section">
            <h2>Content Strategy Ideas</h2>
             <ul>
                ${data.contentIdeas.map(h => `<li>${h}</li>`).join('')}
            </ul>
        </div>

      </body></html>`;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = `LinkedIn_Pulse_${new Date().toISOString().slice(0,10)}.doc`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER & MAIN HEADLINE */}
      <div className="bg-primary text-white p-12 rounded-container shadow-vibrant relative overflow-hidden group">
        <div className="relative z-10">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
               <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"><Linkedin size={32} className="text-white"/></div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter">{t.linkedInTitle}</h2>
                    <p className="text-indigo-200 font-bold uppercase tracking-widest text-[10px] mt-1 italic">Neural Branding Engine v4.2</p>
                  </div>
               </div>
               <button 
                  onClick={handleExportWord}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-pill text-xs font-black uppercase tracking-widest transition-all backdrop-blur-md shadow-lg"
               >
                  <FileText size={18} /> {lang === 'es' ? 'Exportar Word' : 'Export Word'}
               </button>
           </div>
           
           <p className="text-xl text-indigo-100 font-medium mb-10 max-w-2xl leading-relaxed">Optimizamos tu presencia digital analizando brechas de mercado y tendencias semánticas actuales.</p>
           
           <div className="bg-white/10 backdrop-blur-xl p-8 rounded-card border-2 border-white/20 flex justify-between items-center group/card hover:bg-white/20 transition-all shadow-2xl">
              <div className="flex-1">
                 <p className="text-[10px] uppercase font-black text-indigo-300 tracking-[0.3em] mb-3">
                   {lang === 'en' ? 'High Impact Headline Suggestion' : 'Sugerencia de Headline de Alto Impacto'}
                 </p>
                 <p className="text-2xl font-black text-white leading-tight tracking-tight">"{capitalizedHeadline}"</p>
              </div>
              <button 
                onClick={() => copyToClipboard(capitalizedHeadline, -1)}
                className="ml-6 p-4 bg-white/20 hover:bg-white hover:text-primary rounded-2xl transition-all shadow-lg"
              >
                {copiedIndex === -1 ? <Check size={24} /> : <Copy size={24} />}
              </button>
           </div>
        </div>
        <Linkedin size={320} className="absolute -bottom-20 -right-20 text-white opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: HEADLINES & ABOUT */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* HEADLINES LIST */}
            <div className="bg-white p-10 rounded-container shadow-vibrant border border-white">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="flex items-center gap-3 font-black text-text-main text-lg uppercase tracking-wider">
                        <div className="p-2 bg-indigo-50 text-primary rounded-xl"><Layout size={20}/></div>
                        {t.headlines}
                    </h3>
                    <button 
                        onClick={handleCopyAllHeadlines}
                        className="flex items-center gap-3 px-5 py-3 bg-indigo-50 text-primary hover:bg-primary hover:text-white rounded-pill text-xs font-black transition-all shadow-sm"
                    >
                        {copiedAll ? <Check size={16} /> : <ClipboardList size={16} />}
                        {copiedAll ? 'Copiado' : t.copyAll}
                    </button>
                </div>
                <div className="space-y-4">
                   {capitalizedHeadlines.map((head, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-indigo-50/30 rounded-card border-2 border-indigo-50 hover:border-primary transition-all group">
                         <p className="text-md font-bold text-text-main leading-relaxed pr-4">{head}</p>
                         <button 
                            onClick={() => copyToClipboard(head, i)}
                            className="p-3 text-text-muted hover:text-primary hover:bg-white rounded-xl transition-all shadow-sm group-hover:shadow-md"
                         >
                            {copiedIndex === i ? <Check size={20} /> : <Copy size={20} />}
                         </button>
                      </div>
                   ))}
                </div>
            </div>

            {/* ABOUT SECTION */}
            <div className="bg-white p-10 rounded-container shadow-vibrant border border-white relative group">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="flex items-center gap-3 font-black text-text-main text-lg uppercase tracking-wider">
                        <div className="p-2 bg-secondary/10 text-secondary rounded-xl"><Info size={20}/></div>
                        {t.aboutMe}
                    </h3>
                    <button 
                        onClick={() => copyToClipboard(data.aboutSection)}
                        className="flex items-center gap-3 px-5 py-3 bg-secondary/10 text-secondary rounded-pill text-xs font-black hover:bg-secondary hover:text-white transition-all shadow-sm"
                    >
                        {copiedAbout ? <><Check size={16}/> Copiado</> : <><Copy size={16}/> {t.copy}</>}
                    </button>
                </div>
                <div className="prose prose-sm max-w-none text-text-main leading-relaxed font-bold bg-indigo-50/20 p-10 rounded-card border-2 border-indigo-50 whitespace-pre-wrap italic">
                    {data.aboutSection}
                </div>
            </div>

        </div>

        {/* RIGHT COLUMN: TRENDS & MARKET DATA */}
        <div className="lg:col-span-4 space-y-8">
            
            {/* VIRAL POTENTIAL */}
            <div className="bg-text-main text-white p-10 rounded-container shadow-vibrant relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-white scale-150"><TrendingUp size={100} /></div>
                <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-6">Neural Visibility Reach</h4>
                <div className="flex items-end gap-3 mb-4">
                    <span className="text-6xl font-black tracking-tighter">{data.viralPotentialScore}%</span>
                    <span className="text-accent text-xs font-black uppercase mb-3 tracking-widest hidden sm:inline">Impact pulse</span>
                </div>
                <div className="w-full bg-white/10 h-3 rounded-pill mt-4 shadow-inner overflow-hidden">
                    <div className="bg-accent h-full rounded-pill transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.6)]" style={{width: `${data.viralPotentialScore}%`}}></div>
                </div>
            </div>

            {/* TRENDING KEYWORDS */}
            <div className="bg-white p-8 rounded-card border-2 border-indigo-50 shadow-vibrant">
                <h3 className="flex items-center gap-3 font-black text-text-main mb-6 text-sm uppercase tracking-widest">
                    <div className="p-2 bg-indigo-50 text-primary rounded-lg"><Hash size={18}/></div>
                    {lang === 'en' ? 'Viral Keywords' : 'Keywords Virales'}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {data.trendingKeywords.map((k, i) => (
                        <span key={i} className="px-4 py-2 bg-indigo-50 text-primary text-[10px] font-black rounded-pill border border-indigo-100 transition-all hover:bg-primary hover:text-white cursor-default">#{capitalize(k).replace(/\s+/g, '')}</span>
                    ))}
                </div>
            </div>

            {/* HIRING TRENDS */}
            <div className="bg-accent/5 p-8 rounded-card border-2 border-accent/10">
                <h3 className="flex items-center gap-3 font-black text-accent mb-6 text-sm uppercase tracking-widest">
                    <div className="p-2 bg-white text-accent rounded-xl shadow-sm"><TrendingUp size={18}/></div>
                    Market pulse
                </h3>
                <p className="text-sm text-text-main leading-relaxed font-bold italic">"{data.hiringTrends}"</p>
            </div>

            {/* NETWORKING */}
            <div className="bg-primary/5 p-8 rounded-card border-2 border-primary/10">
                <h3 className="flex items-center gap-3 font-black text-primary mb-6 text-sm uppercase tracking-widest">
                    <div className="p-2 bg-white text-primary rounded-xl shadow-sm"><Users size={18}/></div>
                    Networking Strategy
                </h3>
                <ul className="space-y-4">
                    {data.suggestedConnections.map((c, i) => (
                        <li key={i} className="text-xs font-bold text-text-main flex items-center gap-3 group">
                            <div className="bg-primary/10 p-1 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                                <Check size={14} />
                            </div>
                            {c}
                        </li>
                    ))}
                </ul>
            </div>

            {/* CONTENT STRATEGY */}
            <div className="bg-white p-8 rounded-card border-2 border-indigo-50 shadow-vibrant">
                <h3 className="flex items-center gap-3 font-black text-text-main mb-6 text-sm uppercase tracking-widest">
                    <div className="p-2 bg-indigo-50 text-primary rounded-xl"><PenTool size={18}/></div>
                    Content Ideas
                </h3>
                <div className="space-y-4">
                    {data.contentIdeas.slice(0, 3).map((idea, i) => (
                        <div key={i} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-50 hover:border-primary transition-all">
                            <p className="text-xs text-text-main font-bold leading-relaxed italic">"{idea}"</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* SKILL GAPS MARKET */}
            <div className="bg-secondary/5 p-8 rounded-card border-2 border-secondary/10">
                <h3 className="flex items-center gap-3 font-black text-secondary mb-6 text-sm uppercase tracking-widest">
                    <div className="p-2 bg-white text-secondary rounded-xl shadow-sm"><Zap size={18}/></div>
                    Trending Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                    {data.skillGapsForMarket.map((skill, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white text-secondary text-[10px] font-black rounded-lg border border-secondary-100 shadow-sm uppercase tracking-tight">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

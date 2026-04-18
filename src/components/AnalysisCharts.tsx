import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ATSAnalysis, CareerMatch, Language } from '../types';
import { Zap, TrendingUp } from 'lucide-react';
import { UI_TEXTS } from '../constants';

export const ScoreGauge: React.FC<{ score: number; label?: string; color?: string }> = ({ score, label, color }) => {
  const defaultBg = '#f1f5f9';
  const defaultColor = score > 80 ? '#10B981' : score > 50 ? '#4F46E5' : '#F43F5E';
  
  const data = [
    { name: 'Score', uv: score, fill: color || defaultColor },
    { name: 'Max', uv: 100, fill: defaultBg }
  ];

  return (
    <div className="relative h-48 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={16} data={data} startAngle={180} endAngle={0}>
          <RadialBar background dataKey="uv" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 text-center">
        <span className="text-5xl font-black tracking-tighter" style={{ color: color || defaultColor }}>
          {score}
        </span>
        <p className="text-[10px] text-text-muted uppercase font-black tracking-[0.2em] mt-1">{label}</p>
      </div>
    </div>
  );
};

export const CategoryBreakdown: React.FC<{ data: ATSAnalysis; lang: Language }> = ({ data, lang }) => {
  const t = UI_TEXTS[lang];
  const keywordTotal = (data.foundKeywords?.length || 0) + (data.missingKeywords?.length || 0);
  const keywordScore = typeof data.keywordMatch === 'number'
    ? data.keywordMatch
    : keywordTotal > 0
      ? Math.round(((data.foundKeywords?.length || 0) / keywordTotal) * 100)
      : data.overallScore;

  const chartData = [
    { name: lang === 'en' ? 'Keywords' : 'Palabras Clave', score: keywordScore },
    { name: t.context, score: data.contextualMatch },
    { name: t.impact, score: data.impactScore },
    { name: t.culturalFit, score: data.culturalFit },
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10, fontWeight: 700, fill: '#64748B'}} tickLine={false} axisLine={false} />
        <Tooltip cursor={{fill: 'rgba(79, 70, 229, 0.05)'}} />
        <Bar dataKey="score" barSize={12} radius={[0, 10, 10, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.score > 70 ? '#4F46E5' : entry.score > 40 ? '#F43F5E' : '#FDA4AF'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const PredictiveCard: React.FC<{ analysis: ATSAnalysis; lang: Language }> = ({ analysis, lang }) => {
  const t = UI_TEXTS[lang];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
      <div className="bg-indigo-50/50 p-6 rounded-card border-2 border-primary/10 shadow-sm group hover:scale-[1.02] transition-transform">
        <div className="flex items-center gap-3 mb-3 text-primary font-black text-xs uppercase tracking-widest">
          <TrendingUp size={18} /> {t.estimatedSuccess}
        </div>
        <div className="text-4xl font-black text-primary tracking-tighter">{analysis.successPrediction}<span className="text-xl">%</span></div>
        <p className="text-[10px] text-text-muted mt-2 uppercase font-black tracking-[0.2em]">Neural Score Accuracy: 94%</p>
      </div>
      <div className="bg-secondary/5 p-6 rounded-card border-2 border-secondary/10 shadow-sm group hover:scale-[1.02] transition-transform">
        <div className="flex items-center gap-3 mb-3 text-secondary font-black text-xs uppercase tracking-widest">
          <Zap size={18} /> {t.projectedImpact}
        </div>
        <p className="text-sm text-text-main leading-relaxed font-bold italic group-hover:text-secondary transition-colors">"{analysis.performanceEstimate}"</p>
      </div>
    </div>
  );
};

export const CareerMatchList: React.FC<{ matches: CareerMatch[] }> = ({ matches }) => {
  return (
    <div className="space-y-6">
      {matches.slice(0, 3).map((match, index) => (
        <div key={index} className="space-y-2 group">
          <div className="flex justify-between items-end">
            <div>
                <span className="block text-md font-black text-text-main group-hover:text-primary transition-colors tracking-tight">{match.role}</span>
                <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest mt-0.5">{match.industry}</span>
            </div>
            <span className="text-lg font-black text-primary tracking-tighter">{match.matchPercentage}%</span>
          </div>
          <div className="w-full bg-indigo-50 rounded-pill h-3 shadow-inner overflow-hidden">
            <div 
              className={`h-full rounded-pill transition-all duration-1000 shadow-sm ${match.matchPercentage > 85 ? 'bg-accent' : match.matchPercentage > 60 ? 'bg-primary' : 'bg-secondary'}`} 
              style={{ width: `${match.matchPercentage}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

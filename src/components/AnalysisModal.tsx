import React from 'react';
import { X, CheckCircle, AlertTriangle, Lightbulb, Target, ShieldCheck, BrainCircuit, Image } from 'lucide-react';
import { ATSAnalysis } from '../types';
import { ScoreGauge, CategoryBreakdown, CareerMatchList, PredictiveCard } from './AnalysisCharts';
import html2canvas from 'html2canvas';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: ATSAnalysis;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, analysis }) => {
  if (!isOpen) return null;

  const handleExportPng = async () => {
    const element = document.getElementById('neural-ats-report-container');
    if (element) {
        try {
            // Save original styles
            const originalStyle = {
                height: element.style.height,
                maxHeight: element.style.maxHeight,
                overflow: element.style.overflow,
                position: element.style.position,
                borderRadius: element.style.borderRadius,
            };

            // Modify styles to capture full content
            element.style.height = 'auto';
            element.style.maxHeight = 'none';
            element.style.overflow = 'visible';
            element.style.borderRadius = '0'; 

            // Use html2canvas
            const canvas = await html2canvas(element, { 
                scale: 2, 
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                windowHeight: element.scrollHeight + 100 
            });
            
            // Restore styles
            element.style.height = originalStyle.height;
            element.style.maxHeight = originalStyle.maxHeight;
            element.style.overflow = originalStyle.overflow;
            element.style.position = originalStyle.position;
            element.style.borderRadius = originalStyle.borderRadius;

            const link = document.createElement('a');
            link.download = `Reporte_Neural_ATS_RAW_${new Date().toISOString().slice(0,10)}.png`;
            link.href = canvas.toDataURL();
            link.click();
        } catch (err) {
            console.error("Failed to export PNG", err);
        }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-xl">
      <div 
        id="neural-ats-report-container"
        className="bg-[#F0F2FF] rounded-container shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border-4 border-white"
      >
        <div className="flex justify-between items-center p-8 border-b-2 border-white bg-indigo-50/50 flex-shrink-0">
          <div className="flex items-center gap-4">
             <div className="bg-primary p-3 rounded-2xl shadow-vibrant"><ShieldCheck className="text-white" size={32} /></div>
             <div>
                <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tighter">Reporte Neural ATS</h2>
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] flex items-center gap-2"><BrainCircuit size={14}/> Análisis Contextual v4.2</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
                onClick={handleExportPng}
                className="flex items-center gap-2 px-5 py-3 bg-white text-primary border-2 border-indigo-50 hover:border-primary rounded-pill text-xs font-black uppercase tracking-widest transition-all shadow-sm"
                title="Exportar como PNG"
            >
                <Image size={18} /> <span className="hidden sm:inline">Exportar PNG</span>
            </button>
            <button onClick={onClose} className="p-3 text-text-muted hover:bg-white hover:text-primary rounded-2xl transition-all"><X size={32} /></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 bg-white space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-indigo-50/30 p-8 rounded-card border-2 border-indigo-50 flex flex-col items-center shadow-vibrant hover:border-primary transition-colors">
                        <h3 className="font-black text-text-muted mb-6 text-xs uppercase tracking-[0.2em]">Ajuste General</h3>
                        <ScoreGauge score={analysis.overallScore} />
                        <PredictiveCard analysis={analysis} />
                    </div>
                </div>
                
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white p-8 rounded-card border-2 border-indigo-50 shadow-vibrant">
                        <h3 className="font-black text-text-muted mb-6 text-xs uppercase tracking-[0.2em]">Métricas de Relevancia Semántica</h3>
                        <CategoryBreakdown data={analysis} />
                    </div>
                    
                    <div className="bg-primary/5 p-8 rounded-card border-2 border-primary/10 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-2 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                         <h3 className="font-black text-primary mb-4 flex items-center gap-3 text-lg tracking-tight"><Target size={24}/> Resumen Estratégico</h3>
                         <p className="text-md leading-relaxed text-text-main font-bold italic group-hover:text-primary transition-colors">"{analysis.summary}"</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                     <h3 className="font-black text-text-main flex items-center gap-3 text-lg uppercase tracking-wider border-b-2 border-amber-100 pb-3"><Lightbulb size={24} className="text-amber-500"/> Sugerencias de Optimización</h3>
                     <ul className="space-y-3">
                        {analysis.improvementSuggestions.map((s,i)=>(
                            <li key={i} className="text-sm text-text-main bg-amber-50/50 hover:bg-amber-100 p-4 rounded-xl border border-amber-100 transition-all flex gap-4 shadow-sm">
                                <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black shadow-vibrant">{i+1}</span>
                                <span className="font-bold">{s}</span>
                            </li>
                        ))}
                     </ul>
                </div>
                <div className="space-y-6">
                     <h3 className="font-black text-text-main flex items-center gap-3 text-lg uppercase tracking-wider border-b-2 border-secondary/20 pb-3"><AlertTriangle size={24} className="text-secondary"/> Puntos Críticos Detectados</h3>
                     <ul className="space-y-3">
                        {analysis.criticalIssues.map((s,i)=>(
                            <li key={i} className="text-sm text-text-main bg-secondary/5 p-4 rounded-xl border border-secondary/10 flex gap-4 shadow-sm hover:bg-secondary/10 transition-colors">
                                <div className="bg-secondary text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 shadow-vibrant">
                                    <AlertTriangle size={14} />
                                </div>
                                <span className="font-bold leading-relaxed">{s}</span>
                            </li>
                        ))}
                     </ul>
                </div>
            </div>

            <div className="pt-8 border-t-2 border-indigo-50">
                 <h3 className="font-black text-text-main mb-8 flex items-center gap-3 text-lg uppercase tracking-wider"><Target size={24} className="text-primary"/> Calce Dimensional con Mercados y Roles</h3>
                 <CareerMatchList matches={analysis.careerMatches} />
            </div>
        </div>
        
        <div className="p-6 bg-indigo-50 border-t-2 border-white flex justify-center flex-shrink-0">
            <p className="text-[10px] text-text-muted uppercase tracking-[0.4em] font-black">ATS Master Pro v4.2 • Procedimiento Neural de Auditoría Realizado</p>
        </div>
      </div>
    </div>
  );
};

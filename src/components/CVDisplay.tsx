import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Printer, FileText, Check } from 'lucide-react';

interface CVDisplayProps {
  markdown: string;
  title: string;
}

export const CVDisplay: React.FC<CVDisplayProps> = ({ markdown, title }) => {
  const [isCopied, setIsCopied] = useState(false);
  const cleanContent = markdown.replace(/^```markdown\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) { console.error(err); }
  };

  const handleExportWord = () => {
    const content = document.getElementById('printable-cv')?.innerHTML;
    if (!content) return;
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
      <head><meta charset='utf-8'><title>CV Export</title>
      <style>body{font-family:'Calibri',sans-serif;}</style></head>
      <body>${content}</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = `CV_Optimizado_${new Date().toISOString().slice(0,10)}.doc`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-card shadow-vibrant border border-white flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-indigo-50 flex justify-between items-center bg-indigo-50/30 no-print">
        <h3 className="font-black text-text-main tracking-tight uppercase text-sm tracking-[0.2em]">{title}</h3>
        <div className="flex gap-3">
          <button 
            onClick={handleExportWord} 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-indigo-700 rounded-pill text-xs font-black shadow-vibrant transition-all"
          >
            <FileText size={16} /> Word
          </button>
          <button 
            onClick={() => window.print()} 
            className="p-3 text-text-muted hover:text-primary hover:bg-white rounded-2xl transition-all shadow-sm"
          >
            <Printer size={20} />
          </button>
          <button 
            onClick={handleCopy} 
            className="p-3 text-text-muted hover:text-primary hover:bg-white rounded-2xl transition-all shadow-sm"
          >
            {isCopied ? <Check size={20} className="text-accent"/> : <Copy size={20} />}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-12 bg-white">
        <div id="printable-cv" className="prose prose-sm max-w-none prose-headings:text-text-main prose-headings:font-black prose-p:text-text-main font-serif leading-loose">
            <ReactMarkdown>{cleanContent}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

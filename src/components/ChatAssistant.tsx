import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { ChatMessage, Language } from '../types';
import { UI_TEXTS } from '../constants';
import * as LocalEngine from '../services/localEngine';

interface ChatAssistantProps {
  contextData: string;
  lang: Language;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ contextData, lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = UI_TEXTS[lang];

  useEffect(() => {
    if (messages.length === 0) {
        setMessages([{ role: 'model', text: t.chatWelcome }]);
    }
  }, [lang, messages.length, t.chatWelcome]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await LocalEngine.sendChatMessage(userMsg.text, messages, contextData, lang);
      const aiMsg: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { role: 'model', text: lang === 'es' ? "Lo siento, hubo un error. Intenta de nuevo." : "Sorry, an error occurred. Please try again." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 bg-primary text-white p-5 rounded-full shadow-vibrant hover:bg-indigo-700 transition-all z-50 animate-in fade-in slide-in-from-bottom-8 group hover:scale-110 active:scale-95"
        >
          <MessageCircle size={32} />
          <span className="absolute -top-1 -right-1 bg-secondary w-5 h-5 rounded-full animate-pulse border-4 border-white"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-[400px] h-[600px] bg-white rounded-card shadow-2xl border-4 border-white z-50 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-500 overflow-hidden ring-1 ring-indigo-50">
          
          {/* Header */}
          <div className="bg-primary p-6 flex justify-between items-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Bot size={80} /></div>
            <div className="flex items-center gap-4 relative z-10">
                <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md shadow-inner"><Bot size={24} /></div>
                <div>
                    <h3 className="font-black text-md tracking-tight uppercase tracking-[0.1em]">{t.chatTitle}</h3>
                    <p className="text-[10px] font-black opacity-80 flex items-center gap-2 uppercase tracking-widest">
                      <span className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> 
                      Neural Core Online
                    </p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-2xl transition-all relative z-10"><X size={24} /></button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFF] custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-4 rounded-card text-sm font-bold leading-relaxed shadow-vibrant transition-all ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-white text-text-main border-2 border-indigo-50 rounded-bl-none italic'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white p-4 rounded-card rounded-bl-none border-2 border-indigo-50 shadow-vibrant flex gap-2 items-center">
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-300"></span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t-2 border-indigo-50 bg-white">
            <div className="relative group">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={t.chatPlaceholder}
                  className="w-full pl-6 pr-16 py-4 bg-indigo-50/30 rounded-full text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-text-main placeholder:text-text-muted border-2 border-transparent focus:border-primary/20 shadow-inner"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-2 top-2 p-2.5 bg-primary text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-100 transition-all shadow-vibrant"
                >
                  <Send size={20} />
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

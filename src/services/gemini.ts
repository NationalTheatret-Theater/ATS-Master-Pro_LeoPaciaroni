import { GoogleGenAI, Type } from "@google/genai";
import { Language } from '../types';

/**
 * Proxy for Backend Gemini Service
 */
const TEXT_MODEL = "gemini-2.0-flash";

async function callAIProxy(request: any) {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || errorData.error || "Error en la comunicación con el servidor de IA");
  }

  return await response.json();
}

export const geminiService = {
  /**
   * Módulo 3. Parsing inteligente del CV
   */
  async parseResume(text: string, lang: Language) {
    const result = await callAIProxy({
      model: TEXT_MODEL,
      contents: [{ role: "user", parts: [{ text }] }],
      config: {
        systemInstruction: `Eres un experto Headhunter Senior con 20 años de experiencia en recruiting ejecutivo (C-Level). Tu objetivo es parsear CVs con precisión quirúrgica. 
        Analiza este CV profesional o ejecutivo. Extrae estructura, experiencia, fechas, cargos, logros, skills, seniority, alcance, liderazgo, industrias, educación, idiomas, brechas, consistencia de carrera y señales de posicionamiento ejecutivo. 
        TODA la información extraída (roles, logros, resúmenes, etc.) DEBE estar en ${lang === 'es' ? 'Español' : 'Inglés'}.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                headline: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                summary: { type: Type.STRING }
              }
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  period: { type: Type.STRING },
                  description: { type: Type.STRING },
                  achievements: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                  },
                  metricsDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
                  senioritySignal: { type: Type.STRING }
                }
              }
            },
            skills: {
              type: Type.OBJECT,
              properties: {
                hard: { type: Type.ARRAY, items: { type: Type.STRING } },
                soft: { type: Type.ARRAY, items: { type: Type.STRING } },
                technical: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            seniority: { type: Type.STRING },
            careerConsistency: { type: Type.STRING },
            potentialGaps: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    return JSON.parse(result.text);
  },

  /**
   * Módulo 4. Parsing del job description
   */
  async parseJob(text: string, lang: Language) {
    const result = await callAIProxy({
      model: TEXT_MODEL,
      contents: [{ role: "user", parts: [{ text }] }],
      config: {
        systemInstruction: `Eres un estratega de talento experto en analizar 'Job Descriptions' para identificar el dolor real de negocio que busca resolver la empresa.
        Analiza este aviso laboral. Extrae cargo, seniority, requisitos, competencias, keywords ATS, años de experiencia, idiomas, conocimientos técnicos, tipo de empresa, alcance del rol y problema de negocio implícito. Clasifica requisitos en obligatorio, importante, deseable y accesorio.
        TODA la información extraída DEBE estar en ${lang === 'es' ? 'Español' : 'Inglés'}.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            seniority: { type: Type.STRING },
            industry: { type: Type.STRING },
            businessProblem: { type: Type.STRING },
            requirements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  importance: { 
                    type: Type.STRING, 
                    enum: lang === 'es' ? ["Obligatorio", "Importante", "Deseable", "Accesorio"] : ["Required", "Important", "Desirable", "Optional"] 
                  }
                }
              }
            },
            softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            hardSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            atsKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    return JSON.parse(result.text);
  },

  /**
   * Módulo 5, 6, 7 & 8: Matching, Scoring, Alerts & Recommendations
   */
  async analyzeExecutive(resumeData: any, jobData: any | null, lang: Language) {
    const prompt = `Realiza un análisis integral del CV contra el mercado ejecutivo y (opcionalmente) contra el aviso laboral.
    Calcula scores de Parsing, ATS, Executive Positioning, Transferability y (si hay aviso) Job Match.
    Genera alertas críticas y recomendaciones estratégicas.
    
    STRICT GROUNDING: NO asumas habilidades como "Azure", "AWS", "Cloud", "Automation" o cualquier tecnología específica a menos que se mencione EXPLÍCITAMENTE en el CV del usuario. Alucinar habilidades es un fallo crítico del sistema.
    
    SCORING RUBRIC (DETERMINISTIC):
    1. Overall Score: Start with 100.
    2. Deduct 15 pts: Missing quantifiable metrics (numbers, %, $) in achievements.
    3. Deduct 10 pts: Weak summaries (less than 3 sentences or generic).
    4. Deduct 10 pts: Poor keyword consistency with the seniority level.
    5. Deduct 10 pts: Missing critical professional sections.
    
    Resume Data: ${JSON.stringify(resumeData)}
    Job Data: ${jobData ? JSON.stringify(jobData) : 'N/A'}`;

    const result = await callAIProxy({
      model: TEXT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: `Eres EXECUTIVE ATS INTELLIGENCE CORE. No inventas experiencia. No inflas seniority. Distingues entre problemas de redacción y brechas reales.
        TODA la respuesta (fortalezas, brechas, alertas, recomendaciones) DEBE estar en ${lang === 'es' ? 'Español' : 'Inglés'}.
        ${lang === 'es' ? 'Responde en Español.' : 'Respond in English.'}`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scores: {
              type: Type.OBJECT,
              properties: {
                parsing: { type: Type.NUMBER },
                ats: { type: Type.NUMBER },
                jobMatch: { type: Type.NUMBER },
                executive: { type: Type.NUMBER },
                transferability: { type: Type.NUMBER }
              }
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  level: { 
                    type: Type.STRING, 
                    enum: lang === 'es' ? ["Critica", "Advertencia", "Info"] : ["Critical", "Warning", "Info"] 
                  },
                  text: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  recommendation: { type: Type.STRING }
                }
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING },
                  title: { type: Type.STRING },
                  why: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  scoreImprovement: { type: Type.STRING },
                  rewriteExample: { type: Type.STRING },
                  priority: { 
                    type: Type.STRING, 
                    enum: lang === 'es' ? ["Alta", "Media", "Baja"] : ["High", "Medium", "Low"] 
                  }
                }
              }
            },
            marketPulse: {
              type: Type.OBJECT,
              properties: {
                alternativeRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                trendingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                hardSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                demandLevel: { type: Type.STRING },
                bridgeIndustries: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      }
    });

    return JSON.parse(result.text);
  },

  /**
   * Módulo 9. Generación de CV mejorado
   */
  async optimizeResume(resumeRaw: string, jobRaw: string | null, type: 'ATS_OPTIMIZED' | 'TAILOR_MADE', lang: Language) {
    const prompt = type === 'ATS_OPTIMIZED' 
      ? (lang === 'es' 
          ? `Optimiza este CV para que sea 100% compatible con ATS (Greenhouse, iCIMS) y tenga un fuerte impacto ejecutivo. Mejora estructura, redacción y claridad sin inventar experiencia.` 
          : `Optimize this resume for 100% ATS compatibility (Greenhouse, iCIMS) with strong executive impact. Improve structure, writing, and clarity without inventing experience.`)
      : (lang === 'es'
          ? `Adapta este CV específicamente para este aviso laboral. Prioriza lenguaje del aviso, logros relevantes y orden estratégico sin inventar información.`
          : `Tailor this resume specifically for this job notice. Prioritize job language, relevant achievements, and strategic ordering without inventing information.`);

    const result = await callAIProxy({
      model: TEXT_MODEL,
      contents: [
        { role: "user", parts: [
          { text: `CV Original: ${resumeRaw}` },
          { text: jobRaw ? `Job Description: ${jobRaw}` : '' },
          { text: prompt }
        ]}
      ],
      config: {
        systemInstruction: lang === 'es' 
          ? "Eres un redactor experto de CVs de nivel C-Level en Español. Escribes de forma sobria, ejecutiva y orientada a resultados. NUNCA inventas datos."
          : "You are an expert C-Level CV writer in English. You write in a sober, executive, and results-oriented manner. NEVER invent data.",
      }
    });

    return result.text;
  }
};

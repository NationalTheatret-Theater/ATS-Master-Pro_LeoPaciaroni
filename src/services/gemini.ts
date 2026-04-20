import { GoogleGenAI, Type } from "@google/genai";
import { Language } from '../types';

/**
 * Native Gemini Service (Frontend-first as per Skill Guidelines)
 */
const TEXT_MODEL = "gemini-2.0-flash";

// Robust API Key recovery for Frontend (Hybrid Strategy)
const getFrontendApiKey = (): string => {
  // 1. Check the Dynamic Runtime Bridge (Highest Priority)
  const dynamicConfig = (window as any).__ENGINE_CONFIG__;
  if (dynamicConfig?.GEMINI_API_KEY && dynamicConfig.GEMINI_API_KEY.length > 5) {
    return dynamicConfig.GEMINI_API_KEY;
  }

  // 2. Check build-time injected keys (Fallback)
  const key = process.env.GEMINI_API_KEY || 
              process.env.LLAVE_EXPERTA || 
              (process.env as any).VITE_LLAVE_EXPERTA || 
              (process.env as any).VITE_GEMINI_API_KEY ||
              (window as any).__GEMINI_API_KEY__;
  
  if (!key || key === 'undefined' || key === 'null' || key.length < 5) {
    return '';
  }
  return key;
};

const apiKey = getFrontendApiKey();

// Initialize AI with safe fallback
const ai = new GoogleGenAI({ 
  apiKey: apiKey || 'AIza_STABLE_PLACEHOLDER' 
});

// Guard function to check key before any call
const ensureApiKey = () => {
  const currentKey = getFrontendApiKey();
  const lastUpdate = (window as any).__ENGINE_CONFIG__?.lastUpdated || 'No detectada';
  
  if (!currentKey || currentKey.length < 10) {
    throw new Error(
      "SISTEMA SIN LLAVE DETECTADA.\n\n" +
      "He detectado que el servidor inició, pero la llave no está pasando al motor.\n\n" +
      "PASOS CRÍTICOS:\n" +
      "1. Verifica que el Secret se llame LLAVE_EXPERTA (todo mayúsculas).\n" +
      "2. Pulsa 'Restart Server' (icono flecha circular arriba).\n" +
      "3. REFRESCAR CON F5 (importante).\n\n" +
      `Sincronización: ${lastUpdate}`
    );
  }
};

export const geminiService = {
  /**
   * Módulo 3. Parsing inteligente del CV
   */
  async parseResume(text: string, lang: Language) {
    ensureApiKey();
    const response = await ai.models.generateContent({
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

    return JSON.parse(response.text);
  },

  /**
   * Módulo 4. Parsing del job description
   */
  async parseJob(text: string, lang: Language) {
    ensureApiKey();
    const response = await ai.models.generateContent({
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

    return JSON.parse(response.text);
  },

  /**
   * Módulo 5-15: Executive Intelligence Core
   */
  async analyzeExecutive(resumeData: any, jobData: any | null, lang: Language) {
    ensureApiKey();
    const prompt = `Realiza un análisis integral del CV nivel EXECUTIVE ENGINE.
    
    RESUME DATA: ${JSON.stringify(resumeData)}
    JOB DATA: ${jobData ? JSON.stringify(jobData) : 'N/A'}
    
    TAREAS:
    1. Calcula 8 SCORES (0-100) siguiendo esta ponderación:
       - 20% ATS Compatibility
       - 20% Executive Positioning
       - 15% Achievement Strength
       - 15% Clarity
       - 10% Keyword Relevance
       - 10% Career Consistency
       - 10% Parsing AI
    2. Detecta ALERTA críticas de riesgo comercial y ATS.
    3. Genera LINKEDIN PULSE: 
       - 5 Variaciones de Headline sugeridas.
       - 1 Borrador de sección 'About' estratégico.
       - Top 10 Keywords críticas.
       - Diagnóstico por secciones y acciones prioritarias.
    4. Genera MARKET PULSE: Roles alternativos, industrias puente, tendencia.
    5. Genera ORIENTación DE CARRERA: Sugiere 5 roles target, rankeados por match %, con fortalezas y gaps para cada uno.
    6. Genera MAPA DE CARRERA: Next-step roles (inmediatos), stretch roles (desafío), pivot roles (cambio), y timeline detallado (1, 3, 5 años).
    7. SECCIÓN DE MEJORA: Para cada sección crítica del CV (Headline, Summary, Logros principales), genera:
       - originalText: El texto fuente del CV.
       - recommendedChange: Explicación de qué cambiar y por qué.
       - rewrittenText: El texto ya optimizado (aplicado directamente).
    
    LENGUAJE: El idioma por defecto es Español. Si el CV está en Español, todo el reporte DEBE estar en Español. Si el usuario selecciona Inglés, responde en Inglés.
    `;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: `Eres EXECUTIVE CV INTELLIGENCE ENGINE. Eres un experto en Outplacement y Executive Search Senior.
        Tus diagnósticos son deterministicos y quirúrgicos. No usas lenguaje genérico.
        TODA la respuesta debe estar en ${lang === 'es' ? 'Español' : 'Inglés'}.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scores: {
              type: Type.OBJECT,
              properties: {
                parsing: { type: Type.NUMBER },
                ats: { type: Type.NUMBER },
                executive: { type: Type.NUMBER },
                achievements: { type: Type.NUMBER },
                clarity: { type: Type.NUMBER },
                keywords: { type: Type.NUMBER },
                consistency: { type: Type.NUMBER },
                personalization: { type: Type.NUMBER },
                overall: { type: Type.NUMBER }
              }
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  level: { type: Type.STRING, enum: ["Critical", "Warning", "Info"] },
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
                  priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
                }
              }
            },
            linkedInPulse: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                diagnosis: {
                  type: Type.OBJECT,
                  properties: {
                    headline: { type: Type.STRING },
                    about: { type: Type.STRING },
                    experience: { type: Type.STRING },
                    skills: { type: Type.STRING }
                  }
                },
                headlineSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                aboutRewrite: { type: Type.STRING },
                topKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                priorityActions: { type: Type.ARRAY, items: { type: Type.STRING } }
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
            },
            careerOrientation: {
              type: Type.OBJECT,
              properties: {
                roles: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      role: { type: Type.STRING },
                      fitPercentage: { type: Type.NUMBER },
                      fitReason: { type: Type.STRING },
                      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                      gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                      recommendation: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            careerMap: {
              type: Type.OBJECT,
              properties: {
                currentIdentity: { type: Type.STRING },
                nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                stretchRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                pivotRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                consultingOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                timeline: {
                  type: Type.OBJECT,
                  properties: {
                    year1: { type: Type.STRING },
                    year3: { type: Type.STRING },
                    year5: { type: Type.STRING }
                  }
                },
                blockers: { type: Type.ARRAY, items: { type: Type.STRING } },
                skillGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                narrativeAdvice: { type: Type.STRING }
              }
            },
            improvedCV: {
              type: Type.OBJECT,
              properties: {
                sections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      originalText: { type: Type.STRING },
                      recommendedChange: { type: Type.STRING },
                      rewrittenText: { type: Type.STRING }
                    }
                  }
                },
                fullATS: { type: Type.STRING },
                fullExecutive: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text);
  },

  /**
   * Módulo 9. Generación de CV mejorado
   */
  async optimizeResume(resumeRaw: string, jobRaw: string | null, type: 'ATS_OPTIMIZED' | 'TAILOR_MADE', lang: Language) {
    ensureApiKey();
    const prompt = type === 'ATS_OPTIMIZED' 
      ? (lang === 'es' 
          ? `Optimiza este CV para que sea 100% compatible con ATS (Greenhouse, iCIMS) y tenga un fuerte impacto ejecutivo. Mejora estructura, redacción y claridad sin inventar experiencia.` 
          : `Optimize this resume for 100% ATS compatibility (Greenhouse, iCIMS) with strong executive impact. Improve structure, writing, and clarity without inventing experience.`)
      : (lang === 'es'
          ? `Adapta este CV específicamente para este aviso laboral. Prioriza lenguaje del aviso, logros relevantes y orden estratégico sin inventar información.`
          : `Tailor this resume specifically for this job notice. Prioritize job language, relevant achievements, and strategic ordering without inventing information.`);

    const response = await ai.models.generateContent({
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

    return response.text;
  }
};

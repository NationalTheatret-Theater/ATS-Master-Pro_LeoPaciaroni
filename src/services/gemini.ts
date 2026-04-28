import { GoogleGenAI, Type } from "@google/genai";
import { Language } from '../types';

/**
 * Native Gemini Service (Frontend-first as per Skill Guidelines)
 */
const FLASH_MODEL = "gemini-1.5-flash";
const PRO_MODEL = "gemini-1.5-pro";
const TEXT_MODEL = FLASH_MODEL; // Default to Flash for maximum stability and speed during demand spikes

// Robust API Key recovery for Frontend (Hybrid Strategy)
export const getFrontendApiKey = (): string => {
  // 0. Priority: Manual Local Storage (User override)
  const manualKey = localStorage.getItem('MANUAL_GEMINI_API_KEY');
  if (manualKey && manualKey.length >= 30) {
    return manualKey;
  }

  // 1. Check the Dynamic Runtime Bridge (Current Environment)
  const dynamicConfig = (window as any).__ENGINE_CONFIG__;
  const bridgeKey = dynamicConfig?.GEMINI_API_KEY?.trim();
  
  if (bridgeKey && bridgeKey.length > 10) {
    // Hidden internal diagnostic
    (window as any)._LOG_KEY_SOURCE = dynamicConfig.source || 'Bridge';
    return bridgeKey;
  }

  // 2. Check build-time injected keys
  const envKey = (process.env.GEMINI_API_KEY || 
                 process.env.LLAVE_EXPERTA || 
                 (process.env as any).VITE_LLAVE_EXPERTA || 
                 (process.env as any).VITE_GEMINI_API_KEY ||
                 (window as any).__GEMINI_API_KEY__)?.trim();
  
  if (envKey && envKey.length > 10) {
    return envKey;
  }

  return '';
};

export const isApiKeySetup = (): boolean => {
  const key = getFrontendApiKey();
  const isProjectId = key.startsWith('generative-language-') || key.includes(':');
  return key.length >= 30 && !isProjectId;
};

// Lazy initialization of AI client to prevent startup crashes
let aiInstance: GoogleGenAI | null = null;
const getAiClient = () => {
  const currentKey = getFrontendApiKey();
  // Always recreate instance if key changes or was empty
  if (!aiInstance || (currentKey && currentKey.length > 10)) {
    aiInstance = new GoogleGenAI({ 
      apiKey: currentKey || 'PENDING_VALIDATION'
    });
  }
  return aiInstance;
};

// Guard function to check key before any call
const ensureApiKey = () => {
  const currentKey = getFrontendApiKey();
  
  // 1. Case: Key is missing or too short to be real
  if (!currentKey || currentKey.length < 10) {
    const errorMsg = "CONFIGURACIÓN REQUERIDA: LLAVE DE API FALTANTE\n\n" +
      "Para que el motor de inteligencia pueda analizar tu CV, necesitas configurar una API Key de Google Gemini.\n\n" +
      "PASOS PARA SOLUCIONARLO:\n" +
      "1. REGISTRO: Ve a https://aistudio.google.com/app/apikey y pulsa el botón 'Create API key'.\n" +
      "2. COPIADO: Copia el código que aparece (empieza por 'AIzaSy' y tiene exactamente 39 caracteres).\n" +
      "3. CONFIGURACIÓN: En esta ventana de AI Studio, pulsa el icono de 'Configuración' (Settings) o el icono de llave 🔑 (Secrets).\n" +
      "4. SECRETO: Crea un nuevo secreto llamado 'LLAVE_EXPERTA' y pega allí tu código.\n" +
      "5. APLICAR: Pulsa el botón 'RESTART SERVER' en la consola inferior para activar la nueva configuración.";
    
    console.error(`[Executive Engine] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // 2. Case: Common pitfall - PII or Project ID pasted instead of Key
  const isProjectId = currentKey.startsWith('generative-language-') || currentKey.includes(':');
  if (isProjectId || (currentKey.length > 10 && currentKey.length < 38)) {
    const errorMsg = `ERROR DE VALIDACIÓN: LLAVE NO VÁLIDA (${currentKey.length} caracteres)\n\n` +
      "⚠️ PARECE QUE HAS PEGADO UN 'PROJECT ID' EN LUGAR DE UNA 'API KEY'.\n\n" +
      "DIFERENCIAS VISUALES:\n" +
      "❌ INCORRECTO: 'generative-language-xxxx' (Esto es un identificador interno).\n" +
      "✅ CORRECTO: 'AIzaSy...' (Debe empezar por AIzaSy y ser un código alfanumérico).\n\n" +
      "POR FAVOR:\n" +
      "Vuelve a https://aistudio.google.com/app/apikey y asegúrate de copiar el valor de la columna 'API KEY', no el nombre del proyecto.";
    
    console.error(`[Executive Engine] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // 3. Case: Key looks roughly correct but motor fails (handled by catch at call site)
}

// Helper to handle retries on quota errors
const withRetry = async <T>(fn: () => Promise<T>, retries = 2): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const isQuotaError = error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('exhausted');
    if (isQuotaError && retries > 0) {
      console.warn(`Quota hit, retrying in 2 seconds... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return withRetry(fn, retries - 1);
    }
    
    if (isQuotaError) {
      throw new Error("EL MOTOR ESTÁ SATURADO (Google Free Tier).\n\nPor favor, espera 30 segundos sin pulsar nada y vuelve a intentarlo. Esto pasa porque Google limita la velocidad en cuentas gratuitas.");
    }
    throw error;
  }
};

export const geminiService = {
  /**
   * Módulo 3. Parsing inteligente del CV
   */
  async parseResume(text: string, lang: Language) {
    ensureApiKey();
    const ai = getAiClient();
    const response = await withRetry(() => ai.models.generateContent({
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
    }));

    return JSON.parse(response.text);
  },

  /**
   * Módulo 4. Parsing del job description
   */
  async parseJob(text: string, lang: Language) {
    ensureApiKey();
    const ai = getAiClient();
    const response = await withRetry(() => ai.models.generateContent({
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
    }));

    return JSON.parse(response.text);
  },

  /**
   * Módulo 5-15: Executive Intelligence Core
   */
  async analyzeExecutive(resumeData: any, jobData: any | null, lang: Language) {
    console.log('[Executive Engine] Starting Analysis...', { hasJob: !!jobData, lang });
    ensureApiKey();
    const ai = getAiClient();
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
    4. Genera MARKET PULSE: Roles alternativos, industrias puente, tendencia, hard skills en demanda, soft skills en demanda y nivel de demanda actual del mercado.
    5. Genera ORIENTación DE CARRERA: Sugiere 5 roles target, rankeados por match %, con fortalezas y gaps para cada uno.
    6. Genera MAPA DE CARRERA: Next-step roles (inmediatos), stretch roles (desafío), pivot roles (cambio), y timeline detallado (1, 3, 5 años).
    7. SECCIÓN DE MEJORA: Para cada sección crítica del CV (Headline, Summary, Logros principales), genera:
       - originalText: El texto fuente del CV.
       - recommendedChange: Explicación de qué cambiar y por qué.
       - rewrittenText: El texto ya optimizado (aplicado directamente).
    8. CV COMPLETO OPTIMIZADO (PRODUCTO FINAL - MÁXIMA EXTENSIÓN): 
       - REGLA DE ORO: CERO PÉRDIDA DE INFORMACIÓN. No agrupes, no resumas, no resumas.
       - fullATS: Genera un documento de 2-4 páginas con 100% de la historia laboral. Cada puesto DEBE incluir Empresa, Cargo, Fechas, Logros cuantificados (3-5 por cargo) y responsabilidades.
       - fullExecutive: Genera un documento de 2-4 páginas con narrativa de ALTO IMPACTO, verbos de acción y propuesta estratégica. Debe incluir TODO el historial profesional.
       - AMBAS versiones deben ser el producto final listo para descargar y usar. NO SON UN RESUMEN.
    
    LENGUAJE: El idioma por defecto es Español. Si el CV está en Español, todo el reporte DEBE estar en Español. Si el usuario selecciona Inglés, responde en Inglés.
    `;

    try {
      console.log('[Executive Engine] Calling Gemini API (PRO)...');
      
      // Use a race to implement a timeout for the API call
      const analysisPromise = withRetry(() => ai.models.generateContent({
        model: TEXT_MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: `Eres EXECUTIVE CV INTELLIGENCE ENGINE. Eres un experto en Outplacement y Executive Search Senior.
          Tus diagnósticos son deterministicos y quirúrgicos. No usas lenguaje genérico.
          TODA la respuesta debe estar en ${lang === 'es' ? 'Español' : 'Inglés'}.`,
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
          temperature: 0.1,
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
                  fullATS: { 
                    type: Type.STRING, 
                    description: "CV COMPLETO EXHAUSTIVO (Mínimo 1500 palabras). Formato ATS Profesional." 
                  },
                  fullExecutive: { 
                    type: Type.STRING, 
                    description: "CV COMPLETO EXHAUSTIVO (Mínimo 1500 palabras). Narrativa Ejecutiva de Alto Impacto." 
                  }
                }
              }
            }
          }
        }
      }));

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("TIEMPO DE ESPERA AGOTADO (Timeout).\n\nEl análisis está tardando más de lo normal debido a la alta carga del motor de Google. Por favor, intenta de nuevo.")), 45000)
      );

      const response = await Promise.race([analysisPromise, timeoutPromise]) as any;

      console.log('[Executive Engine] API Success. Parsing response text...');
      const responseText = response.text;
      const result = JSON.parse(responseText);
      console.log('[Executive Engine] Analysis Complete.', result);
      return result;
    } catch (e: any) {
      console.error('[Executive Engine] Fatal Analysis Error:', e);
      throw e;
    }
  },

  /**
   * Módulo 9. Generación de CV mejorado
   */
  async optimizeResume(resumeRaw: string, jobRaw: string | null, type: 'ATS_OPTIMIZED' | 'TAILOR_MADE', lang: Language) {
    ensureApiKey();
    const ai = getAiClient();
    const prompt = type === 'ATS_OPTIMIZED' 
      ? (lang === 'es' 
          ? `Optimiza este CV para que sea 100% compatible con ATS (Greenhouse, iCIMS) y tenga un fuerte impacto ejecutivo. Mejora estructura, redacción y claridad sin inventar experiencia. Genera un documento EXTENSO, no un resumen.` 
          : `Optimize this resume for 100% ATS compatibility (Greenhouse, iCIMS) with strong executive impact. Improve structure, writing, and clarity without inventing experience. Generate an EXTENSIVE document, not a summary.`)
      : (lang === 'es'
          ? `Adapta este CV específicamente para este aviso laboral. Prioriza lenguaje del aviso, logros relevantes y orden estratégico sin inventar información. Mantén la extensión profesional (2-3 páginas).`
          : `Tailor this resume specifically for this job notice. Prioritize job language, relevant achievements, and strategic ordering without inventing information. Maintain professional length (2-3 pages).`);

    const response = await withRetry(() => ai.models.generateContent({
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
          ? "Eres un redactor experto de CVs de nivel C-Level en Español. Escribes de forma sobria, ejecutiva y orientada a resultados. NUNCA inventas datos. Tus CVs son extensos y detallados, no resúmenes. RECUERDA: Conserva el 100% de la historia laboral."
          : "You are an expert C-Level CV writer in English. You write in a sober, executive, and results-oriented manner. NEVER invent data. Your resumes are extensive and detailed, not summaries. REMEMBER: Retain 100% of work history.",
        maxOutputTokens: 8192,
        temperature: 0.3
      }
    }));

    return (response as any).text;
  }
};

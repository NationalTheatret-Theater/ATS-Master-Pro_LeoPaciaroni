import {
  ATSAnalysis,
  ChatMessage,
  Language,
  LinkedInInsight,
  GitHubInsight,
  MatchVerification,
  OptimizationResult,
  SectionScore,
  TailoredResult,
} from "../types";

type KeywordScore = {
  found: string[];
  missing: string[];
  score: number;
};

const KEYWORD_BANK = [
  "analytics", "api", "automatizacion", "aws", "azure", "bi", "comunicacion", "crm", "css", "data", "docker", "excel", 
  "finanzas", "gestion", "github", "html", "javascript", "kpi", "liderazgo", "marketing", "node", "power bi", 
  "project management", "python", "react", "reporting", "scrum", "sql", "stakeholders", "typescript", "ventas",
  "estrategia", "presupuesto", "planificacion", "operaciones", "logistica", "riesgos", "compliance", "calidad",
  "agile", "kanban", "devops", "cloud", "seguridad", "infraestructura", "backend", "frontend", "fullstack",
  "ia", "ml", "big data", "etl", "dashboards", "customer success", "retencion", "adquisicion", "seo", "sem",
  "p&l", "ebitda", "auditoria", "contabilidad", "tesoreria", "rrhh", "reclutamiento", "talento", "payroll",
  "ventas b2b", "ventas b2c", "negotiation", "account management", "product owner", "scrum master",
  "design thinking", "ux", "ui", "figma", "adobe", "java", "c#", "php", "go", "ruby", "swift", "kotlin"
];

const SECTION_PATTERNS = [
  /experiencia|experience|work history|historial|profesional|laboral/i,
  /educacion|education|formacion|academic|universidad|estudios/i,
  /habilidades|skills|competencias|tools|tecnologias|conocimientos/i,
  /proyectos|projects|portfolio|trabajos/i,
  /certificaciones|certifications|certificados|cursos|titulos/i,
  /perfil|about|resumen|summary|objetivo|introduccion/i,
  /idiomas|languages|lenguajes/i,
  /contacto|contact|informacion personal/i,
];

const SOFT_SKILLS = [
  "liderazgo", "leadership", "comunicacion", "communication",
  "negociacion", "negotiation", "colaboracion", "collaboration",
  "resolucion", "problem solving", "adaptabilidad", "adaptability",
  "ownership", "stakeholders", "equipo", "teamwork", "estrategia"
];

const ACTION_VERBS = [
  "achieved",
  "built",
  "created",
  "developed",
  "implemented",
  "improved",
  "increased",
  "launched",
  "led",
  "managed",
  "optimized",
  "reduced",
  "automated",
  "analice",
  "aumente",
  "coordine",
  "cree",
  "desarrolle",
  "disene",
  "implemente",
  "lidere",
  "mejore",
  "optimice",
  "reduje",
];

const ROLE_KEYWORDS: Array<{ role: { es: string; en: string }; industry: { es: string; en: string }; keywords: string[] }> = [
  { role: { es: "Analista de Datos", en: "Data Analyst" }, industry: { es: "Inteligencia de Negocio", en: "Business Intelligence" }, keywords: ["data", "sql", "excel", "power bi", "analytics", "kpi", "reporting", "etl", "python"] },
  { role: { es: "Gerente de Producto", en: "Product Manager" }, industry: { es: "Tecnología", en: "Technology" }, keywords: ["stakeholders", "roadmap", "scrum", "kpi", "usuario", "producto", "gestion", "agile", "backlog"] },
  { role: { es: "Desarrollador Frontend", en: "Frontend Developer" }, industry: { es: "Software", en: "Software" }, keywords: ["react", "typescript", "javascript", "html", "css", "api", "ux", "ui", "git"] },
  { role: { es: "Desarrollador Backend", en: "Backend Developer" }, industry: { es: "Software", en: "Software" }, keywords: ["node", "api", "sql", "aws", "docker", "cloud", "java", "python", "microservicios"] },
  { role: { es: "Especialista en Operaciones", en: "Operations Specialist" }, industry: { es: "Operaciones", en: "Operations" }, keywords: ["automatizacion", "procesos", "kpi", "excel", "gestion", "mejora", "logistica", "planificacion"] },
  { role: { es: "Especialista en Marketing", en: "Marketing Specialist" }, industry: { es: "Growth / Marketing", en: "Growth / Marketing" }, keywords: ["marketing", "crm", "campanas", "analytics", "ventas", "conversion", "seo", "sem", "adquisicion"] },
  { role: { es: "Recursos Humanos / Reclutamiento", en: "HR / Recruitment" }, industry: { es: "Talento", en: "Talent" }, keywords: ["talento", "reclutamiento", "payroll", "rrhh", "gestion", "comunicacion", "entrevistas"] },
  { role: { es: "Gerente de Finanzas", en: "Finance Manager" }, industry: { es: "Finanzas", en: "Finance" }, keywords: ["presupuesto", "p&l", "ebitda", "auditoria", "contabilidad", "tesoreria", "finanzas", "analisis"] },
  { role: { es: "Customer Success", en: "Customer Success" }, industry: { es: "Servicios / SaaS", en: "Services / SaaS" }, keywords: ["retencion", "clientes", "feedback", "soporte", "crm", "fidelizacion", "gestion"] },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s+#.|$]/g, " ") 
    .replace(/\s+/g, " ");

const stripOptimizationSection = (text: string) => {
  // Removes common headers that might contain tokens we don't want to match as candidate skills
  const pattern = /## (OPTIMIZACIONES OBJETIVO|TARGET OPTIMIZATIONS|Ajuste para la oferta)[\s\S]*/i;
  return text.replace(pattern, '');
};

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));

const getWords = (text: string) => normalize(text).match(/[a-z0-9+#.]{3,}/g) || [];

const getTopTerms = (text: string, limit = 12): string[] => {
  const ignored = new Set([
    "and", "con", "del", "for", "las", "los", "para", "por", "the", "una", "que", "from", "this", "that", "como", "experiencia", "trabajo",
  ]);
  const counts = new Map<string, number>();

  getWords(text).forEach((word) => {
    if (!ignored.has(word)) {
      counts.set(word, (counts.get(word) || 0) + 1);
    }
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const scoreKeywords = (text: string, keywords = KEYWORD_BANK): KeywordScore => {
  const normText = ` ${normalize(text)} `; // Pad for boundary checks
  const found: string[] = [];
  const missing: string[] = [];

  keywords.forEach(kw => {
    const normKw = normalize(kw);
    // Explicit word boundary checks to prevent hallucinations (e.g. matching "Azure" inside another word)
    const escapedKw = normKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<=\\s|^)${escapedKw}(?=\\s|$)`, 'i');
    
    if (regex.test(normText.trim())) {
      found.push(kw);
    } else {
      missing.push(kw);
    }
  });

  const score = keywords.length ? clamp((found.length / Math.min(keywords.length, 25)) * 100) : 0;
  return { found, missing: missing.slice(0, 15), score };
};

const extractJobKeywords = (jobDescription: string) => {
  const terms = unique([...KEYWORD_BANK.filter((keyword) => normalize(jobDescription).includes(normalize(keyword))), ...getTopTerms(jobDescription, 15)]);
  return terms.slice(0, 18);
};

const countSections = (text: string) => {
  const normalizedText = normalize(text);
  return SECTION_PATTERNS.filter((pattern) => pattern.test(normalizedText)).length;
};

const metricCount = (text: string) => {
  // Enhanced to catch more business-critical numbers
  const patterns = [
    /\d+%/g,                    // Percentages
    /\$ ?\d+/g,                 // Currency
    /\d+ ?(k|m|b|ms|s)/gi,      // Scale/Time
    /\d+\+/g,                   // Numbers+
    /\d+x/gi,                   // Scale factor
    /\d+ (personas|clients|usuarios|users|customers|leads|projects|proyectos|years|años)/gi // Contextual counts
  ];
  
  let count = 0;
  patterns.forEach(p => {
    count += (text.match(p) || []).length;
  });
  return count;
};

const actionVerbCount = (text: string) => {
  const normalized = normalize(text);
  return ACTION_VERBS.filter((verb) => normalized.includes(normalize(verb))).length;
};

const buildSectionBreakdown = (text: string, keywordScore: KeywordScore, lang: Language) => {
  const detected = countSections(text);
  const totalWeight = SECTION_PATTERNS.length; 
  const sectionsScore = clamp((detected / totalWeight) * 100);
  
  const metrics = metricCount(text);
  const datePatterns = /\d{4} ?- ?\d{4}|\d{4} ?- ?present|actualidad|presente/gi;
  const hasDates = datePatterns.test(text);
  
  const impactScore = clamp(metrics * 12 + actionVerbCount(text) * 3 + (hasDates ? 15 : 0) + 10);
  const readabilityScore = clamp(100 - Math.max(0, text.length - 4500) / 90);
  const structureStatus: SectionScore["status"] = sectionsScore > 85 ? "Excellent" : sectionsScore > 65 ? "Good" : sectionsScore > 40 ? "Improvement" : "Critical";

  return [
    {
      category: lang === 'en' ? "ATS Structure" : "Estructura ATS",
      score: sectionsScore,
      feedback: sectionsScore > 80
        ? (lang === 'en' ? "Perfect document architecture. Standard headers detected." : "Arquitectura de documento perfecta. Encabezados estándar detectados.")
        : (lang === 'en' ? "Headers missing: Experience, Education or Skills." : "Faltan encabezados esenciales: Experiencia, Educación o Habilidades."),
      status: structureStatus,
    },
    {
      category: lang === 'en' ? "Strategic Keywords" : "Keywords Estratégicas",
      score: keywordScore.score,
      feedback: keywordScore.found.length > 15
        ? (lang === 'en' ? `Highly competitive density (${keywordScore.found.length} terms found).` : `Densidad altamente competitiva (${keywordScore.found.length} términos encontrados).`)
        : (lang === 'en' ? `Baseline density detected (${keywordScore.found.length} terms). Needs technical depth.` : `Densidad base detectada (${keywordScore.found.length} términos). Requiere más profundidad técnica.`),
      status: keywordScore.score > 75 ? "Excellent" as const : keywordScore.score > 55 ? "Good" as const : keywordScore.score > 35 ? "Improvement" as const : "Critical" as const,
    },
    {
      category: lang === 'en' ? "Impact Proof" : "Evidencia de Impacto",
      score: impactScore,
      feedback: metrics > 4
        ? (lang === 'en' ? "Strong use of evidence-based data. Profile projects clear ROI." : "Excelente uso de datos probatorios. Tu perfil proyecta resultados concretos.")
        : (lang === 'en' ? "Add numbers: budgets, % growth, time saved, or sales volume." : "Agrega números: presupuestos, % de mejora, ahorro de tiempo o volumen de ventas."),
      status: impactScore > 80 ? "Excellent" as const : impactScore > 60 ? "Good" as const : "Improvement" as const,
    },
    {
      category: lang === 'en' ? "Readability" : "Legibilidad",
      score: readabilityScore,
      feedback: readabilityScore > 80
        ? (lang === 'en' ? "Optimal text density for a high-speed initial screen." : "Densidad de texto óptima para una lectura de 6 segundos.")
        : (lang === 'en' ? "Document too dense. Prioritize concise achievements over task lists." : "Documento demasiado denso o verboso. Prioriza logros concisos sobre tareas."),
      status: readabilityScore > 80 ? "Excellent" as const : readabilityScore > 60 ? "Good" as const : "Improvement" as const,
    },
  ];
};

const buildCareerMatches = (text: string, lang: Language) => {
  const normalized = normalize(text);

  return ROLE_KEYWORDS.map((role) => {
    const found = role.keywords.filter((keyword) => normalized.includes(normalize(keyword)));
    const matchPercentage = clamp(40 + (found.length / role.keywords.length) * 60);

    return {
      role: role.role[lang],
      industry: role.industry[lang],
      matchPercentage,
      gapAnalysis: found.length >= role.keywords.length / 2
        ? (lang === 'en' ? `Strong foundation in ${found.slice(0, 4).join(", ")}.` : `Base sólida en ${found.slice(0, 4).join(", ")}.`)
        : (lang === 'en' ? `Optimize for ${role.keywords.filter(k => !found.includes(k)).slice(0, 3).join(", ")}.` : `Optimizar para ${role.keywords.filter(k => !found.includes(k)).slice(0, 3).join(", ")}.`),
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);
};

const buildSummary = (text: string, score: number, lang: Language) => {
  const topTerms = getTopTerms(text, 5).join(", ");
  if (lang === "en") {
    return `Local ATS review completed. Estimated score: ${score}%. Strongest signals: ${topTerms || "general professional experience"}.`;
  }
  return `Analisis ATS local completado. Puntaje estimado: ${score}%. Senales principales: ${topTerms || "experiencia profesional general"}.`;
};

const toMarkdownCV = (cvText: string, analysis: ATSAnalysis, lang: Language) => {
  const clean = cvText
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const topKeywords = unique([...analysis.foundKeywords, ...getTopTerms(clean, 12)]).slice(0, 15);
  const missing = analysis.missingKeywords.slice(0, 8);

  const title = lang === "en" ? "Refined Professional CV" : "CV Profesional Refinado";
  const sectionSummary = lang === "en" ? "PROFESSIONAL PROFILE" : "PERFIL PROFESIONAL";
  const sectionExperience = lang === "en" ? "PROFESSIONAL EXPERIENCE" : "EXPERIENCIA PROFESIONAL";
  const sectionSkills = lang === "en" ? "TECHNICAL SKILLS & COMPETENCIES" : "HABILIDADES TÉCNICAS Y COMPETENCIAS";
  const sectionDirectives = lang === "en" ? "TARGET OPTIMIZATIONS" : "OPTIMIZACIONES OBJETIVO";

  const summary = lang === "en"
    ? "Strategic professional profile optimized for modern ATS filters. Focuses on leadership, technical architecture, and quantifiable business outcomes."
    : "Perfil profesional estratégico optimizado para filtros ATS modernos. Enfocado en liderazgo, arquitectura técnica y resultados de negocio cuantificables.";

  return `# ${title.toUpperCase()}
  
## ${sectionSummary}
${summary}

## ${sectionExperience}
${clean}

## ${sectionSkills}
${topKeywords.map((keyword) => `- ${capitalize(keyword)}`).join("\n")}

## ${sectionDirectives}
${missing.map((keyword) => `- ${lang === 'en' ? `Deepen evidence for "${keyword}"` : `Profundizar evidencia para "${keyword}"`}.`).join("\n")}
- ${lang === "en" ? "Incorporate industry-standard metrics (Efficiency gains, ROI, Growth %)." : "Incorporar métricas estándar de industria (Ganancias en eficiencia, ROI, % de crecimiento)."}
`;
};

export const analyzeCV = async (cvText: string, lang: Language): Promise<ATSAnalysis> => {
  const cleanTextForMatching = stripOptimizationSection(cvText);
  const keywordScore = scoreKeywords(cleanTextForMatching);
  const sectionBreakdown = buildSectionBreakdown(cleanTextForMatching, keywordScore, lang);
  const sectionAverage = sectionBreakdown.reduce((sum, item) => sum + item.score, 0) / sectionBreakdown.length;
  
  const impactLabel = lang === 'en' ? "Impact Proof" : "Evidencia de Impacto";
  const structureLabel = lang === 'en' ? "ATS Structure" : "Estructura ATS";
  
  const impactScore = sectionBreakdown.find((item) => item.category === impactLabel)?.score || 0;
  
  // World-class ATS weighting: Keywords (35%), Impact/Metrics (45%), Structure (20%)
  const overallScore = clamp(
    keywordScore.score * 0.35 +
    impactScore * 0.45 +
    sectionBreakdown.find(b => b.category === structureLabel)!.score * 0.20
  );

  const softSkillsFound = SOFT_SKILLS.filter((skill) => normalize(cleanTextForMatching).includes(normalize(skill)));
  const culturalFit = clamp(40 + softSkillsFound.length * 12);
  const successPrediction = clamp(overallScore * 0.70 + culturalFit * 0.30);
  const hasContact = /@|linkedin\.com|github\.com|\+\d|phone|telefono/i.test(cleanTextForMatching);

  return {
    overallScore,
    keywordMatch: keywordScore.score,
    sectionBreakdown,
    vocationalProfile: {
      estimatedSeniority: cleanTextForMatching.length > 5000 || metricCount(cleanTextForMatching) > 8 
        ? (lang === 'en' ? "Senior / Strategic Leader" : "Senior / Líder Estratégico") 
        : cleanTextForMatching.length > 2500 
          ? (lang === 'en' ? "Mid-level / Professional" : "Nivel Medio / Profesional") 
          : (lang === 'en' ? "Junior / Specialist" : "Junior / Especialista"),
      marketValueScore: clamp(overallScore * 0.7 + keywordScore.found.length * 3),
      salaryRangeEstimation: lang === "en" 
        ? (cleanTextForMatching.length > 5000 ? "$8k - $12k USD/mo (Target: Global Markets)" : "$4k - $7k USD/mo")
        : (cleanTextForMatching.length > 5000 ? "$6.000.000 - $9.000.000 CLP/m (Target: Latam/Corporate)" : "$2.500.000 - $4.500.000 CLP/m"),
      recommendedLearningPath: [
        lang === 'en' ? `Mastering Strategic ${keywordScore.missing[0] || 'Leadership'} Certifications` : `Certificación Avanzada en Estrategia de ${keywordScore.missing[0] || 'Liderazgo'}`,
        lang === 'en' ? `Deep Dive: Advanced ${keywordScore.missing[1] || 'Analytics'} & Metrics` : `Especialización Técnica: ${keywordScore.missing[1] || 'Análisis'} y Métricas Críticas`,
        lang === 'en' ? `Project Management Professional (PMP) alignment for ${keywordScore.missing[2] || 'Operations'}` : `Módulo PMP: Gestión de Proyectos para ${keywordScore.missing[2] || 'Operaciones'}`,
        lang === 'en' ? `English for Business: C1 level focus for international roles` : `Inglés de Negocios: Nivel C1 para roles internacionales`,
        lang === 'en' ? `Digital Transformation: Leading ${keywordScore.missing[3] || 'Cloud'} migrations` : `Transformación Digital: Liderando migraciones ${keywordScore.missing[3] || 'Cloud'}`
      ].map(capitalize),
      topStrengths: unique([...keywordScore.found.slice(0, 5), ...softSkillsFound.slice(0, 3)]).slice(0, 8).map(capitalize),
    },
    impactScore,
    contextualMatch: clamp(keywordScore.score * 0.6 + sectionAverage * 0.4),
    successPrediction,
    culturalFit,
    performanceEstimate: lang === "en"
      ? "Alignment signals: High visibility for core technical domains and leadership soft skills."
      : "Señales de alineación: Alta visibilidad en dominios técnicos clave y liderazgo empresarial.",
    foundKeywords: keywordScore.found,
    missingKeywords: keywordScore.missing,
    criticalIssues: [
      !hasContact ? (lang === "en" ? "Critical: Contact information (Email/Phone) missing." : "Crítico: Falta información de contacto (Email/Teléfono).") : "",
      metricCount(cleanTextForMatching) < 5 ? (lang === "en" ? "Low impact: Profile lacks significant quantifiable metrics (use numbers/%)" : "Bajo impacto: Perfil carece de métricas cuantificables significativas (usar números/%).") : "",
      countSections(cleanTextForMatching) < 5 ? (lang === "en" ? "Structural Gap: Essential ATS headers missing or poorly labeled." : "Brecha Estructural: Faltan encabezados ATS habituales o mal etiquetados.") : "",
    ].filter(Boolean),
    improvementSuggestions: [
      lang === "en" ? "Modernize headers to [Profile, Professional Experience, Technology Stack]." : "Moderniza encabezados a [Perfil, Experiencia Profesional, Stack Tecnológico].",
      lang === "en" ? "Use the STAR method (Situation, Task, Action, Result) for all impact statements." : "Usa el método STAR (Situación, Tarea, Acción, Resultado) para declaraciones de impacto.",
      lang === "en" ? "Optimize keyword distribution throughout the professional summary." : "Optimiza la distribución de palabras clave en el resumen profesional.",
      ...keywordScore.missing.slice(0, 3).map((keyword) => lang === "en" ? `Provide project context for ${capitalize(keyword)}.` : `Proveer contexto de proyecto para ${capitalize(keyword)}.`),
    ],
    careerMatches: buildCareerMatches(cleanTextForMatching, lang),
    summary: buildSummary(cleanTextForMatching, overallScore, lang),
  };
};

export const optimizeCV = async (cvText: string, analysis: ATSAnalysis, lang: Language): Promise<OptimizationResult> => ({
  markdownCV: toMarkdownCV(cvText, analysis, lang),
  rationale: lang === "en"
    ? "The local optimizer improved structure, keyword visibility and achievement framing without calling external AI services."
    : "El optimizador local mejoro estructura, visibilidad de keywords y enfoque en logros sin llamar servicios externos de IA.",
});

export const tailorCVToJob = async (cvText: string, jobDescription: string, lang: Language): Promise<TailoredResult> => {
  const jobKeywords = extractJobKeywords(jobDescription);
  const match = scoreKeywords(cvText, jobKeywords.length ? jobKeywords : KEYWORD_BANK);
  const finalMatchScore = clamp(match.score + metricCount(cvText) * 2 + countSections(cvText) * 3);
  const culturalFitScore = clamp(55 + SOFT_SKILLS.filter((skill) => normalize(jobDescription + " " + cvText).includes(normalize(skill))).length * 6);
  const insertedKeywords = match.missing.slice(0, 8);
  const markdownCV = `${cvText.trim()}

## Ajuste para la oferta
${jobKeywords.slice(0, 10).map((keyword) => `- Evidencia alineada a "${keyword}": agregar ejemplo concreto del CV antes de postular.`).join("\n")}

## Keywords objetivo
${unique([...match.found, ...insertedKeywords]).slice(0, 14).map((keyword) => `- ${keyword}`).join("\n")}
`;

  const verification: MatchVerification = {
    finalMatchScore,
    culturalFitScore,
    hardSkillsMatch: match.score,
    softSkillsMatch: culturalFitScore,
    gapAnalysis: insertedKeywords.map((keyword) => lang === "en" ? `Missing stronger evidence for ${keyword}.` : `Falta evidencia mas fuerte de ${keyword}.`),
    culturalNuancesDetected: SOFT_SKILLS.filter((skill) => normalize(cvText + " " + jobDescription).includes(normalize(skill))).slice(0, 5),
    hiringManagerVerdict: lang === "en"
      ? "Solid draft. Add role-specific metrics before sending."
      : "Buen borrador. Agrega metricas especificas del cargo antes de enviarlo.",
  };

  return {
    markdownCV,
    matchScore: finalMatchScore,
    successPrediction: clamp(finalMatchScore * 0.8 + culturalFitScore * 0.2),
    culturalAlignment: lang === "en" ? "Aligned with the job language through local keyword matching." : "Alineado al lenguaje de la oferta mediante matching local de keywords.",
    changesMade: [
      lang === "en" ? "Extracted target keywords from the job description." : "Se extrajeron keywords objetivo desde la descripcion del cargo.",
      lang === "en" ? "Added a job-fit section for final manual evidence." : "Se agrego una seccion de ajuste al cargo para completar evidencia real.",
      lang === "en" ? "Generated a local match audit without external APIs." : "Se genero una auditoria local de calce sin APIs externas.",
    ],
    analysis: lang === "en"
      ? `The local engine found ${match.found.length} direct matches and ${match.missing.length} gaps against the job description.`
      : `El motor local encontro ${match.found.length} coincidencias directas y ${match.missing.length} brechas frente a la oferta.`,
    verification,
  };
};

export const getLinkedInInsights = async (cvText: string, lang: Language): Promise<LinkedInInsight> => {
  const cleanText = stripOptimizationSection(cvText);
  const allTerms = unique([...scoreKeywords(cleanText).found, ...getTopTerms(cleanText, 10)]);
  // Filter out meta-tech words and generic terms for the headline
  const ignoredForHeadline = new Set(['analytics', 'api', 'aws', 'css', 'html', 'git', 'etl', 'data', 'bi']);
  const terms = allTerms.filter(t => !ignoredForHeadline.has(t.toLowerCase())).slice(0, 10).map(capitalize);
  
  const leadTerm = terms[0] || (lang === "en" ? "Strategic Leader" : "Líder Estratégico");
  const secondTerm = terms[1] || (lang == "en" ? "Business Strategy" : "Estrategia de Negocio");

  return {
    headlineSuggestion: lang === "en"
      ? `${leadTerm} | Driving Business Growth through ${secondTerm} | Strategic Impact Focused`
      : `${leadTerm} | Impulsando Crecimiento de Negocio mediante ${secondTerm} | Enfoque en Impacto Estratégico`,
    suggestedHeadlines: [
      `${leadTerm} | Expert in ${secondTerm} | ${lang === "en" ? "Result-Oriented Leader" : "Líder Orientado a Resultados"}`,
      `${lang === "en" ? "Transforming companies via" : "Transformando empresas mediante"} ${terms.slice(0, 2).join(" & ")}`,
      `${lang === "en" ? "Scaling Operations with" : "Escalando Operaciones con"} ${terms[2] || 'Strategic Management'} | ${leadTerm}`,
      `${leadTerm} Specialists | ${secondTerm} | Strategic Visionary`,
      `${lang === "en" ? "Global Operations Leader | Focused on" : "Líder de Operaciones Globales | Enfocado en"} ${terms.slice(1, 3).join(" y ")}`
    ],
    aboutSection: lang === "en"
      ? `I help teams turn execution into measurable outcomes. My profile combines ${terms.slice(0, 5).join(", ")} and a practical focus on business impact.`
      : `Ayudo a equipos a convertir la ejecucion en resultados medibles. Mi perfil combina ${terms.slice(0, 5).join(", ")} con foco practico en impacto de negocio.`,
    trendingKeywords: terms,
    hiringTrends: lang === "en"
      ? "Profiles with clear metrics, domain keywords and concise achievements tend to perform better in recruiter searches."
      : "Los perfiles con metricas claras, keywords del dominio y logros concisos suelen rendir mejor en busquedas de reclutadores.",
    suggestedConnections: [
      lang === "en" ? "Recruiters in target industries" : "Reclutadores de industrias objetivo",
      lang === "en" ? "Hiring managers for your top 3 roles" : "Hiring managers de tus 3 roles objetivo",
      lang === "en" ? "Peers publishing about your keywords" : "Pares que publiquen sobre tus keywords",
    ],
    contentIdeas: [
      lang === "en" ? `A lesson learned applying ${leadTerm} to a real business problem.` : `Una leccion aprendida aplicando ${leadTerm} a un problema real de negocio.`,
      lang === "en" ? "Before/after story about improving a process or metric." : "Historia antes/despues sobre mejora de un proceso o metrica.",
      lang === "en" ? `Short post: how ${secondTerm} creates value in daily execution.` : `Post breve: como ${secondTerm} crea valor en la ejecucion diaria.`,
    ],
    skillGapsForMarket: scoreKeywords(cvText).missing.slice(0, 8),
    viralPotentialScore: clamp(55 + terms.length * 4 + metricCount(cvText) * 3),
  };
};

export const getGitHubInsights = async (cvText: string, lang: Language): Promise<GitHubInsight> => {
  const terms = unique([...scoreKeywords(cvText).found, ...getTopTerms(cvText, 10)]).slice(0, 8);
  const mainTech = terms[0] || "Software";
  
  return {
    suggestedBio: lang === 'en' 
      ? `Full-stack dev focused on ${mainTech} | Building scalable solutions and contributing to tech growth.`
      : `Dev Full-stack enfocado en ${mainTech} | Construyendo soluciones escalables y contribuyendo al crecimiento tecnológico.`,
    topRepoIdeas: [
      `${mainTech} Automation Suite`,
      `Personal Portfolio v4 (Neural)`,
      `Open Source Contribution to ${terms[1] || 'Infrastructure'}`
    ],
    readmeStructure: lang === 'en' 
      ? "Hi there! I'm [Name]. Expert in [Stack]. Currently building [Project]."
      : "¡Hola! Soy [Nombre]. Experto en [Stack]. Actualmente construyendo [Proyecto].",
    contributionStrategy: lang === 'en'
      ? "Focus on high-impact repo maintenance and architectural PR callbacks."
      : "Enfócate en mantenimiento de repos de alto impacto y callbacks de PR arquitectónicos.",
    techKeywords: terms,
    ossRecs: [
      lang === 'en' ? "Contribute to React docs" : "Contribuir a docs de React",
      "Tailwind UI components",
      lang === 'en' ? "Express.js middleware refactor" : "Refactor de middleware de Express.js"
    ],
    devPulseScore: clamp(60 + terms.length * 5)
  };
};

export const sendChatMessage = async (
  message: string,
  _history: ChatMessage[],
  contextData: string,
  lang: Language
): Promise<string> => {
  const text = normalize(message);
  let context: any = {};

  try {
    context = JSON.parse(contextData);
  } catch {
    context = {};
  }

  if (text.includes("score") || text.includes("puntaje") || text.includes("calce")) {
    const score = context.score || context.matchScore;
    return score
      ? (lang === "en" ? `Your current local score is ${score}%. Improve it by adding metrics and job-specific keywords.` : `Tu puntaje local actual es ${score}%. Puedes subirlo agregando metricas y keywords especificas de la oferta.`)
      : (lang === "en" ? "Run an analysis first so I can explain the score." : "Ejecuta primero un analisis para que pueda explicar el puntaje.");
  }

  if (text.includes("keyword") || text.includes("palabra")) {
    return lang === "en"
      ? "Use keywords that already appear in the job description, but attach them to real evidence from your experience."
      : "Usa keywords que ya aparezcan en la oferta, pero conectalas con evidencia real de tu experiencia.";
  }

  if (text.includes("mejor") || text.includes("improve") || text.includes("optim")) {
    return lang === "en"
      ? "Best next step: rewrite each experience bullet as Action + Context + Metric + Result."
      : "El mejor siguiente paso: reescribe cada bullet como Accion + Contexto + Metrica + Resultado.";
  }

  return lang === "en"
    ? "I am running locally now. I can help you improve structure, keywords, metrics and job fit using the analysis already generated in this browser."
    : "Ahora funciono localmente. Puedo ayudarte a mejorar estructura, keywords, metricas y calce al cargo usando el analisis generado en este navegador.";
};

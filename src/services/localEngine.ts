import {
  ATSAnalysis,
  ChatMessage,
  Language,
  LinkedInInsight,
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
  "analytics",
  "api",
  "automatizacion",
  "aws",
  "azure",
  "bi",
  "comunicacion",
  "crm",
  "css",
  "data",
  "docker",
  "excel",
  "finanzas",
  "gestion",
  "github",
  "html",
  "javascript",
  "kpi",
  "liderazgo",
  "marketing",
  "node",
  "power bi",
  "project management",
  "python",
  "react",
  "reporting",
  "scrum",
  "sql",
  "stakeholders",
  "typescript",
  "ventas",
];

const SECTION_PATTERNS = [
  /experiencia|experience|work history|historial/i,
  /educacion|education|formacion|academic/i,
  /habilidades|skills|competencias|tools/i,
  /proyectos|projects|portfolio/i,
  /certificaciones|certifications|certificados/i,
];

const SOFT_SKILLS = [
  "liderazgo",
  "comunicacion",
  "negociacion",
  "colaboracion",
  "resolucion",
  "adaptabilidad",
  "ownership",
  "stakeholders",
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

const ROLE_KEYWORDS: Array<{ role: string; industry: string; keywords: string[] }> = [
  { role: "Analista de Datos", industry: "Business Intelligence", keywords: ["data", "sql", "excel", "power bi", "analytics", "kpi", "reporting"] },
  { role: "Product Manager", industry: "Tecnologia", keywords: ["stakeholders", "roadmap", "scrum", "kpi", "usuario", "producto", "gestion"] },
  { role: "Frontend Developer", industry: "Software", keywords: ["react", "typescript", "javascript", "html", "css", "api"] },
  { role: "Operations Specialist", industry: "Operaciones", keywords: ["automatizacion", "procesos", "kpi", "excel", "gestion", "mejora"] },
  { role: "Marketing Specialist", industry: "Growth", keywords: ["marketing", "crm", "campanas", "analytics", "ventas", "conversion"] },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));

const getWords = (text: string) => normalize(text).match(/[a-z0-9+#.]{3,}/g) || [];

const getTopTerms = (text: string, limit = 12): string[] => {
  const ignored = new Set([
    "and",
    "con",
    "del",
    "for",
    "las",
    "los",
    "para",
    "por",
    "the",
    "una",
    "que",
    "from",
    "this",
    "that",
    "como",
    "experiencia",
    "trabajo",
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

const scoreKeywords = (text: string, keywords = KEYWORD_BANK): KeywordScore => {
  const normalized = normalize(text);
  const found = keywords.filter((keyword) => normalized.includes(normalize(keyword)));
  const missing = keywords.filter((keyword) => !found.includes(keyword)).slice(0, 12);
  const score = keywords.length ? clamp((found.length / keywords.length) * 100) : 0;

  return { found, missing, score };
};

const extractJobKeywords = (jobDescription: string) => {
  const terms = unique([...KEYWORD_BANK.filter((keyword) => normalize(jobDescription).includes(normalize(keyword))), ...getTopTerms(jobDescription, 15)]);
  return terms.slice(0, 18);
};

const countSections = (text: string) => SECTION_PATTERNS.filter((pattern) => pattern.test(text)).length;

const metricCount = (text: string) => (text.match(/(\d+%|\$ ?\d+|\d+\+|\d+x|\d+ personas|\d+ clients|\d+ usuarios)/gi) || []).length;

const actionVerbCount = (text: string) => {
  const normalized = normalize(text);
  return ACTION_VERBS.filter((verb) => normalized.includes(normalize(verb))).length;
};

const buildSectionBreakdown = (text: string, keywordScore: KeywordScore) => {
  const sectionsScore = clamp((countSections(text) / SECTION_PATTERNS.length) * 100);
  const impactScore = clamp(metricCount(text) * 14 + actionVerbCount(text) * 5 + 25);
  const readabilityScore = clamp(100 - Math.max(0, text.length - 4000) / 80);
  const structureStatus: SectionScore["status"] = sectionsScore > 75 ? "Excellent" : sectionsScore > 50 ? "Good" : sectionsScore > 25 ? "Improvement" : "Critical";

  return [
    {
      category: "Estructura ATS",
      score: sectionsScore,
      feedback: sectionsScore > 60
        ? "El CV tiene secciones reconocibles para filtros ATS."
        : "Agrega secciones claras como Experiencia, Educacion, Habilidades y Certificaciones.",
      status: structureStatus,
    },
    {
      category: "Keywords",
      score: keywordScore.score,
      feedback: keywordScore.found.length
        ? `Keywords detectadas: ${keywordScore.found.slice(0, 6).join(", ")}.`
        : "Faltan palabras clave tecnicas y de negocio para mejorar el matching.",
      status: keywordScore.score > 75 ? "Excellent" as const : keywordScore.score > 50 ? "Good" as const : keywordScore.score > 25 ? "Improvement" as const : "Critical" as const,
    },
    {
      category: "Impacto cuantificado",
      score: impactScore,
      feedback: metricCount(text)
        ? "Incluye resultados medibles, lo que mejora la credibilidad del perfil."
        : "Suma metricas: porcentajes, volumen, ahorro, revenue, usuarios o tiempos reducidos.",
      status: impactScore > 75 ? "Excellent" as const : impactScore > 50 ? "Good" as const : "Improvement" as const,
    },
    {
      category: "Claridad",
      score: readabilityScore,
      feedback: readabilityScore > 70
        ? "La extension es razonable para una primera lectura."
        : "Reduce bloques largos y prioriza bullets de logro.",
      status: readabilityScore > 75 ? "Excellent" as const : readabilityScore > 50 ? "Good" as const : "Improvement" as const,
    },
  ];
};

const buildCareerMatches = (text: string) => {
  const normalized = normalize(text);

  return ROLE_KEYWORDS.map((role) => {
    const found = role.keywords.filter((keyword) => normalized.includes(normalize(keyword)));
    const matchPercentage = clamp(45 + (found.length / role.keywords.length) * 50);

    return {
      role: role.role,
      industry: role.industry,
      matchPercentage,
      gapAnalysis: found.length
        ? `Base fuerte en ${found.slice(0, 4).join(", ")}.`
        : `Refuerza keywords como ${role.keywords.slice(0, 4).join(", ")}.`,
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
  const topKeywords = unique([...analysis.foundKeywords, ...getTopTerms(clean, 8)]).slice(0, 10);
  const missing = analysis.missingKeywords.slice(0, 6);

  const title = lang === "en" ? "Optimized Professional Profile" : "Perfil Profesional Optimizado";
  const summary = lang === "en"
    ? "Professional profile structured for ATS readability, keyword density and measurable impact."
    : "Perfil profesional estructurado para lectura ATS, densidad de palabras clave e impacto medible.";
  const guidance = lang === "en"
    ? "Add concrete metrics to each experience bullet where possible."
    : "Agrega metricas concretas a cada logro cuando sea posible.";

  return `# ${title}

## Resumen
${summary}

## Keywords principales
${topKeywords.map((keyword) => `- ${keyword}`).join("\n")}

## CV base depurado
${clean}

## Mejoras sugeridas
${missing.map((keyword) => `- Integrar evidencia real relacionada con ${keyword}.`).join("\n")}
- ${guidance}
`;
};

export const analyzeCV = async (cvText: string, lang: Language): Promise<ATSAnalysis> => {
  const keywordScore = scoreKeywords(cvText);
  const sectionBreakdown = buildSectionBreakdown(cvText, keywordScore);
  const sectionAverage = sectionBreakdown.reduce((sum, item) => sum + item.score, 0) / sectionBreakdown.length;
  const impactScore = sectionBreakdown.find((item) => item.category === "Impacto cuantificado")?.score || 0;
  const contextualMatch = clamp(keywordScore.score * 0.65 + sectionAverage * 0.35);
  const culturalFit = clamp(50 + SOFT_SKILLS.filter((skill) => normalize(cvText).includes(normalize(skill))).length * 7);
  const overallScore = clamp(sectionAverage * 0.45 + keywordScore.score * 0.3 + impactScore * 0.25);
  const successPrediction = clamp(overallScore * 0.75 + culturalFit * 0.25);
  const hasContact = /@|linkedin\.com|github\.com|\+\d|phone|telefono/i.test(cvText);

  return {
    overallScore,
    keywordMatch: keywordScore.score,
    sectionBreakdown,
    vocationalProfile: {
      estimatedSeniority: cvText.length > 5000 || metricCount(cvText) > 6 ? "Senior / Lead" : cvText.length > 2200 ? "Mid-level" : "Junior / Emerging",
      marketValueScore: clamp(overallScore * 0.7 + keywordScore.found.length * 2),
      salaryRangeEstimation: lang === "en" ? "Market dependent; stronger with quantified achievements." : "Dependiente del mercado; mejora al sumar logros cuantificados.",
      recommendedLearningPath: keywordScore.missing.slice(0, 5),
      topStrengths: unique([...keywordScore.found.slice(0, 5), ...getTopTerms(cvText, 3)]).slice(0, 6),
    },
    impactScore,
    contextualMatch,
    successPrediction,
    culturalFit,
    performanceEstimate: lang === "en"
      ? "Good candidate signal if the profile is aligned with a role-specific job description."
      : "Buena senal de candidatura si el perfil se alinea con una oferta especifica.",
    foundKeywords: keywordScore.found,
    missingKeywords: keywordScore.missing,
    criticalIssues: [
      !hasContact ? (lang === "en" ? "Contact information was not clearly detected." : "No se detecto informacion de contacto clara.") : "",
      metricCount(cvText) < 2 ? (lang === "en" ? "Few measurable achievements detected." : "Se detectaron pocos logros medibles.") : "",
      countSections(cvText) < 3 ? (lang === "en" ? "The CV needs clearer ATS sections." : "El CV necesita secciones ATS mas claras.") : "",
    ].filter(Boolean),
    improvementSuggestions: [
      lang === "en" ? "Use standard headings: Summary, Experience, Skills, Education and Certifications." : "Usa encabezados estandar: Resumen, Experiencia, Habilidades, Educacion y Certificaciones.",
      lang === "en" ? "Rewrite responsibilities as achievements with numbers." : "Convierte responsabilidades en logros con numeros.",
      lang === "en" ? "Mirror the language of each job description before applying." : "Replica el lenguaje de cada oferta antes de postular.",
      ...keywordScore.missing.slice(0, 4).map((keyword) => lang === "en" ? `Add proof for ${keyword}.` : `Agrega evidencia real de ${keyword}.`),
    ],
    careerMatches: buildCareerMatches(cvText),
    summary: buildSummary(cvText, overallScore, lang),
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
  const terms = unique([...scoreKeywords(cvText).found, ...getTopTerms(cvText, 10)]).slice(0, 10);
  const leadTerm = terms[0] || (lang === "en" ? "Professional" : "Profesional");
  const secondTerm = terms[1] || "Estrategia";

  return {
    headlineSuggestion: lang === "en"
      ? `${leadTerm} specialist | ${secondTerm} | Measurable business impact`
      : `Especialista en ${leadTerm} | ${secondTerm} | Impacto medible de negocio`,
    suggestedHeadlines: [
      `${leadTerm} | ${secondTerm} | ${lang === "en" ? "Execution and measurable results" : "Ejecucion y resultados medibles"}`,
      `${lang === "en" ? "Professional profile focused on" : "Perfil profesional enfocado en"} ${terms.slice(0, 3).join(", ")}`,
      `${lang === "en" ? "Driving outcomes with" : "Impulsando resultados con"} ${terms.slice(0, 4).join(", ")}`,
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

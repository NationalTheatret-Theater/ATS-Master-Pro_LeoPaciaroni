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

const ROLE_KEYWORDS: Array<{ role: string; industry: string; keywords: string[] }> = [
  { role: "Analista de Datos", industry: "Business Intelligence", keywords: ["data", "sql", "excel", "power bi", "analytics", "kpi", "reporting", "etl", "python"] },
  { role: "Product Manager", industry: "Tecnologia", keywords: ["stakeholders", "roadmap", "scrum", "kpi", "usuario", "producto", "gestion", "agile", "backlog"] },
  { role: "Frontend Developer", industry: "Software", keywords: ["react", "typescript", "javascript", "html", "css", "api", "ux", "ui", "git"] },
  { role: "Backend Developer", industry: "Software", keywords: ["node", "api", "sql", "aws", "docker", "cloud", "java", "python", "microservicios"] },
  { role: "Operations Specialist", industry: "Operaciones", keywords: ["automatizacion", "procesos", "kpi", "excel", "gestion", "mejora", "logistica", "planificacion"] },
  { role: "Marketing Specialist", industry: "Growth", keywords: ["marketing", "crm", "campanas", "analytics", "ventas", "conversion", "seo", "sem", "adquisicion"] },
  { role: "HR / Recruitment", industry: "Recursos Humanos", keywords: ["talento", "reclutamiento", "payroll", "rrhh", "gestion", "comunicacion", "entrevistas"] },
  { role: "Finance Manager", industry: "Finanzas", keywords: ["presupuesto", "p&l", "ebitda", "auditoria", "contabilidad", "tesoreria", "finanzas", "analisis"] },
  { role: "Customer Success", industry: "Servicios", keywords: ["retencion", "clientes", "feedback", "soporte", "crm", "fidelizacion", "gestion"] },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s+#.|$]/g, " ") // Replace punctuation with space for better tokenization
    .replace(/\s+/g, " ");

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
    // Use word boundary-like regex for better accuracy
    // Checks if the keyword exists with spaces or start/end of string surrounding it
    const escapedKw = normKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\s${escapedKw}\\s`, 'i');
    
    if (regex.test(normText) || normText.includes(` ${normKw} `)) {
      found.push(kw);
    } else {
      missing.push(kw);
    }
  });

  const score = keywords.length ? clamp((found.length / keywords.length) * 100) : 0;
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

const buildSectionBreakdown = (text: string, keywordScore: KeywordScore) => {
  const detected = countSections(text);
  const totalWeight = SECTION_PATTERNS.length - 2; // Allow skipping 2 minor sections for a perfect score
  const sectionsScore = clamp((detected / totalWeight) * 100);
  
  // Advanced metric detection including date ranges
  const metrics = metricCount(text);
  const datePatterns = /\d{4} ?- ?\d{4}|\d{4} ?- ?present|actualidad|presente/gi;
  const hasDates = datePatterns.test(text);
  
  const impactScore = clamp(metrics * 15 + actionVerbCount(text) * 4 + (hasDates ? 15 : 0) + 10);
  const readabilityScore = clamp(100 - Math.max(0, text.length - 4500) / 90);
  const structureStatus: SectionScore["status"] = sectionsScore > 85 ? "Excellent" : sectionsScore > 65 ? "Good" : sectionsScore > 40 ? "Improvement" : "Critical";

  return [
    {
      category: "Estructura ATS",
      score: sectionsScore,
      feedback: sectionsScore > 75
        ? "Arquitectura de documento compatible con motores de búsqueda por secciones."
        : "Se recomienda usar encabezados estándar: Experiencia, Educación, Habilidades.",
      status: structureStatus,
    },
    {
      category: "Keywords",
      score: keywordScore.score,
      feedback: keywordScore.found.length
        ? `Se detectaron ${keywordScore.found.length} conexiones semánticas clave.`
        : "Faltan términos técnicos que validen tu experiencia en el sector objetivo.",
      status: keywordScore.score > 75 ? "Excellent" as const : keywordScore.score > 55 ? "Good" as const : keywordScore.score > 35 ? "Improvement" as const : "Critical" as const,
    },
    {
      category: "Impacto cuantificado",
      score: impactScore,
      feedback: metrics > 4
        ? "Excelente uso de datos probatorios. Tu perfil proyecta resultados concretos."
        : "Agrega números: presupuestos, % de mejora, ahorro de tiempo o volumen de ventas.",
      status: impactScore > 80 ? "Excellent" as const : impactScore > 60 ? "Good" as const : "Improvement" as const,
    },
    {
      category: "Claridad",
      score: readabilityScore,
      feedback: readabilityScore > 80
        ? "Densidad de texto óptima para una lectura de 6 segundos."
        : "Documento demasiado denso o verboso. Prioriza logros concisos sobre tareas.",
      status: readabilityScore > 80 ? "Excellent" as const : readabilityScore > 60 ? "Good" as const : "Improvement" as const,
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
  const sectionSummary = lang === "en" ? "PROFESSIONAL SUMMARY" : "RESUMEN PROFESIONAL";
  const sectionCore = lang === "en" ? "TECHNICAL CORE & KEYWORDS" : "NÚCLEO TÉCNICO Y PALABRAS CLAVE";
  const sectionExperience = lang === "en" ? "REFINED EXPERIENCE" : "EXPERIENCIA REFINADA";
  const sectionGuidance = lang === "en" ? "STRATEGIC OPTIMIZATIONS" : "OPTIMIZACIONES ESTRATÉGICAS";

  const summary = lang === "en"
    ? "High-impact professional profile structured for ATS readability and keyword density. Focused on measurable business outcomes and scalable infrastructure."
    : "Perfil profesional de alto impacto estructurado para legibilidad ATS y densidad de palabras clave. Enfocado en resultados de negocio medibles e infraestructura escalable.";

  return `# ${title.toUpperCase()}

## ${sectionSummary}
${summary}

## ${sectionCore}
${topKeywords.map((keyword) => `- ${capitalize(keyword)}`).join("\n")}

## ${sectionExperience}
${clean}

## ${sectionGuidance}
${missing.map((keyword) => `- ${lang === 'en' ? `Integrate specific evidence for "${keyword}"` : `Integrar evidencia específica para "${keyword}"`}.`).join("\n")}
- ${lang === "en" ? "Quantify achievements using specific metrics (%, $, volume)." : "Cuantificar logros usando métricas específicas (%, $, volumen)."}
`;
};

export const analyzeCV = async (cvText: string, lang: Language): Promise<ATSAnalysis> => {
  const keywordScore = scoreKeywords(cvText);
  const sectionBreakdown = buildSectionBreakdown(cvText, keywordScore);
  const sectionAverage = sectionBreakdown.reduce((sum, item) => sum + item.score, 0) / sectionBreakdown.length;
  const impactScore = sectionBreakdown.find((item) => item.category === "Impacto cuantificado")?.score || 0;
  
  // World-class ATS weighting: Structure (40%), Keywords (40%), Impact/Metrics (20%)
  const overallScore = clamp(
    sectionBreakdown.find(b => b.category === "Estructura ATS")!.score * 0.4 +
    keywordScore.score * 0.4 +
    impactScore * 0.2
  );

  const culturalFit = clamp(50 + SOFT_SKILLS.filter((skill) => normalize(cvText).includes(normalize(skill))).length * 7);
  const successPrediction = clamp(overallScore * 0.75 + culturalFit * 0.25);
  const hasContact = /@|linkedin\.com|github\.com|\+\d|phone|telefono/i.test(cvText);

  return {
    overallScore,
    keywordMatch: keywordScore.score,
    sectionBreakdown,
    vocationalProfile: {
      estimatedSeniority: cvText.length > 5000 || metricCount(cvText) > 6 
        ? (lang === 'en' ? "Senior / Lead" : "Senior / Líder") 
        : cvText.length > 2200 
          ? (lang === 'en' ? "Mid-level" : "Nivel Medio") 
          : (lang === 'en' ? "Junior / Emerging" : "Junior / Emergente"),
      marketValueScore: clamp(overallScore * 0.65 + keywordScore.found.length * 2.5),
      salaryRangeEstimation: lang === "en" 
        ? "Computed based on keyword density and detected seniority." 
        : "Calculado basado en la densidad de palabras clave y el seniority detectado.",
      recommendedLearningPath: keywordScore.missing.slice(0, 5).map(capitalize),
      topStrengths: unique([...keywordScore.found.slice(0, 5), ...getTopTerms(cvText, 3)]).slice(0, 6).map(capitalize),
    },
    impactScore,
    contextualMatch: clamp(keywordScore.score * 0.6 + sectionAverage * 0.4),
    successPrediction,
    culturalFit,
    performanceEstimate: lang === "en"
      ? "Alignment signals: High visibility for core technical domains."
      : "Señales de alineación: Alta visibilidad en dominios técnicos clave.",
    foundKeywords: keywordScore.found,
    missingKeywords: keywordScore.missing,
    criticalIssues: [
      !hasContact ? (lang === "en" ? "Critical: Contact information (Email/Phone) missing." : "Crítico: Falta información de contacto (Email/Teléfono).") : "",
      metricCount(cvText) < 3 ? (lang === "en" ? "Low impact: Missing quantifiable metrics in achievements." : "Bajo impacto: Faltan métricas cuantificables en los logros.") : "",
      countSections(cvText) < 4 ? (lang === "en" ? "Structural Gap: Essential ATS sections missing." : "Brecha Estructural: Faltan secciones ATS esenciales.") : "",
    ].filter(Boolean),
    improvementSuggestions: [
      lang === "en" ? "Standardize headers to [Experience, Education, Technical Skills, Profile]." : "Estandariza encabezados a [Experiencia, Educación, Habilidades Técnicas, Perfil].",
      lang === "en" ? "Apply the CAR (Context, Action, Result) method to all bullets." : "Aplica el método CAR (Contexto, Acción, Resultado) a cada logro.",
      lang === "en" ? "Increase keyword density for target industry keywords." : "Aumenta la densidad de palabras clave para la industria objetivo.",
      ...keywordScore.missing.slice(0, 3).map((keyword) => lang === "en" ? `Demonstrate expertise in ${capitalize(keyword)}.` : `Demostrar experiencia en ${capitalize(keyword)}.`),
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
  const allTerms = unique([...scoreKeywords(cvText).found, ...getTopTerms(cvText, 10)]);
  // Filter out meta-tech words for the headline to avoid "Especialista en api"
  const ignoredForHeadline = new Set(['api', 'aws', 'css', 'html', 'git', 'etl']);
  const terms = allTerms.filter(t => !ignoredForHeadline.has(t)).slice(0, 10).map(capitalize);
  
  const leadTerm = terms[0] || (lang === "en" ? "Executive" : "Ejecutivo");
  const secondTerm = terms[1] || (lang == "en" ? "Strategy" : "Estrategia");

  return {
    headlineSuggestion: lang === "en"
      ? `${leadTerm} Leader | ${secondTerm} specialist | Driving business growth`
      : `${leadTerm} | Especialista en ${secondTerm} | Impulsando crecimiento de negocio`,
    suggestedHeadlines: [
      `${leadTerm} | ${secondTerm} | ${lang === "en" ? "Strategic results & Execution" : "Resultados estratégicos y Ejecución"}`,
      `${lang === "en" ? "Expert focused on" : "Experto enfocado en"} ${terms.slice(0, 3).join(" | ")}`,
      `${lang === "en" ? "Scaling operations through" : "Escalando operaciones mediante"} ${terms.slice(0, 2).join(" & ")}`,
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

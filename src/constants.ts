import { Language } from "./types";

export const UI_TEXTS = {
  es: {
    heroTitle: "¿Listo para destacar?",
    heroSubtitle: "GPT-4o Neural Engine v4.2",
    placeholder: "Escribe o pega tu CV aquí...",
    uploadTitle: "Sube tu CV (PDF, DOCX, TXT)",
    uploadDesc: "Arrastra tu archivo aquí o haz clic para buscar",
    fileProcessing: "Leyendo y limpiando archivo...",
    startBtn: "Comenzar Análisis Neural",
    analyzing: "Procesando Perfil...",
    syncing: "Sincronizando con la Vacante...",
    successAnalysis: "¡Análisis Completado con Éxito!",
    successTailor: "¡CV Adaptado Estratégicamente!",
    resultsTitle: "Informe Vocacional & Optimización",
    resultsSubtitle: "Diagnóstico de carrera y proyección de mercado",
    emptyResultsTitle: "Aún no hay resultados disponibles",
    emptyResultsDesc: "Para generar el Informe Vocacional y el CV Optimizado, primero necesitamos procesar tu información profesional.",
    goToUpload: "Ir a Cargar CV",
    optimizedReady: "Versión Optimizada Lista",
    optimizedDesc: "El puntaje mejorará drásticamente si validas esta versión.",
    validateBtn: "Validar Mejora (Re-analizar)",
    tailorBtn: "Personalizar CV",
    aiProjection: "Proyección de Carrera IA",
    topRoles: "Top 5 Roles Compatibles Sugeridos",
    match: "Afinidad",
    suggestion: "Sugerencia",
    tailorTitle: "Adaptación Estratégica",
    tailorSubtitle: "Alineamiento con descripción de puesto específica",
    tailorEmptyTitle: "Falta el CV Base Optimizado",
    tailorEmptyDesc: "Para adaptar tu CV a una oferta específica, primero necesitamos analizar y optimizar tu perfil base.",
    jdPlaceholder: "Pega aquí el aviso o descripción del empleo...",
    syncBtn: "Sincronizar CV con esta Vacante",
    auditTitle: "Auditoría Neural (Post-Optimización)",
    finalMatch: "Match Final Verificado",
    culturalFit: "Ajuste Cultural",
    strategyTitle: "Estrategia de Adaptación",
    optApplied: "Optimizaciones Clave Aplicadas:",
    findings: "Hallazgos de Auditoría",
    nuances: "Matices Culturales Detectados:",
    gaps: "Brechas Restantes:",
    waitingJD: "Esperando Datos del Aviso",
    waitingJDDesc: "La IA ajustará automáticamente tus logros y palabras clave para este puesto específico.",
    linkedInTitle: "LinkedIn Market Pulse",
    linkedInSubtitle: "Análisis de tendencias y marca personal",
    connectLinkedIn: "Conectando con Market Intelligence...",
    navHome: "Inicio / Carga",
    navResults: "Resultados",
    navTailor: "Calce con Vacante",
    navLinkedIn: "Tendencias LinkedIn",
    navGitHub: "GitHub Pulse",
    githubTitle: "GitHub Developer Pulse",
    githubSubtitle: "Análisis de impacto técnico y visibilidad",
    connectGitHub: "Sincronizando con GitHub Neural Core...",
    exportPng: "Exportar PNG",
    printPdf: "Imprimir PDF",
    aboutMe: "Acerca de (Extracto LinkedIn)",
    headlines: "Titulares sugeridos (Heads)",
    copy: "Copiar",
    copyAll: "Copiar Todos",
    chatTitle: "Consultor IA",
    chatPlaceholder: "Pregunta sobre los criterios del análisis...",
    chatWelcome: "Hola. He analizado tu perfil. ¿Tienes dudas sobre el puntaje, los criterios utilizados o detectaste algún error?",
    chatTyping: "Escribiendo...",
    globalScore: "Puntaje Global",
    sectionScore: "Desglose por Secciones",
    detectedSeniority: "Seniority Detectado",
    marketValue: "Valor de Mercado",
    salaryRange: "Rango Salarial Est.",
    careerPaths: "Rutas de Carrera & Brechas",
    learningPath: "Ruta de Aprendizaje Recomendada",
    topSkills: "Fortalezas Clave (Top Skills)",
    neuralReport: "Reporte Neural ATS",
    neuralAnalysis: "Análisis Contextual v4.2",
    strategicSummary: "Resumen Estratégico",
    optSuggestions: "Sugerencias de Optimización",
    critIssues: "Puntos Críticos Detectados",
    dimensionalFit: "Calce Dimensional con Mercados",
    atsScore: "Puntaje ATS",
    context: "Contexto",
    impact: "Impacto",
    estimatedSuccess: "Éxito Laboral Estimado",
    projectedImpact: "Impacto Proyectado",
    exportWord: "Exportar Word",
    highImpact: "Sugerencia de Headline de Alto Impacto",
    networkingStrategy: "Estrategia de Networking",
    contentIdeas: "Ideas para Contenido",
    trendingSkills: "Habilidades en Tendencia",
    marketPulse: "Pulso del Mercado"
  },
  en: {
    heroTitle: "Ready to Stand Out?",
    heroSubtitle: "GPT-4o Neural Engine v4.2",
    placeholder: "Type or paste your CV here...",
    uploadTitle: "Upload your CV (PDF, DOCX, TXT)",
    uploadDesc: "Drag & drop your file here or click to browse",
    fileProcessing: "Reading and cleaning file...",
    startBtn: "Start Neural Analysis",
    analyzing: "Processing Profile...",
    syncing: "Syncing with Vacancy...",
    successAnalysis: "Analysis Completed Successfully!",
    successTailor: "CV Strategically Adapted!",
    resultsTitle: "Vocational Report & Optimization",
    resultsSubtitle: "Career diagnosis and market projection",
    emptyResultsTitle: "No results available yet",
    emptyResultsDesc: "To generate the Vocational Report and Optimized CV, we first need to process your professional information.",
    goToUpload: "Go to Upload CV",
    optimizedReady: "Optimized Version Ready",
    optimizedDesc: "The score will improve dramatically if you validate this version.",
    validateBtn: "Validate Improvement (Re-analyze)",
    tailorBtn: "Tailor CV",
    aiProjection: "AI Career Projection",
    topRoles: "Top 5 Suggested Compatible Roles",
    match: "Match",
    suggestion: "Suggestion",
    tailorTitle: "Strategic Adaptation",
    tailorSubtitle: "Alignment with specific job description",
    tailorEmptyTitle: "Missing Base Optimized CV",
    tailorEmptyDesc: "To tailor your CV to a specific offer, we first need to analyze and optimize your base profile.",
    jdPlaceholder: "Paste the job advertisement or description here...",
    syncBtn: "Sync CV with this Vacancy",
    auditTitle: "Neural Audit (Post-Optimization)",
    finalMatch: "Verified Final Match",
    culturalFit: "Cultural Fit",
    strategyTitle: "Adaptation Strategy",
    optApplied: "Key Optimizations Applied:",
    findings: "Audit Findings",
    nuances: "Cultural Nuances Detected:",
    gaps: "Remaining Gaps:",
    waitingJD: "Waiting for Job Data",
    waitingJDDesc: "AI will automatically adjust your achievements and keywords for this specific role.",
    linkedInTitle: "LinkedIn Market Pulse",
    linkedInSubtitle: "Trend analysis and personal branding",
    connectLinkedIn: "Connecting with Market Intelligence...",
    navHome: "Home / Upload",
    navResults: "Results",
    navTailor: "Job Fit",
    navLinkedIn: "LinkedIn Trends",
    navGitHub: "GitHub Pulse",
    githubTitle: "GitHub Developer Pulse",
    githubSubtitle: "Technical impact and visibility analysis",
    connectGitHub: "Syncing with GitHub Neural Core...",
    exportPng: "Export PNG",
    printPdf: "Print PDF",
    aboutMe: "About (LinkedIn Summary)",
    headlines: "Suggested Headlines (Heads)",
    copy: "Copy",
    copyAll: "Copy All",
    chatTitle: "AI Consultant",
    chatPlaceholder: "Ask about analysis criteria...",
    chatWelcome: "Hello. I've analyzed your profile. Do you have questions about the score, criteria used, or errors detected?",
    chatTyping: "Typing...",
    globalScore: "Global Score",
    sectionScore: "Section Breakdown",
    detectedSeniority: "Detected Seniority",
    marketValue: "Market Value",
    salaryRange: "Est. Salary Range",
    careerPaths: "Career Paths & Gaps",
    learningPath: "Recommended Learning Path",
    topSkills: "Top Skills",
    neuralReport: "Neural ATS Report",
    neuralAnalysis: "Contextual Analysis v4.2",
    strategicSummary: "Strategic Summary",
    optSuggestions: "Optimization Suggestions",
    critIssues: "Critical Issues Detected",
    dimensionalFit: "Dimensional Market Fit",
    atsScore: "ATS Score",
    context: "Context",
    impact: "Impact",
    estimatedSuccess: "Estimated Career Success",
    projectedImpact: "Projected Impact",
    exportWord: "Export Word",
    highImpact: "High Impact Headline Suggestion",
    networkingStrategy: "Networking Strategy",
    contentIdeas: "Content Ideas",
    trendingSkills: "Trending Skills",
    marketPulse: "Market Pulse"
  }
};

export const getAtsSystemInstruction = (lang: Language) => `
Act as a Senior Talent Auditor and Neural ATS Algorithm.

LANGUAGE CONSTRAINT: ALL OUTPUT MUST BE IN ${lang === 'es' ? 'SPANISH' : 'ENGLISH'}.

OBJECTIVE: Critically evaluate the CV.
SCORING CONSISTENCY RULES (DETERMINISTIC RUBRIC):
You must adhere to this STRICT scoring logic to ensure the same CV gets the same score every time.

1. **Overall Score Calculation**:
   - Start with 100 points.
   - Deduct 10 points if no "Summary" or "Profile" section.
   - Deduct 15 points if work experience lacks quantifiable metrics (numbers, %, $).
   - Deduct 10 points if contact info is missing (email/phone).
   - Deduct 20 points if skills are just a generic list without context.
   - Deduct 10 points for formatting errors or huge text blocks.
   - If the CV is very short (<150 words), max score is 40.

2. **Section Scoring (0-100)**:
   - **Experience**: 90+ requires strict STAR method + Metrics. 60-80 for good descriptions without numbers. <50 for generic task lists.
   - **Education**: 100 for relevant degrees. 
   - **Hard Skills**: 90+ for modern tech stack relevant to the role.

3. **Vocational Profile**: Estimate Seniority and Market Value based on 2024 standards.
4. **Top 5 Roles**: Suggest specific roles based on skills.

Output: Strict JSON matching 'ATSAnalysis' schema.
`;

export const getOptimizerSystemInstruction = (lang: Language) => `
You are a Senior Headhunter and Neural ATS Optimization Expert.
LANGUAGE CONSTRAINT: ALL OUTPUT MUST BE IN ${lang === 'es' ? 'SPANISH' : 'ENGLISH'}.

TASK: Rewrite the CV to ensure it achieves a score >90 upon re-analysis.
MANDATORY TECHNIQUES:
1. **Google's XYZ Method**: "Accomplished [X] as measured by [Y], by doing [Z]".
2. **Keyword Density**: Integrate technical terms naturally into sentences.
3. **Power Verbs**: Use "Spearheaded", "Architected", "Optimized".
4. **Format**: Clean Markdown.

Output: Strict JSON { "markdownCV": string, "rationale": string }.
`;

export const getTailorSystemInstruction = (lang: Language) => `
You are a Career Architect. Synchronize the CV with the JD to 99%.
LANGUAGE CONSTRAINT: ALL OUTPUT MUST BE IN ${lang === 'es' ? 'SPANISH' : 'ENGLISH'}.
Output: Strict JSON 'TailoredResult'.
`;

export const getVerificationSystemInstruction = (lang: Language) => `
Act as a Hiring Manager. Audit the CV vs JD fit.
LANGUAGE CONSTRAINT: ALL OUTPUT MUST BE IN ${lang === 'es' ? 'SPANISH' : 'ENGLISH'}.
Output: Strict JSON 'MatchVerification'.
`;

export const getLinkedInSystemInstruction = (lang: Language) => `
Act as a Personal Brand Strategist and LinkedIn Data Analyst.
LANGUAGE CONSTRAINT: ALL OUTPUT MUST BE IN ${lang === 'es' ? 'SPANISH' : 'ENGLISH'}.

Generate a "LinkedIn Market Pulse" report:
1. **suggestedHeadlines**: A list of exactly 5 headlines (heads) that appear under the name. Use formulas like: [Role] | [Impact/Key Achievement] | [Top Tech Stack].
2. **aboutSection**: A compelling 3-paragraph "About" section for the profile. 
   - Para 1: Hook and value proposition.
   - Para 2: Core expertise and highlights.
   - Para 3: Call to action or core purpose.
3. **trendingKeywords**: What recruiters search for TODAY in this niche.
4. **hiringTrends**: Simulated market data.
5. **contentIdeas**: Post ideas.
6. **headlineSuggestion**: The single best one from the list.

Output: Strict JSON 'LinkedInInsight'.
`;

export const getChatSystemInstruction = (lang: Language) => `
You are an AI Career Consultant and ATS Auditor.
LANGUAGE CONSTRAINT: ALL OUTPUT MUST BE IN ${lang === 'es' ? 'SPANISH' : 'ENGLISH'}.

Your Role:
1. Explain the "Results" and "Scores" generated by the previous analysis.
2. Defend the criteria used (e.g., "I penalized the experience section because it lacked metrics").
3. Clarify specific terms (e.g., "What is a Neural ATS?").
4. If the user points out an error, acknowledge it and explain how the algorithm might have misinterpreted it.
5. Be professional, objective, and helpful. Use the provided Context Data to answer.

Context Data provided in the prompt includes the CV, the Analysis Report, and potentially the Job Description. Use this to be specific.
`;

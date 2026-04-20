export enum AppState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  CLIENTS = 'CLIENTS',
  CLIENT_DETAIL = 'CLIENT_DETAIL',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS'
}

export type Language = 'es' | 'en';

export type SeniorityLevel = 'Junior' | 'Professional' | 'Lead' | 'Manager' | 'Director' | 'VP' | 'C-Level';

export interface Client {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  targetRole: string;
  targetIndustry: string;
  targetCountry: string;
  targetSeniority: SeniorityLevel;
  notes?: string;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
}

export interface Resume {
  id: string;
  clientId: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt';
  rawText: string;
  parsedJson: any;
  language: Language;
  versionName: string;
  ownerId: string;
  createdAt: any;
}

export interface JobDescription {
  id: string;
  clientId: string;
  title: string;
  companyName: string;
  rawText: string;
  parsedJson: any;
  language: Language;
  ownerId: string;
  createdAt: any;
}

export interface ExecutiveScores {
  parsing: number;
  ats: number;
  executive: number;
  achievements: number;
  clarity: number;
  keywords: number;
  consistency: number;
  personalization: number;
  overall: number;
}

export interface AnalysisAlert {
  level: 'Critical' | 'Warning' | 'Info';
  text: string;
  explanation: string;
  recommendation: string;
}

export interface CareerRecommendation {
  section: string;
  title: string;
  why: string;
  impact: string;
  scoreImprovement: string;
  rewriteExample: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface MarketPulse {
  alternativeRoles: string[];
  trendingKeywords: string[];
  hardSkills: string[];
  softSkills: string[];
  demandLevel: string;
  typicalSalaryRange?: string;
  bridgeIndustries: string[];
}

export interface LinkedInPulse {
  score: number;
  diagnosis: {
    headline: string;
    about: string;
    experience: string;
    skills: string;
  };
  headlineSuggestions: string[];
  aboutRewrite: string;
  topKeywords: string[];
  gaps: string[];
  priorityActions: string[];
}

export interface SuggestedRole {
  role: string;
  fitPercentage: number;
  fitReason: string;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

export interface CareerOrientation {
  roles: SuggestedRole[];
}

export interface CareerMap {
  currentIdentity: string;
  nextSteps: string[];
  stretchRoles: string[];
  pivotRoles: string[];
  consultingOptions: string[];
  timeline: {
    year1: string;
    year3: string;
    year5: string;
  };
  blockers: string[];
  skillGaps: string[];
  narrativeAdvice: string;
}

export interface ImprovedResume {
  originalText: string;
  recommendedChange: string;
  rewrittenText: string;
}

export interface Analysis {
  id: string;
  clientId: string;
  resumeId: string;
  jobDescriptionId?: string | null;
  analysisName: string;
  scores: ExecutiveScores;
  strengths: string[];
  gaps: string[];
  alerts: AnalysisAlert[];
  recommendations: CareerRecommendation[];
  marketPulse?: MarketPulse;
  linkedInPulse?: LinkedInPulse;
  careerOrientation?: CareerOrientation;
  careerMap?: CareerMap;
  improvedCV?: {
    sections: ImprovedResume[];
    fullATS: string;
    fullExecutive: string;
  };
  ownerId: string;
  createdAt: any;
}

export interface GeneratedOutput {
  id: string;
  analysisId: string;
  outputType: 'ATS_OPTIMIZED' | 'TAILOR_MADE';
  contentJson: any;
  markdown: string;
  createdAt: any;
}

// Previous legacy support
export interface CareerMatch {
  role: string;
  industry: string;
  matchPercentage: number;
  gapAnalysis: string;
}

export interface SectionScore {
  category: string;
  score: number;
  feedback: string;
  status: 'Critical' | 'Improvement' | 'Good' | 'Excellent';
}

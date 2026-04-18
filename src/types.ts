export enum AppState {
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  TAILORING = 'TAILORING',
  LINKEDIN = 'LINKEDIN',
  GITHUB = 'GITHUB'
}

export type Language = 'es' | 'en';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

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

export interface VocationalProfile {
  estimatedSeniority: string;
  marketValueScore: number;
  salaryRangeEstimation: string;
  recommendedLearningPath: string[];
  topStrengths: string[];
}

export interface ATSAnalysis {
  overallScore: number;
  sectionBreakdown: SectionScore[];
  vocationalProfile: VocationalProfile;
  keywordMatch?: number;
  impactScore: number;
  contextualMatch: number;
  successPrediction: number;
  culturalFit: number;
  performanceEstimate: string;
  foundKeywords: string[];
  missingKeywords: string[];
  criticalIssues: string[];
  improvementSuggestions: string[];
  careerMatches: CareerMatch[];
  summary: string;
}

export interface OptimizationResult {
  markdownCV: string;
  rationale: string;
}

export interface MatchVerification {
  finalMatchScore: number;
  culturalFitScore: number;
  hardSkillsMatch: number;
  softSkillsMatch: number;
  gapAnalysis: string[];
  culturalNuancesDetected: string[];
  hiringManagerVerdict: string;
}

export interface TailoredResult {
  markdownCV: string;
  matchScore: number;
  successPrediction: number;
  culturalAlignment: string;
  changesMade: string[];
  analysis: string;
  verification?: MatchVerification;
}

export interface LinkedInInsight {
  headlineSuggestion: string;
  suggestedHeadlines: string[];
  aboutSection: string;
  trendingKeywords: string[];
  hiringTrends: string;
  suggestedConnections: string[];
  contentIdeas: string[];
  skillGapsForMarket: string[];
  viralPotentialScore: number;
}

export interface GitHubInsight {
  suggestedBio: string;
  topRepoIdeas: string[];
  readmeStructure: string;
  contributionStrategy: string;
  techKeywords: string[];
  ossRecs: string[];
  devPulseScore: number;
}

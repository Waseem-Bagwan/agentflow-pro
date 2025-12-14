export interface PRAnalysisRequest {
  prUrl: string;
}

export interface PRAnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

export interface AnalysisResult {
  title?: string;
  summary: string;
  filesGrouped: {
    code: string[];
    tests: string[];
    docs: string[];
  };
  risks: string[];
  checklist: string[];
  shouldMerge: boolean;
  explanation: string;
  lintSummary: string;
  mode?: 'demo' | 'live' | 'fallback';
  source?: 'kestra' | 'demo' | 'direct';
  note?: string;
  metadata?: {
    prNumber: number;
    repository: string;
    author: string;
    filesChanged: number;
    additions: number;
    deletions: number;
  };
}

export interface GitHubPR {
  number: number;
  title: string;
  body: string;
  diff_url: string;
  html_url: string;
  user: {
    login: string;
  };
  head: {
    ref: string;
  };
  base: {
    ref: string;
  };
}

export interface KestraExecutionResponse {
  id: string;
  state: {
    current: string;
  };
  outputs: {
    summary?: string;
    risks?: string[];
    shouldMerge?: boolean;
    explanation?: string;
    checklist?: string[];
    filesGrouped?: {
      code?: string[];
      tests?: string[];
      docs?: string[];
    };
    lintSummary?: string;
  };
}
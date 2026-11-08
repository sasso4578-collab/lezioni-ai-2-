export interface TranscriptChunkSegment {
  startMs: number;
  endMs: number;
  text: string;
}

export interface TranscriptDocument {
  id: string;
  recordingId: string;
  text: string;
  segments: TranscriptChunkSegment[];
  language: string;
  model: string;
  createdAt: number;
  updatedAt: number;
  source: 'local-runtime' | 'manual' | 'imported';
}

export interface HandoutDocument {
  id: string;
  recordingId: string;
  title: string;
  content: string;
  chapters: string[];
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'review' | 'final';
}

export interface RevisionFeedback {
  id: string;
  recordingId: string;
  summary: string;
  missingTopics: string[];
  warnings: string[];
  createdAt: number;
}

export interface FinalComparisonResult {
  id: string;
  recordingId: string;
  transcriptCoverage: number;
  missingTopics: string[];
  hallucinationWarnings: string[];
  createdAt: number;
}

export interface TranscriptionRequest {
  recordingId: string;
  audioChunks: AsyncIterable<Blob>;
  language?: string;
}

export interface TranscriptionResult {
  text: string;
  segments: Array<{ startMs: number; endMs: number; text: string }>;
}

/** Implemented adapters must document runtime, privacy, licensing and device requirements. */
export interface TranscriptionAdapter {
  readonly id: string;
  readonly label: string;
  isAvailable(): Promise<boolean>;
  transcribe(request: TranscriptionRequest, onProgress: (progress: number) => void): Promise<TranscriptionResult>;
}

export interface StudyMaterialAdapter {
  readonly id: string;
  readonly label: string;
  isAvailable(): Promise<boolean>;
  createHandout(transcript: string): Promise<string>;
}

// No AI engine is bundled or implied in Phase 1. Safari/iOS needs a separately validated runtime/bridge or remote service.

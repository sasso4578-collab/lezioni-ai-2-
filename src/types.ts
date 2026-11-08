export type JobState = 'queued' | 'importing' | 'ready' | 'processing' | 'completed' | 'failed';

export type RecordingRecord = {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  status: JobState;
  durationMs: number | null;
  createdAt: number;
  updatedAt: number;
  subject: string;
  folder: string;
  notes: string;
};

export type JobRecord = {
  id: string;
  recordingId: string;
  status: JobState;
  progress: number;
  message: string;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
};

export type AudioChunkRecord = {
  id: string;
  recordingId: string;
  chunkIndex: number;
  blob: Blob;
  createdAt: number;
};

export type NoteRecord = {
  id: string;
  recordingId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

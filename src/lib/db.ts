import Dexie, { type Table } from 'dexie';

export type RecordingStatus = 'importing' | 'interrupted' | 'ready' | 'failed';
export type JobStatus = RecordingStatus;

export interface Recording {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  lastModified: number;
  importedBytes: number;
  totalChunks: number;
  status: RecordingStatus;
  createdAt: number;
  updatedAt: number;
  subject: string;
  folder: string;
  error?: string;
}

export interface ImportJob {
  id: string;
  recordingId: string;
  status: JobStatus;
  progress: number;
  message: string;
  createdAt: number;
  updatedAt: number;
}

export interface AudioChunk {
  id: string;
  recordingId: string;
  index: number;
  blob: Blob;
}

class LocalDatabase extends Dexie {
  recordings!: Table<Recording, string>;
  jobs!: Table<ImportJob, string>;
  chunks!: Table<AudioChunk, string>;

  constructor() {
    super('lezioni-ai-local');
    this.version(1).stores({
      recordings: '&id, status, createdAt, updatedAt',
      jobs: '&id, recordingId, status, updatedAt',
      chunks: '&id, recordingId, index'
    });
  }
}

export const db = new LocalDatabase();
export const AUDIO_CHUNK_BYTES = 4 * 1024 * 1024;

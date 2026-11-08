import Dexie, { Table } from 'dexie';

import type { AudioChunkRecord, JobRecord, NoteRecord, RecordingRecord } from '../types';

class LezioniAIDatabase extends Dexie {
  recordings!: Table<RecordingRecord, string>;
  jobs!: Table<JobRecord, string>;
  audioChunks!: Table<AudioChunkRecord, string>;
  notes!: Table<NoteRecord, string>;

  constructor() {
    super('lezioni-ai-db');

    this.version(1).stores({
      recordings: '&id, status, createdAt, updatedAt',
      jobs: '&id, recordingId, status, progress, updatedAt',
      audioChunks: '&id, recordingId, chunkIndex, createdAt',
      notes: '&id, recordingId, createdAt, updatedAt'
    });
  }
}

export const db = new LezioniAIDatabase();
export const chunkSizeBytes = 5 * 1024 * 1024;

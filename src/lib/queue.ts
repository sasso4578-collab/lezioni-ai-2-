import type { RecordingRecord } from '../types';
import { chunkSizeBytes, db } from './db';

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatDuration(durationMs: number | null | undefined): string {
  if (!durationMs || durationMs <= 0) return 'N/D';
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'recording';
}

export function getAllowedAudioExtensions(): string[] {
  return ['.m4a', '.mp3', '.wav', '.aac', '.m4b'];
}

export function isAllowedAudioFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  const acceptedMimeTypes = [
    'audio/mpeg',
    'audio/mp4',
    'audio/x-m4a',
    'audio/wav',
    'audio/aac',
    'audio/x-aac',
    'audio/x-wav',
    'audio/mp3'
  ];

  const extensionMatch = getAllowedAudioExtensions().some((ext) => fileName.endsWith(ext));
  const mimeMatch = acceptedMimeTypes.includes(file.type.toLowerCase());

  return extensionMatch || mimeMatch;
}

export async function fetchRecordingBlob(recordingId: string): Promise<Blob | null> {
  const chunks = await db.audioChunks.where('recordingId').equals(recordingId).sortBy('chunkIndex');
  if (!chunks.length) return null;
  const parts = chunks.map((chunk) => chunk.blob);
  return new Blob(parts, { type: 'audio/mpeg' });
}

export async function storeAudioAsChunks(recordingId: string, file: File): Promise<number> {
  const totalChunks = Math.ceil(file.size / chunkSizeBytes);
  await db.audioChunks.where('recordingId').equals(recordingId).delete();

  for (let index = 0; index < totalChunks; index += 1) {
    const start = index * chunkSizeBytes;
    const end = Math.min(start + chunkSizeBytes, file.size);
    const blobSlice = file.slice(start, end, file.type || 'audio/mpeg');
    const chunkId = `${recordingId}-${index}`;

    await db.audioChunks.put({
      id: chunkId,
      recordingId,
      chunkIndex: index,
      blob: blobSlice,
      createdAt: Date.now()
    });
  }

  return totalChunks;
}

export async function createRecording(file: File, subject = 'Generica', folder = 'Archivio'): Promise<RecordingRecord> {
  const recordingId = crypto.randomUUID();
  const savedAt = Date.now();

  const record: RecordingRecord = {
    id: recordingId,
    name: sanitizeFileName(file.name),
    originalName: file.name,
    mimeType: file.type || 'audio/mpeg',
    extension: file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '.audio',
    sizeBytes: file.size,
    status: 'queued',
    durationMs: null,
    createdAt: savedAt,
    updatedAt: savedAt,
    subject,
    folder,
    notes: ''
  };

  await db.recordings.put(record);
  await storeAudioAsChunks(recordingId, file);

  return record;
}

export async function getAllRecordings(): Promise<RecordingRecord[]> {
  return db.recordings.orderBy('createdAt').reverse().toArray();
}

export async function updateRecording(recordingId: string, updates: Partial<RecordingRecord>): Promise<void> {
  const current = await db.recordings.get(recordingId);
  if (!current) return;
  await db.recordings.update(recordingId, { ...updates, updatedAt: Date.now() });
}

export async function deleteRecording(recordingId: string): Promise<void> {
  await db.audioChunks.where('recordingId').equals(recordingId).delete();
  await db.jobs.where('recordingId').equals(recordingId).delete();
  await db.notes.where('recordingId').equals(recordingId).delete();
  await db.recordings.delete(recordingId);
}

export async function exportRecording(recordingId: string): Promise<void> {
  const blob = await fetchRecordingBlob(recordingId);
  const recording = await db.recordings.get(recordingId);

  if (!blob || !recording) {
    throw new Error('Registrazione non disponibile per l\'esportazione.');
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${recording.name}${recording.extension}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

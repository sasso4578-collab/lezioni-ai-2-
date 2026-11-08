import { AUDIO_CHUNK_BYTES, db, type ImportJob, type Recording } from './db';

const extensions = new Set(['.m4a', '.mp3', '.wav']);

export function isSupportedAudio(file: File): boolean {
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? '';
  return extensions.has(ext) || ['audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/x-wav'].includes(file.type.toLowerCase());
}

export function displayBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** power).toFixed(power ? 1 : 0)} ${units[power]}`;
}

export async function estimateStorage() {
  try {
    const [estimate, persisted] = await Promise.all([
      navigator.storage?.estimate?.(),
      navigator.storage?.persisted?.()
    ]);
    return { usage: estimate?.usage ?? 0, quota: estimate?.quota ?? null, persisted: persisted ?? false };
  } catch {
    return { usage: 0, quota: null, persisted: false };
  }
}

export async function initializeImport(file: File): Promise<{ recording: Recording; job: ImportJob }> {
  if (!isSupportedAudio(file)) throw new Error('Formato non supportato. Seleziona un file M4A, MP3 o WAV.');
  if (!file.size) throw new Error('Il file è vuoto.');

  const now = Date.now();
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? '';
  const recording: Recording = {
    id: crypto.randomUUID(), name: file.name.replace(/\.[^.]+$/, ''), originalName: file.name,
    mimeType: file.type || 'application/octet-stream', extension: ext, sizeBytes: file.size,
    lastModified: file.lastModified, importedBytes: 0,
    totalChunks: Math.ceil(file.size / AUDIO_CHUNK_BYTES), status: 'importing',
    createdAt: now, updatedAt: now, subject: 'Generica', folder: 'Archivio'
  };
  const job: ImportJob = {
    id: crypto.randomUUID(), recordingId: recording.id, status: 'importing', progress: 0,
    message: 'Salvataggio locale in corso', createdAt: now, updatedAt: now
  };
  await db.transaction('rw', db.recordings, db.jobs, async () => {
    await db.recordings.add(recording);
    await db.jobs.add(job);
  });
  return { recording, job };
}

export async function importFileChunks(recording: Recording, job: ImportJob, file: File,
  onProgress: (record: Recording, currentJob: ImportJob) => void): Promise<void> {
  if (file.size !== recording.sizeBytes || file.name !== recording.originalName || file.lastModified !== recording.lastModified) {
    throw new Error('Il file selezionato non corrisponde alla registrazione da riprendere.');
  }
  for (let index = 0; index < recording.totalChunks; index += 1) {
    const chunkId = `${recording.id}:${index}`;
    if (await db.chunks.get(chunkId)) continue;
    const start = index * AUDIO_CHUNK_BYTES;
    const blob = file.slice(start, Math.min(start + AUDIO_CHUNK_BYTES, file.size), recording.mimeType);
    await db.chunks.add({ id: chunkId, recordingId: recording.id, index, blob });
    recording.importedBytes = Math.min(start + blob.size, file.size);
    recording.updatedAt = Date.now();
    const progress = Math.floor((recording.importedBytes / recording.sizeBytes) * 100);
    job.progress = progress;
    job.updatedAt = recording.updatedAt;
    job.message = `Archiviazione locale: ${progress}% (${displayBytes(recording.importedBytes)} / ${displayBytes(recording.sizeBytes)})`;
    await db.transaction('rw', db.recordings, db.jobs, async () => {
      await db.recordings.put(recording);
      await db.jobs.put(job);
    });
    onProgress({ ...recording }, { ...job });
  }
  const storedCount = await db.chunks.where('recordingId').equals(recording.id).count();
  if (storedCount !== recording.totalChunks) throw new Error('Verifica dei blocchi incompleta; è possibile riprendere l’importazione.');
  recording.importedBytes = recording.sizeBytes;
  recording.status = 'ready';
  recording.updatedAt = Date.now();
  job.status = 'ready';
  job.progress = 100;
  job.message = 'Audio archiviato in questo dispositivo';
  job.updatedAt = recording.updatedAt;
  await db.transaction('rw', db.recordings, db.jobs, async () => {
    await db.recordings.put(recording);
    await db.jobs.put(job);
  });
  onProgress({ ...recording }, { ...job });
}

export async function markImportsInterrupted(): Promise<void> {
  const active = await db.recordings.where('status').equals('importing').toArray();
  for (const recording of active) {
    recording.status = 'interrupted';
    recording.updatedAt = Date.now();
    await db.recordings.put(recording);
    const job = await db.jobs.where('recordingId').equals(recording.id).first();
    if (job) {
      job.status = 'interrupted';
      job.message = 'Interrotto: seleziona di nuovo il file originale per riprendere';
      job.updatedAt = Date.now();
      await db.jobs.put(job);
    }
  }
}

export async function exportAudio(recording: Recording): Promise<void> {
  const chunks = await db.chunks.where('recordingId').equals(recording.id).sortBy('index');
  if (chunks.length !== recording.totalChunks) throw new Error('Audio incompleto: esportazione non disponibile.');
  const url = URL.createObjectURL(new Blob(chunks.map((chunk) => chunk.blob), { type: recording.mimeType }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${recording.name}${recording.extension}`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function deleteAudio(recordingId: string): Promise<void> {
  await db.transaction('rw', db.recordings, db.jobs, db.chunks, async () => {
    await db.chunks.where('recordingId').equals(recordingId).delete();
    await db.jobs.where('recordingId').equals(recordingId).delete();
    await db.recordings.delete(recordingId);
  });
}

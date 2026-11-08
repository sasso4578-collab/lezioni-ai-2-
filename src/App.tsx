import React, { useEffect, useRef, useState } from 'react';
import { db, type ImportJob, type Recording } from './lib/db';
import { deleteAudio, displayBytes, estimateStorage, exportAudio, importFileChunks, initializeImport, isSupportedAudio, markImportsInterrupted } from './lib/audio';
import { RuntimeStatusCard } from './components/RuntimeStatusCard';

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [notice, setNotice] = useState('');
  const [storage, setStorage] = useState<{ usage: number; quota: number | null; persisted: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setRecordings(await db.recordings.orderBy('createdAt').reverse().toArray());
    setJobs(await db.jobs.orderBy('updatedAt').reverse().toArray());
    setStorage(await estimateStorage());
  };

  useEffect(() => {
    void (async () => { await markImportsInterrupted(); await refresh(); })();
  }, []);

  const updateUi = (record: Recording, job: ImportJob) => {
    setRecordings((current) => [record, ...current.filter((item) => item.id !== record.id)]);
    setJobs((current) => [job, ...current.filter((item) => item.id !== job.id)]);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setNotice('');
    try {
      for (const file of Array.from(files)) {
        if (!isSupportedAudio(file)) {
          setNotice(`${file.name}: formato non supportato (M4A, MP3, WAV).`);
          continue;
        }

        const existing = await db.recordings.toArray();
        let recording = existing.find((item) => item.originalName === file.name && item.sizeBytes === file.size && item.lastModified === file.lastModified && item.status === 'interrupted');
        let job: ImportJob | undefined;

        if (recording) {
          job = await db.jobs.where('recordingId').equals(recording.id).first();
          if (!job) throw new Error('Stato del lavoro non trovato.');
          recording.status = 'importing';
          job.status = 'importing';
          job.message = 'Ripresa importazione';
          await db.recordings.put(recording);
          await db.jobs.put(job);
        } else {
          const created = await initializeImport(file);
          recording = created.recording;
          job = created.job;
        }

        await importFileChunks(recording, job, file, updateUi);
      }

      setNotice('Importazione completata. I file restano sul dispositivo e non vengono caricati su server.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante l’importazione.';
      setNotice(`${message} I blocchi già salvati sono conservati; puoi selezionare di nuovo il file per riprendere.`);
      await refresh();
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
      await refresh();
    }
  };

  const remove = async (record: Recording) => {
    if (!window.confirm(`Eliminare definitivamente “${record.originalName}” da questo dispositivo?`)) return;
    await deleteAudio(record.id);
    await refresh();
  };

  const save = async (record: Recording) => {
    try {
      await exportAudio(record);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Esportazione non riuscita.');
    }
  };

  const percent = (record: Recording) => Math.min(100, Math.floor(record.sizeBytes ? (record.importedBytes / record.sizeBytes) * 100 : 0));

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">L</div>
          <div>
            <span className="kicker">STUDIO LOCALE</span>
            <h1>Lezioni AI</h1>
          </div>
        </div>
        <span className="privacy">● Solo su questo dispositivo</span>
      </header>

      <main>
        <section className="intro">
          <div>
            <span className="kicker">FASE 1 · ARCHIVIO AUDIO</span>
            <h2>Le tue lezioni,<br /><em>al sicuro in locale.</em></h2>
            <p>Importa M4A, MP3 e WAV. Nessun audio viene inviato a servizi esterni.</p>
          </div>
          <div className="intro-mark" aria-hidden="true">♫</div>
        </section>

        <section className="summary">
          <article><span>Registrazioni</span><strong>{recordings.length}</strong></article>
          <article><span>Archiviate</span><strong>{recordings.filter((r) => r.status === 'ready').length}</strong></article>
          <article><span>Da riprendere</span><strong>{recordings.filter((r) => r.status === 'interrupted' || r.status === 'failed').length}</strong></article>
        </section>

        <section className="panel import-panel">
          <div className="section-heading">
            <div>
              <span className="kicker">IMPORTA</span>
              <h2>Aggiungi registrazione</h2>
            </div>
            <span className="format-pill">M4A · MP3 · WAV</span>
          </div>

          <input
            ref={inputRef}
            className="file-input"
            type="file"
            accept=".m4a,.mp3,.wav,audio/mp4,audio/mpeg,audio/wav"
            multiple
            onChange={(event) => void handleFiles(event.target.files)}
          />

          <button className="import-button" type="button" disabled={busy} onClick={() => inputRef.current?.click()}>
            <span>{busy ? '◌' : '+'}</span>
            {busy ? 'Salvataggio in corso…' : 'Scegli file audio'}
          </button>

          <p className="hint">
            Anche file superiori a 100 MB: vengono archiviati a blocchi da 4 MB. Se il browser si chiude, seleziona di nuovo lo stesso file per riprendere i blocchi mancanti.
          </p>

          {storage && (
            <p className="storage-info">
              Spazio stimato usato: {displayBytes(storage.usage)}{storage.quota ? ` / ${displayBytes(storage.quota)}` : ''} · {storage.persisted ? 'archiviazione persistente concessa' : 'persistenza non garantita dal browser'}
            </p>
          )}
        </section>

        {notice && <div className="notice" role="status">{notice}</div>}

        <RuntimeStatusCard />

        <section className="archive-section">
          <div className="section-heading">
            <div>
              <span className="kicker">IL TUO DISPOSITIVO</span>
              <h2>Archivio e coda</h2>
            </div>
            <span className="count-pill">{recordings.length} file</span>
          </div>

          {!recordings.length ? (
            <div className="empty">
              <div>♫</div>
              <h3>Ancora nessuna lezione</h3>
              <p>I tuoi file appariranno qui dopo l’importazione.</p>
            </div>
          ) : (
            <div className="recording-list">
              {recordings.map((record) => {
                const job = jobs.find((item) => item.recordingId === record.id);
                const progress = percent(record);

                return (
                  <article className="recording" key={record.id}>
                    <div className="recording-head">
                      <div className="audio-icon">♫</div>
                      <div className="recording-title">
                        <h3>{record.name}</h3>
                        <p>{displayBytes(record.sizeBytes)} · {record.extension.toUpperCase().replace('.', '')}</p>
                      </div>
                      <span className={`status status-${record.status}`}>
                        {record.status === 'ready' ? 'Archiviato' : record.status === 'interrupted' ? 'Interrotto' : record.status === 'failed' ? 'Errore' : 'Importazione'}
                      </span>
                    </div>

                    <div className="progress-row">
                      <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
                      <small>{progress}%</small>
                    </div>

                    <p className="job-message">{job?.message ?? 'In attesa'}</p>

                    <div className="recording-actions">
                      {record.status !== 'ready' && <button onClick={() => inputRef.current?.click()} disabled={busy}>Seleziona file per riprendere</button>}
                      {record.status === 'ready' && <button onClick={() => void save(record)}>Esporta audio</button>}
                      <button className="delete-button" onClick={() => void remove(record)}>Elimina</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="panel note-panel">
          <span className="kicker">PROSSIMA FASE</span>
          <h2>AI non ancora attiva</h2>
          <p>Questa versione archivia audio localmente. Trascrizione e modelli AI non sono integrati; servirà un runtime esterno o un backend locale per completare la pipeline.</p>
        </section>
      </main>

      <footer>Lezioni AI · I dati salvati dal browser possono essere rimossi se cancelli i dati del sito. Esporta copie importanti.</footer>
    </div>
  );
}

export default App;

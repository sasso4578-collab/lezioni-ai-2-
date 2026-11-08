import React from 'react';

import type { RecordingRecord } from '../types';
import { formatBytes, formatDuration } from '../lib/db';

interface RecordingCardProps {
  recording: RecordingRecord;
  onDelete: (recordingId: string) => void;
  onExport: (recordingId: string) => void;
}

export function RecordingCard({ recording, onDelete, onExport }: RecordingCardProps) {
  return (
    <article className="recording-card">
      <div className="recording-card__header">
        <div>
          <h3>{recording.name}</h3>
          <p>{recording.subject} • {recording.folder}</p>
        </div>
        <span className={`tag tag--${recording.status}`}>{recording.status}</span>
      </div>

      <dl className="meta-grid">
        <div>
          <dt>Dimensione</dt>
          <dd>{formatBytes(recording.sizeBytes)}</dd>
        </div>
        <div>
          <dt>Durata</dt>
          <dd>{formatDuration(recording.durationMs)}</dd>
        </div>
        <div>
          <dt>Formato</dt>
          <dd>{recording.extension}</dd>
        </div>
      </dl>

      <div className="card-actions">
        <button type="button" onClick={() => onExport(recording.id)}>Esporta</button>
        <button type="button" className="danger" onClick={() => onDelete(recording.id)}>Elimina</button>
      </div>
    </article>
  );
}

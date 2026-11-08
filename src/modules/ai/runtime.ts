export type WhisperRuntimeKind = 'whisper.cpp' | 'faster-whisper' | 'none';

export interface WhisperRuntimeStatus {
  kind: WhisperRuntimeKind;
  available: boolean;
  message: string;
  recommendation: string;
}

export function getWhisperRuntimeStatus(): WhisperRuntimeStatus {
  const ua = navigator.userAgent;
  const isSafari = /Safari\//.test(ua) && !/Chrome|CriOS|Chromium|Edg\//.test(ua);

  if (isSafari) {
    return {
      kind: 'none',
      available: false,
      message: 'Safari/iOS non può eseguire nativamente Whisper.cpp o faster-whisper in-browser.',
      recommendation: 'Eseguire il runtime su un backend locale desktop o su una macchina dedicata; il browser non è il posto giusto per i binari nativi.'
    };
  }

  return {
    kind: 'none',
    available: false,
    message: 'Questo frontend non include un runtime AI. Il motore di trascrizione deve essere eseguito in un processo separato.',
    recommendation: 'Usare un adapter desktop o server locale con whisper.cpp o faster-whisper; il browser deve solo inviare il file e mostrare lo stato.'
  };
}

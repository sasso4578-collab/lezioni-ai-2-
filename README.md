# Lezioni AI — Fase 1

PWA React/TypeScript con archivio locale IndexedDB e importazione di file audio. Nessun account o servizio a pagamento è configurato; questa fase non trascrive audio.

## Avvio e build

```sh
npm install
npm run dev
npm run build
npm run preview
```

La PWA richiede HTTPS in produzione (localhost è consentito per sviluppo). Su iPhone/iPad aprire il sito in Safari e usare **Condividi → Aggiungi alla schermata Home**. L'installazione e il supporto ai formati dipendono da iOS/Safari.

## Funzioni presenti

- Interfaccia adattiva con tema scuro e manifest PWA/service worker generato da Vite.
- Import M4A, MP3 e WAV in blocchi da 4 MiB salvati in IndexedDB. Il progresso è aggiornato solo dopo la persistenza del blocco.
- Archivio locale, progresso persistente, esportazione e cancellazione dei blocchi.
- Verifica disponibilità/quota IndexedDB best-effort con `navigator.storage.estimate()` e richiesta/lettura della persistenza quando il browser la supporta.
- Ripresa di un'importazione interrotta selezionando di nuovo lo stesso file (nome, dimensione e `lastModified` devono coincidere); i blocchi già scritti vengono saltati.
- Contratti TypeScript per motori futuri; non esiste ancora un adapter AI eseguibile.

## Limiti reali

IndexedDB non dà una capacità fissa: quote e politiche di eviction dipendono dal browser e dallo spazio disponibile. La PWA mostra la stima del browser, ma non può garantire il salvataggio di ogni file da 100 MB o più; l'import può fallire per quota/storage. Su iOS la persistenza può non essere concessa e il sistema può rimuovere i dati del sito. Esportare una copia importante.

Se Safari viene chiuso durante l'import, l'import non prosegue in background. All'apertura successiva i chunk già persistiti restano; per riprendere occorre selezionare di nuovo il file originale. Questo evita di fingere che l'app possa riaprire automaticamente il file scelto dal picker.

La PWA offre cache offline dell'interfaccia, non esecuzione offline di Whisper/Ollama: tali runtime non sono integrati. Test fisici su iPhone/iPad e build/installazione dipendono da esecuzione CI o device; non vanno considerati verificati solo dal codice.

## Privacy

I blob audio sono salvati in IndexedDB del browser sul dispositivo. Nessun upload è implementato. Cancellare i dati del sito può cancellare anche l'archivio: esportare i file prima. Non committare file audio/dati personali.

## Fasi successive

Implementare e testare un adapter di trascrizione compatibile con il runtime scelto; poi dispensa, revisione, confronto e integrazioni. Non è stato simulato alcun risultato AI.

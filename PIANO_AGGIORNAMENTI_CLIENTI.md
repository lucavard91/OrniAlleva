# OrniAlleva Clienti — introduzione aggiornamenti (V30.99)

## Obiettivo
Partire dalla V30.99 funzionante. Portare nell'app Clienti (non in Sviluppo) il sistema di segnalazione nuove versioni già presente in V34.18.1 Sviluppo; in futuro distribuire versioni testate con Aggiorna ora / Più tardi, campanella, Informazioni app, conferma d'installazione.

## Stato verificato
- Clienti main: V30.99; NON contiene query ob_app_releases né il modulo di aggiornamento.
- Sviluppo main: V34.18.1; contiene query ob_app_releases e avvisi interni.
- La prima installazione del motore aggiornamenti richiede necessariamente una distribuzione iniziale del codice: V30.99 non può mostrare un pulsante che non contiene. Non simulare la sua presenza.
- L'app Clienti funziona di nuovo dopo il rollback; evitare la sostituzione massiva dell'index che aveva dato schermata bianca.

## Vincoli
1. Modifiche direttamente nei componenti e nelle funzioni originali index.html; niente CSS patch, stili sostitutivi, o doppie funzioni.
2. Stesso progetto Supabase produzione, senza modificare o migrare dati allevatori.
3. Verificare lato Supabase la lettura pubblica/autenticata del canale production in ob_app_releases, RLS e URL aggiornamento sullo stesso origin; non inventare release remote.
4. Aggiornamento facoltativo reale: non attivare automaticamente codice nuovo solo per la notifica; verificare anche install/activate service worker e cache; non chiamare skipWaiting in anticipo per update futuri.
5. Proteggere form aperti e dati locali; rinviare con badge della campanella; manuale da Impostazioni.
6. Primo test tecnico isolato e prova PWA con account test, poi pubblicazione su Clienti solo dopo collaudo.
7. Controllo sintassi di tutti gli script inline e delle dipendenze, più navigazione PWA su iPhone.

## File da esaminare e, se necessari, modificare
- index.html (interfaccia e logica del motore, versioni, impostazioni e notifiche)
- service-worker.js (strategia aggiornamento/installazione)
- manifest.webmanifest solo se necessario; mantenere identità PWA e scope

## Stato della preparazione
Questo file documenta il lavoro da fare; il ramo NON contiene ancora un sistema di aggiornamento funzionante e NON deve essere pubblicato come tale.

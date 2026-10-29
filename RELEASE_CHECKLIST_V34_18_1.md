# OrniAlleva - preparazione release V34.18.1
Stato: **CANDIDATA NON PUBBLICATA** - 29 ottobre 2026

## Verifiche effettuate
- Cliente V30.99 e Sviluppo V34.18.1 sono stati confrontati con i file caricati dall'utente. I SHA Git coincidono con il repository originale.
- Entrambi usano il progetto Supabase OrniAlleva principale (ref mddsmqwfufzebahemxcn). Nessuna migrazione del database.
- index.html predisposto con canale release **production** anziché development, versione 34.18.1.
- Riparate direttamente nel codice due righe JavaScript danneggiate (base64 inserito nei comandi dell'icona lingua).
- Tutti i 38 script JavaScript inline del file candidato superano node --check dopo la correzione.
- Copiati dal repository Sviluppo: admin.html, confirm.html, guest-local.js, guest-catalog.js, manifest.webmanifest.
- service-worker.js ha un identificatore cache di produzione dedicato; il codice della nuova cache legge solo i propri elementi, per evitare conflitti con la versione Sviluppo sullo stesso dominio.
- SHA Git del candidato index.html: 9897a0849e207ac3055244d1bf976b2c6283dabe.
- La main pubblica V30.99 e il progetto Supabase non sono stati modificati.

## Materiale ancora mancante sul ramo candidato
I file binari seguenti sono citati da index.html e sono presenti soltanto nel repository OrniAlleva-Sviluppo:
- **mostra_di_uccelli_ornamentali.png** (immagine della sezione Soggetti da mostra; SHA 6743fee4e10c41bc195afa9fa86ce745b8462c4d)
- **a_highly_detailed_photorealistic_illustrative_cir.png** (immagine della fase; SHA d26cbe2adf743386e3770a8dffc192dd12c27612)

Queste due immagini devono essere trasferite senza alterarle nella radice del repository pubblico **prima del merge**. Il collegamento GitHub disponibile non ha permesso di trasferire automaticamente i file binari grandi.

## Verifiche ancora necessarie
1. Confermare il valore effettivo dei record development e production in ob_app_releases, compresi active/version/update_url. Le interrogazioni dirette ai record sono state bloccate.
2. Verificare la lettura via RLS della tabella releases con utente autenticato, e l'accesso a ob_app_release_history.
3. Testare la PWA e il pulsante Aggiorna ora su una sessione di prova, incluse schede non salvate, refresh e modalità offline.
4. Confermare che localStorage, account, soggetti, coppie e foto persistano dopo aggiornamento; la sola ispezione del codice non garantisce i dati sul dispositivo.
5. Considerare che la V30.99 attuale non contiene il nuovo pulsante Aggiorna ora: la prima transizione avverrà all'apertura/ricarica online della PWA secondo il vecchio Service Worker.
6. Verificare funzionamento di admin, conferma email, modalità ospite e tutte le immagini.

**NON UNIRE il ramo in main, NON attivare il canale production e NON modificare Supabase prima del collaudo.**

# Yin-Panel Helper

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Deutsch](../de-DE/README.md) | [Français](../fr-FR/README.md) | [Español](../es-ES/README.md) | [Português (Brasil)](../pt-BR/README.md) | [Русский](../ru-RU/README.md) | [Bahasa Indonesia](../id-ID/README.md) | [Türkçe](../tr-TR/README.md) | [Polski](../pl-PL/README.md) | **Italiano** | [Nederlands](../nl-NL/README.md) | [हिन्दी](../hi-IN/README.md) | [ไทย](../th-TH/README.md)

Un'estensione Chrome Manifest V3 opzionale per Yin-Panel. Recupera i byte reali delle favicon dei siti per le importazioni di segnalibri quando le normali richieste del browser vengono bloccate da CORS, ripiega su servizi di favicon pubblici e aggiunge un reindirizzamento configurabile per la nuova scheda. Yin-Panel continua a funzionare anche senza di essa, usando i propri fallback lato server per le favicon e le icone di testo.

## Installazione

1. Apri `chrome://extensions`.
2. Abilita la modalità sviluppatore.
3. Scegli **Load unpacked** e seleziona questa directory.
4. Ricarica Yin-Panel prima di avviare un'importazione di segnalibri.

## Autorizzazioni

- `storage` — memorizza l'URL di destinazione della nuova scheda.
- `host_permissions: ["<all_urls>"]` — l'estensione richiede i dati delle favicon direttamente dai siti dei segnalibri.
- Non vengono richieste autorizzazioni per fotocamera, microfono, posizione, notifiche o dispositivi.

## Reindirizzamento della nuova scheda

`chrome_url_overrides` invia ogni nuova scheda a `newtab.html`, che reindirizza immediatamente alla destinazione memorizzata. Il valore predefinito è `https://panel.yiniot.com` e sono accettati solo URL `http` e `https`; i valori non validi o mancanti tornano al valore predefinito. Imposta la destinazione dal popup della barra degli strumenti o dalla pagina delle opzioni.

## Recupero delle favicon

- Lo script di contenuto risponde solo ai messaggi contrassegnati con `source: 'yin-panel'` e supporta i tipi di messaggio `ping` e `fetch-icons`.
- Per ogni pagina il service worker segue prima le dichiarazioni di icona del sito stesso (`rel="icon"`, `apple-touch-icon`, `mask-icon`), poi i percorsi comuni delle favicon nella radice.
- Quando questi falliscono, sonda i servizi pubblici di favicon, creando un pool di otto richieste per ogni servizio utilizzabile.
- Le ricerche non riuscite vengono restituite a Yin-Panel, che applica i propri fallback per le favicon e le icone di testo; l'estensione non genera un'icona di fallback separata.

## Lingue

L'interfaccia segue la lingua dell'interfaccia del browser. Le stringhe in inglese, cinese semplificato, cinese tradizionale, giapponese, coreano, tedesco, francese, spagnolo, portoghese brasiliano russo, indonesiano, turco, polacco, italiano, olandese, hindi e thailandese si trovano in `_locales/`; qualsiasi altra lingua del browser ricade sull'inglese. Il testo delle pagine dell'estensione viene risolto tramite `i18n.js` e non è mai codificato in modo fisso.

## Sviluppo

| File | Ruolo |
| --- | --- |
| `service-worker.js` | Messaggi dell'estensione, recupero delle favicon dei siti e fallback pubblici |
| `content-script.js` | Ponte di messaggi lato pagina usato da Yin-Panel |
| `config.js` | Normalizzazione dell'URL della nuova scheda e destinazione predefinita |
| `newtab.html`, `newtab.js` | Sostituzione della nuova scheda e reindirizzamento |
| `settings.html`, `settings.css`, `settings.js` | Pagina delle opzioni e popup della barra degli strumenti |
| `i18n.js`, `_locales/` | Helper condiviso per la localizzazione delle pagine e cataloghi di messaggi per lingua |
| `manifest.json` | Autorizzazioni, entrypoint, sostituzione della nuova scheda e registrazione dello script di contenuto |

Non c'è alcuna fase di build; ogni file viene caricato direttamente. Verifica il JavaScript e il manifest con:

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
node --check i18n.js
```

[AGENTS.md](../../AGENTS.md) documenta le invarianti di comportamento, la collocazione dei test e le regole di sicurezza. I test di accettazione a livello di browser si trovano nel [repository E2E](https://github.com/yinorg/yin-panel-e2e); il servizio Core si trova in [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel).

## Pubblicazione automatica nel Chrome Web Store

Il workflow in `.github/workflows/publish-chrome-web-store.yml` viene eseguito quando viene inviato un tag di release. Crea un pacchetto temporaneo, imposta la versione del manifest del pacchetto a partire dal tag, lo carica tramite Chrome Web Store API v2 e lo invia per la revisione.

Chrome accetta da uno a quattro segmenti di versione numerici separati da punti, quindi i tag devono avere un aspetto simile a `1.2.3` o `v1.2.3`. Il `v` iniziale facoltativo viene rimosso prima di scrivere la versione del manifest. Ogni segmento deve essere compreso tra `0` e `65535` e la versione deve essere maggiore di quella attualmente pubblicata.

### Configurazione iniziale

1. Abilita la Chrome Web Store API in un progetto Google Cloud.
2. Crea un account di servizio Google Cloud e aggiungi la sua email nelle impostazioni dell'account del Chrome Web Store Developer Dashboard. Vedi la [guida agli account di servizio del Chrome Web Store](https://developer.chrome.com/docs/webstore/service-accounts).
3. Configura la GitHub Actions Workload Identity Federation per questo repository. La [guida all'autenticazione di Google per GitHub Actions](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) descrive il pool, il provider e il binding IAM richiesti.
4. Aggiungi questi secret del repository:

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: il nome completo della risorsa del provider, ad esempio `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`.
   - `GCP_SERVICE_ACCOUNT`: l'email dell'account di servizio.
   - `CHROME_WEBSTORE_PUBLISHER_ID`: l'ID publisher dal Developer Dashboard.
   - `CHROME_WEBSTORE_EXTENSION_ID`: l'ID di 32 caratteri di questa estensione pubblicata.

Ad esempio, pubblica la versione `1.0.1` con:

```sh
git tag v1.0.1
git push origin v1.0.1
```

Il workflow invia la release automaticamente, ma la revisione del Chrome Web Store può ritardare il momento in cui la nuova versione diventa disponibile per gli utenti.

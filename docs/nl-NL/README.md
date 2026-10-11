# Yin-Panel Helper

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Deutsch](../de-DE/README.md) | [Français](../fr-FR/README.md) | [Español](../es-ES/README.md) | [Português (Brasil)](../pt-BR/README.md) | [Русский](../ru-RU/README.md) | [Bahasa Indonesia](../id-ID/README.md) | [Türkçe](../tr-TR/README.md) | [Polski](../pl-PL/README.md) | [Italiano](../it-IT/README.md) | **Nederlands** | [हिन्दी](../hi-IN/README.md) | [ไทย](../th-TH/README.md)

Een optionele Chrome-extensie volgens Manifest V3 voor Yin-Panel. Deze haalt echte favicon-bytes van sites op voor het importeren van bladwijzers wanneer normale browserverzoeken door CORS worden geblokkeerd, valt terug op openbare favicon-diensten en voegt een configureerbare omleiding voor nieuwe tabbladen toe. Yin-Panel blijft zonder deze extensie werken door zijn eigen server-side favicon- en tekstpictogram-terugvalopties te gebruiken.

## Installatie

1. Open `chrome://extensions`.
2. Schakel de ontwikkelaarsmodus in.
3. Kies **Load unpacked** en selecteer deze map.
4. Laad Yin-Panel opnieuw voordat u een bladwijzerimport start.

## Machtigingen

- `storage` — slaat de doel-URL voor nieuwe tabbladen op.
- `host_permissions: ["<all_urls>"]` — de extensie vraagt favicongegevens rechtstreeks op bij de sites van bladwijzers.
- Er worden geen machtigingen voor camera, microfoon, locatie, meldingen of apparaten aangevraagd.

## Omleiding van nieuwe tab

`chrome_url_overrides` stuurt elk nieuw tabblad naar `newtab.html`, dat onmiddellijk doorverwijst naar het opgeslagen doel. De standaardwaarde is `https://panel.yiniot.com` en alleen `http`- en `https`-URL's worden geaccepteerd; ongeldige of ontbrekende waarden vallen terug op de standaard. Stel het doel in via de pop-up op de werkbalk of de optiespagina.

## Favicon ophalen

- Het contentscript beantwoordt alleen berichten die zijn gemarkeerd met `source: 'yin-panel'` en ondersteunt de berichttypen `ping` en `fetch-icons`.
- Voor elke pagina volgt de service worker eerst de eigen pictogramverklaringen van de site (`rel="icon"`, `apple-touch-icon`, `mask-icon`) en daarna gangbare faviconpaden in de hoofdmap.
- Als die niet werken, probeert hij openbare favicon-diensten, waarbij hij voor elke bruikbare dienst een pool van acht verzoeken aanmaakt.
- Mislukte opzoekingen worden aan Yin-Panel teruggegeven, dat zijn eigen favicon- en tekstpictogram-terugvalopties toepast; de extensie genereert geen apart terugvalpictogram.

## Talen

De interface volgt de UI-taal van de browser. Engelse, Vereenvoudigd-Chinese, Traditioneel-Chinese, Japanse, Koreaanse, Duitse, Franse, Spaanse, Braziliaans-Portugese Russische, Indonesische, Turkse, Poolse, Italiaanse, Nederlandse, Hindi- en Thaise teksten staan in `_locales/`; elke andere browsertaal valt terug op Engels. Tekst op extensiepagina's wordt via `i18n.js` opgelost en is nooit hardgecodeerd.

## Ontwikkeling

| File | Rol |
| --- | --- |
| `service-worker.js` | Extensieberichten, favicon ophalen van sites en openbare terugvalopties |
| `content-script.js` | Berichtbrug aan de paginazijde die door Yin-Panel wordt gebruikt |
| `config.js` | Normalisatie van de URL voor nieuwe tabbladen en het standaarddoel |
| `newtab.html`, `newtab.js` | Overschrijving en omleiding van nieuwe tabbladen |
| `settings.html`, `settings.css`, `settings.js` | Optiespagina en pop-up op de werkbalk |
| `i18n.js`, `_locales/` | Gedeelde lokalisatiehulp voor pagina's en berichtcatalogi per taal |
| `manifest.json` | Machtigingen, entrypoints, overschrijving van nieuwe tabbladen en registratie van het contentscript |

Er is geen buildstap; elk bestand wordt direct geladen. Controleer de JavaScript en het manifest met:

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
node --check i18n.js
```

[AGENTS.md](../../AGENTS.md) beschrijft de gedragsinvarianten, de testplaatsing en de veiligheidsregels. Acceptatietests op browserniveau staan in de [E2E-repository](https://github.com/yinorg/yin-panel-e2e); de Core-service staat in [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel).

## Automatisch publiceren in de Chrome Web Store

De workflow in `.github/workflows/publish-chrome-web-store.yml` wordt uitgevoerd wanneer een release-tag wordt gepusht. Deze bouwt een tijdelijk pakket, stelt de manifestversie van het pakket in op basis van de tag, uploadt het via de Chrome Web Store API v2 en dient het ter beoordeling in.

Chrome accepteert één tot vier door punten gescheiden numerieke versiesegmenten, dus tags moeten eruitzien als `1.2.3` of `v1.2.3`. De optionele voorloop-`v` wordt verwijderd voordat de manifestversie wordt geschreven. Elk segment moet tussen `0` en `65535` liggen en de versie moet hoger zijn dan de momenteel gepubliceerde versie.

### Eenmalige configuratie

1. Schakel de Chrome Web Store API in een Google Cloud-project in.
2. Maak een Google Cloud-serviceaccount aan en voeg het e-mailadres toe onder de accountinstellingen van het Chrome Web Store Developer Dashboard. Zie de [Chrome Web Store-serviceaccountgids](https://developer.chrome.com/docs/webstore/service-accounts).
3. Configureer GitHub Actions Workload Identity Federation voor deze repository. De [Google GitHub Actions-authenticatiegids](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) beschrijft de vereiste pool, provider en IAM-binding.
4. Voeg deze repository-secrets toe:

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: de volledige provider-resourcenaam, zoals `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`.
   - `GCP_SERVICE_ACCOUNT`: het e-mailadres van het serviceaccount.
   - `CHROME_WEBSTORE_PUBLISHER_ID`: de publisher-ID uit het Developer Dashboard.
   - `CHROME_WEBSTORE_EXTENSION_ID`: de 32 tekens tellende ID van deze gepubliceerde extensie.

Publiceer bijvoorbeeld versie `1.0.1` met:

```sh
git tag v1.0.1
git push origin v1.0.1
```

De workflow dient de release automatisch in, maar de beoordeling door de Chrome Web Store kan vertragen wanneer de nieuwe versie voor gebruikers beschikbaar komt.

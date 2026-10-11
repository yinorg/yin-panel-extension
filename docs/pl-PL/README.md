# Yin-Panel Helper

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Deutsch](../de-DE/README.md) | [Français](../fr-FR/README.md) | [Español](../es-ES/README.md) | [Português (Brasil)](../pt-BR/README.md) | [Русский](../ru-RU/README.md) | [Bahasa Indonesia](../id-ID/README.md) | [Türkçe](../tr-TR/README.md) | **Polski** | [Italiano](../it-IT/README.md) | [Nederlands](../nl-NL/README.md) | [हिन्दी](../hi-IN/README.md) | [ไทย](../th-TH/README.md)

Opcjonalne rozszerzenie Chrome Manifest V3 dla Yin-Panel. Pobiera prawdziwe bajty favikon witryn na potrzeby importu zakładek, gdy zwykłe żądania przeglądarki są blokowane przez CORS, korzysta awaryjnie z publicznych usług favikon i dodaje konfigurowalne przekierowanie nowej karty. Yin-Panel działa dalej bez niego, używając własnych, serwerowych rozwiązań awaryjnych dla favikon i ikon tekstowych.

## Instalacja

1. Otwórz `chrome://extensions`.
2. Włącz tryb dewelopera.
3. Wybierz **Load unpacked** i wskaż ten katalog.
4. Przed rozpoczęciem importu zakładek odśwież Yin-Panel.

## Uprawnienia

- `storage` — przechowuje docelowy URL nowej karty.
- `host_permissions: ["<all_urls>"]` — rozszerzenie żąda danych favikon bezpośrednio z witryn zakładek.
- Nie są wymagane uprawnienia do kamery, mikrofonu, lokalizacji, powiadomień ani urządzeń.

## Przekierowanie nowej karty

`chrome_url_overrides` kieruje każdą nową kartę do `newtab.html`, który natychmiast przekierowuje na zapisany cel. Domyślnie jest to `https://panel.yiniot.com`, a akceptowane są tylko adresy `http` i `https`; nieprawidłowe lub brakujące wartości powodują powrót do wartości domyślnej. Cel ustaw w oknie podręcznym na pasku narzędzi lub na stronie opcji.

## Pobieranie favikon

- Skrypt treści odpowiada tylko na komunikaty oznaczone `source: 'yin-panel'` i obsługuje typy komunikatów `ping` oraz `fetch-icons`.
- Dla każdej strony service worker najpierw korzysta z własnych deklaracji ikon witryny (`rel="icon"`, `apple-touch-icon`, `mask-icon`), a następnie ze wspólnych ścieżek favikon w katalogu głównym.
- Gdy one zawiodą, sprawdza publiczne usługi favikon, tworząc pulę ośmiu żądań dla każdej użytecznej usługi.
- Nieudane wyszukiwania są zwracane do Yin-Panel, który stosuje własne awaryjne rozwiązania dla favikon i ikon tekstowych; rozszerzenie nie generuje osobnej awaryjnej ikony.

## Języki

Interfejs podąża za językiem interfejsu przeglądarki. Teksty w językach angielskim, chińskim uproszczonym, chińskim tradycyjnym, japońskim, koreańskim, niemieckim, francuskim, hiszpańskim, portugalskim brazylijskim rosyjskim, indonezyjskim, tureckim, polskim, włoskim, niderlandzkim, hindi i tajskim znajdują się w `_locales/`; każdy inny język przeglądarki powoduje powrót do angielskiego. Teksty stron rozszerzenia są rozwiązywane przez `i18n.js` i nigdy nie są zakodowane na stałe.

## Rozwój

| Plik | Rola |
| --- | --- |
| `service-worker.js` | Komunikaty rozszerzenia, pobieranie favikon witryn i publiczne rozwiązania awaryjne |
| `content-script.js` | Mostek komunikatów po stronie strony używany przez Yin-Panel |
| `config.js` | Normalizacja URL nowej karty i domyślny cel |
| `newtab.html`, `newtab.js` | Nadpisanie nowej karty i przekierowanie |
| `settings.html`, `settings.css`, `settings.js` | Strona opcji i okno podręczne na pasku narzędzi |
| `i18n.js`, `_locales/` | Wspólny pomocnik lokalizacji stron i katalogi komunikatów dla poszczególnych języków |
| `manifest.json` | Uprawnienia, punkty wejścia, nadpisanie nowej karty i rejestracja skryptu treści |

Nie ma etapu budowania; każdy plik jest ładowany bezpośrednio. Sprawdź JavaScript i manifest za pomocą:

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
node --check i18n.js
```

[AGENTS.md](../../AGENTS.md) dokumentuje niezmienniki zachowania, umiejscowienie testów i zasady bezpieczeństwa. Testy akceptacyjne na poziomie przeglądarki znajdują się w [repozytorium E2E](https://github.com/yinorg/yin-panel-e2e); usługa Core znajduje się w [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel).

## Automatyczna publikacja w Chrome Web Store

Workflow w `.github/workflows/publish-chrome-web-store.yml` uruchamia się po wypchnięciu tagu wydania. Tworzy tymczasowy pakiet, ustawia wersję manifestu pakietu na podstawie tagu, przesyła go przez Chrome Web Store API v2 i zgłasza do weryfikacji.

Chrome akceptuje od jednego do czterech segmentów wersji liczbowych oddzielonych kropkami, więc tagi muszą wyglądać jak `1.2.3` lub `v1.2.3`. Opcjonalne wiodące `v` jest usuwane przed zapisaniem wersji manifestu. Każdy segment musi mieścić się w przedziale od `0` do `65535`, a wersja musi być wyższa niż obecnie opublikowana wersja.

### Konfiguracja jednorazowa

1. Włącz Chrome Web Store API w projekcie Google Cloud.
2. Utwórz konto usługi Google Cloud i dodaj jego adres e-mail w ustawieniach konta w Chrome Web Store Developer Dashboard. Zobacz [przewodnik po kontach usługi Chrome Web Store](https://developer.chrome.com/docs/webstore/service-accounts).
3. Skonfiguruj GitHub Actions Workload Identity Federation dla tego repozytorium. [Przewodnik po uwierzytelnianiu Google dla GitHub Actions](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) opisuje wymaganą pulę, dostawcę i powiązanie IAM.
4. Dodaj następujące sekrety repozytorium:

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: pełna nazwa zasobu dostawcy, na przykład `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`.
   - `GCP_SERVICE_ACCOUNT`: adres e-mail konta usługi.
   - `CHROME_WEBSTORE_PUBLISHER_ID`: identyfikator wydawcy z Developer Dashboard.
   - `CHROME_WEBSTORE_EXTENSION_ID`: 32-znakowy identyfikator tego opublikowanego rozszerzenia.

Na przykład opublikuj wersję `1.0.1` za pomocą:

```sh
git tag v1.0.1
git push origin v1.0.1
```

Workflow automatycznie zgłasza wydanie, ale weryfikacja w Chrome Web Store może opóźnić moment, w którym nowa wersja stanie się dostępna dla użytkowników.

# Yin-Panel Helper

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | **Deutsch** | [Français](../fr-FR/README.md) | [Español](../es-ES/README.md) | [Português (Brasil)](../pt-BR/README.md) | [Русский](../ru-RU/README.md)

Eine optionale Chrome-Erweiterung nach Manifest V3 für Yin-Panel. Sie ruft echte Favicon-Bytes von Websites für Lesezeichen-Importe ab, wenn normale Browser-Anfragen durch CORS blockiert werden, weicht auf öffentliche Favicon-Dienste aus und ergänzt eine konfigurierbare Weiterleitung für neue Tabs. Yin-Panel funktioniert auch ohne sie weiter, indem es seine eigenen serverseitigen Favicon- und Textsymbol-Ersatzlösungen verwendet.

## Installation

1. Öffnen Sie `chrome://extensions`.
2. Aktivieren Sie den Entwicklermodus.
3. Wählen Sie **Load unpacked** und wählen Sie dieses Verzeichnis aus.
4. Laden Sie Yin-Panel neu, bevor Sie einen Lesezeichen-Import starten.

## Berechtigungen

- `storage` — speichert die Ziel-URL für neue Tabs.
- `host_permissions: ["<all_urls>"]` — die Erweiterung fordert Favicon-Daten direkt von den Websites der Lesezeichen an.
- Es werden keine Berechtigungen für Kamera, Mikrofon, Standort, Benachrichtigungen oder Geräte angefordert.

## Weiterleitung neuer Tabs

`chrome_url_overrides` leitet jeden neuen Tab an `newtab.html` weiter, das sofort auf das gespeicherte Ziel umleitet. Standard ist `https://panel.yiniot.com`, und nur `http`- und `https`-URLs werden akzeptiert; ungültige oder fehlende Werte fallen auf den Standard zurück. Legen Sie das Ziel im Symbolleisten-Pop-up oder auf der Optionsseite fest.

## Favicon-Abruf

- Das Content-Skript antwortet nur auf Nachrichten, die mit `source: 'yin-panel'` gekennzeichnet sind, und unterstützt die Nachrichtentypen `ping` und `fetch-icons`.
- Für jede Seite folgt der Service Worker zuerst den eigenen Symbol-Deklarationen der Website (`rel="icon"`, `apple-touch-icon`, `mask-icon`) und dann den üblichen Favicon-Pfaden im Wurzelverzeichnis.
- Wenn diese fehlschlagen, prüft er öffentliche Favicon-Dienste und erstellt für jeden nutzbaren Dienst einen Pool aus acht Anfragen.
- Fehlgeschlagene Abfragen werden an Yin-Panel zurückgegeben, das seine eigenen Favicon- und Textsymbol-Ersatzlösungen anwendet; die Erweiterung erzeugt kein separates Ersatzsymbol.

## Entwicklung

| Datei | Rolle |
| --- | --- |
| `service-worker.js` | Erweiterungsnachrichten, Abruf von Website-Favicons und öffentliche Fallbacks |
| `content-script.js` | Seitenseitige Nachrichtenbrücke, die von Yin-Panel verwendet wird |
| `config.js` | Normalisierung der New-Tab-URL und das Standardziel |
| `newtab.html`, `newtab.js` | New-Tab-Überschreibung und Weiterleitung |
| `settings.html`, `settings.css`, `settings.js` | Optionsseite und Symbolleisten-Pop-up |
| `manifest.json` | Berechtigungen, Einstiegspunkte, New-Tab-Überschreibung und Registrierung des Content-Skripts |

Es gibt keinen Build-Schritt; jede Datei wird direkt geladen. Prüfen Sie das JavaScript und das Manifest mit:

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
```

[AGENTS.md](../../AGENTS.md) dokumentiert die Verhaltensinvarianten, die Testablage und die Sicherheitsregeln. Browserbasierte Abnahmetests liegen im [E2E-Repository](https://github.com/yinorg/yin-panel-e2e); der Core-Dienst liegt in [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel).

## Automatische Veröffentlichung im Chrome Web Store

Der Workflow in `.github/workflows/publish-chrome-web-store.yml` wird ausgeführt, wenn ein Release-Tag gepusht wird. Er erstellt ein temporäres Paket, setzt die Manifest-Version des Pakets anhand des Tags, lädt es über die Chrome Web Store API v2 hoch und reicht es zur Prüfung ein.

Chrome akzeptiert ein bis vier durch Punkte getrennte numerische Versionssegmente, daher müssen Tags wie `1.2.3` oder `v1.2.3` aussehen. Das optionale führende `v` wird entfernt, bevor die Manifest-Version geschrieben wird. Jedes Segment muss zwischen `0` und `65535` liegen, und die Version muss größer sein als die aktuell veröffentlichte Version.

### Einmalige Einrichtung

1. Aktivieren Sie die Chrome Web Store API in einem Google Cloud-Projekt.
2. Erstellen Sie ein Google Cloud-Dienstkonto und fügen Sie dessen E-Mail-Adresse in den Kontoeinstellungen des Chrome Web Store Developer Dashboard hinzu. Siehe die [Anleitung für Chrome Web Store-Dienstkonten](https://developer.chrome.com/docs/webstore/service-accounts).
3. Konfigurieren Sie die GitHub Actions Workload Identity Federation für dieses Repository. Die [Google GitHub Actions-Authentifizierungsanleitung](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) beschreibt den erforderlichen Pool, Anbieter und die IAM-Bindung.
4. Fügen Sie diese Repository-Secrets hinzu:

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: der vollständige Ressourcenname des Anbieters, zum Beispiel `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`.
   - `GCP_SERVICE_ACCOUNT`: die E-Mail-Adresse des Dienstkontos.
   - `CHROME_WEBSTORE_PUBLISHER_ID`: die Publisher-ID aus dem Developer Dashboard.
   - `CHROME_WEBSTORE_EXTENSION_ID`: die 32-stellige ID dieser veröffentlichten Erweiterung.

Veröffentlichen Sie zum Beispiel Version `1.0.1` mit:

```sh
git tag v1.0.1
git push origin v1.0.1
```

Der Workflow reicht das Release automatisch ein, aber die Prüfung durch den Chrome Web Store kann verzögern, wann die neue Version für Benutzer verfügbar wird.

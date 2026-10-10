# Yin-Panel Helper

**English** | [简体中文](docs/zh-CN/README.md) | [繁體中文](docs/zh-TW/README.md) | [日本語](docs/ja-JP/README.md) | [한국어](docs/ko-KR/README.md) | [Deutsch](docs/de-DE/README.md) | [Français](docs/fr-FR/README.md) | [Español](docs/es-ES/README.md) | [Português (Brasil)](docs/pt-BR/README.md) | [Русский](docs/ru-RU/README.md)

An optional Chrome Manifest V3 extension for Yin-Panel. It retrieves real site favicon bytes for bookmark imports when normal browser requests are blocked by CORS, falls back to public favicon services, and adds a configurable new-tab redirect. Yin-Panel keeps working without it by using its own server-side favicon and text-icon fallbacks.

## Install

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose **Load unpacked** and select this directory.
4. Reload Yin-Panel before starting a bookmark import.

## Permissions

- `storage` — stores the new-tab target URL.
- `host_permissions: ["<all_urls>"]` — the extension requests favicon data directly from bookmark sites.
- No camera, microphone, location, notification, or device permissions are requested.

## New-tab redirect

`chrome_url_overrides` sends every new tab to `newtab.html`, which immediately redirects to the stored target. The default is `https://panel.yiniot.com`, and only `http` and `https` URLs are accepted; invalid or missing values fall back to the default. Set the target from the toolbar popup or the options page.

## Favicon retrieval

- The content script answers only messages marked with `source: 'yin-panel'`, and supports the `ping` and `fetch-icons` message types.
- For each page the service worker first follows the site's own icon declarations (`rel="icon"`, `apple-touch-icon`, `mask-icon`), then common root favicon paths.
- When those fail, it probes public favicon services, creating an eight-request pool for each usable service.
- Failed lookups are returned to Yin-Panel, which applies its own favicon and text-icon fallbacks; the extension does not generate a separate fallback icon.

## Languages

The interface follows the browser's UI language. English, Simplified Chinese, Traditional Chinese, Japanese, Korean, German, French, Spanish, Brazilian Portuguese, and Russian strings live in `_locales/`; any other browser language falls back to English. Extension-page text is resolved through `i18n.js` and is never hard-coded.

## Development

| File | Role |
| --- | --- |
| `service-worker.js` | Extension messages, site favicon retrieval, and public fallbacks |
| `content-script.js` | Page-side message bridge used by Yin-Panel |
| `config.js` | New-tab URL normalisation and the default target |
| `newtab.html`, `newtab.js` | New-tab override and redirect |
| `settings.html`, `settings.css`, `settings.js` | Options page and toolbar popup |
| `i18n.js`, `_locales/` | Shared page-localisation helper and per-language message catalogues |
| `manifest.json` | Permissions, entrypoints, new-tab override, and content-script registration |

There is no build step; every file is loaded directly. Check the JavaScript and the manifest with:

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
node --check i18n.js
```

[AGENTS.md](./AGENTS.md) documents the behaviour invariants, test placement, and safety rules. Browser-level acceptance tests live in the [E2E repository](https://github.com/yinorg/yin-panel-e2e); the Core service lives in [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel).

## Automatic Chrome Web Store publishing

The workflow in `.github/workflows/publish-chrome-web-store.yml` runs when a release tag is pushed. It builds a temporary package, sets the package manifest version from the tag, uploads it through Chrome Web Store API v2, and submits it for review.

Chrome accepts one to four dot-separated numeric version segments, so tags must look like `1.2.3` or `v1.2.3`. The optional leading `v` is removed before writing the manifest version. Every segment must be between `0` and `65535`, and the version must be greater than the currently published version.

### One-time setup

1. Enable the Chrome Web Store API in a Google Cloud project.
2. Create a Google Cloud service account and add its email under the Chrome Web Store Developer Dashboard account settings. See the [Chrome Web Store service account guide](https://developer.chrome.com/docs/webstore/service-accounts).
3. Configure GitHub Actions Workload Identity Federation for this repository. The [Google GitHub Actions auth guide](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) describes the required pool, provider, and IAM binding.
4. Add these repository secrets:

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: the full provider resource name, such as `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`.
   - `GCP_SERVICE_ACCOUNT`: the service account email.
   - `CHROME_WEBSTORE_PUBLISHER_ID`: the publisher ID from the Developer Dashboard.
   - `CHROME_WEBSTORE_EXTENSION_ID`: the 32-character ID of this published extension.

For example, publish version `1.0.1` with:

```sh
git tag v1.0.1
git push origin v1.0.1
```

The workflow submits the release automatically, but Chrome Web Store review can delay when the new version becomes available to users.

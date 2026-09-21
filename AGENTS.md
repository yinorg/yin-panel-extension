# Yin-Panel Extension Agent Guide

This repository owns the standalone Yin-Panel Manifest V3 browser extension. Keep changes scoped to the extension; Core and cross-repository acceptance tests belong in their own repositories.

## Repository Scope

- `service-worker.js` handles extension messages, site favicon retrieval, public favicon fallbacks, and service-worker lifecycle behavior.
- `newtab.html`, `newtab.js`, and `config.js` implement the custom new-tab redirect and URL validation.
- `settings.html`, `settings.css`, and `settings.js` provide the extension options page for the configured new-tab URL.
- `content-script.js` implements the page-side message bridge used by Yin-Panel.
- `manifest.json` defines permissions, extension entrypoints, the new-tab override, and content-script registration.

Do not modify the Core or E2E repositories from this worktree. Changes to the Core service belong in the Core repository; cross-repository browser acceptance tests belong in `$YIN_PANEL_E2E_DIR`.

## Behavior Invariants

- Keep `host_permissions: ["<all_urls>"]` because the extension directly requests favicon data from bookmark sites.
- Do not add or restore Chrome Proxy permissions, `chrome.proxy` calls, proxy storage, or proxy settings UI. Public favicon services are the only network fallback after direct site favicon retrieval fails.
- New tabs always redirect to the stored `newTabUrl`; invalid or missing values must fall back to `https://panel.yiniot.com`.
- Accept only `http` and `https` URLs for the new-tab target.
- Preserve the existing Yin-Panel message source checks and request/response behavior when changing favicon retrieval or page communication.

## Test Placement

- Put tests for extension-local logic, URL normalization, message handling, and other browser-independent behavior in this repository under `tests/`.
- Put real Chromium extension tests in `$YIN_PANEL_E2E_DIR/tests/`. This includes `chrome_url_overrides`, new-tab navigation, service-worker loading, extension permissions, and workflows involving the Core service.
- Do not add a second Playwright configuration here for cross-repository acceptance coverage. E2E loads this unpacked extension through `YIN_PANEL_EXTENSION_DIR`.
- Do not copy extension source files into the E2E repository. Keep implementation and local fast tests here; keep cross-repository regression tests in E2E.
- Keep test reports, traces, screenshots, videos, browser profiles, and other generated output ignored and untracked.

## Verification

- Before changes, run `git status --short` and preserve unrelated worktree changes.
- After JavaScript changes, run `node --check` for every changed JavaScript file.
- After `manifest.json` changes, parse it as JSON and verify the manifest remains loadable.
- Run `git diff --check` before committing and report every skipped or failed check.
- For browser behavior changes, run the focused test in `$YIN_PANEL_E2E_DIR` when the configured service, extension path, credentials, and headed Chromium environment are available. Otherwise report the exact missing prerequisite.

## Safety

- Never commit local credentials, proxy addresses, browser profiles, `.env` files, test reports, or generated artifacts.
- Do not delete databases, uploads, service data, or test artifacts unless explicitly requested.
- Keep extension changes independent from Core and E2E changes; coordinate through committed source and the `YIN_PANEL_EXTENSION_DIR` test input.

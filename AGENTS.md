# Yin-Panel Extension Agent Guide

This repository is the standalone Yin-Panel Manifest V3 Chrome extension.

## Workflow

- Inspect `git status --short` before making changes and preserve unrelated worktree changes.
- Keep changes scoped to the extension. Do not modify the Core or E2E repositories from this worktree.
- After JavaScript changes, run `node --check` for each changed JavaScript file.
- After manifest changes, validate `manifest.json` as JSON.
- Run `git diff --check` before committing and report every skipped check.

## Project Boundaries

- `service-worker.js` retrieves site favicons, probes public favicon services, and handles extension messages.
- `settings.html`, `settings.css`, and `settings.js` provide new-tab settings.
- `newtab.html`, `newtab.js`, `config.js`, and `content-script.js` implement new-tab behavior and page communication.
- `manifest.json` defines permissions, extension entrypoints, and content-script registration.

Keep `host_permissions: ["<all_urls>"]` because the extension directly requests favicon data from bookmark sites. Do not reintroduce Chrome Proxy permissions, `chrome.proxy` calls, proxy storage, or proxy settings UI. Public favicon services remain the only network fallback after direct site favicon retrieval fails.

## Test Placement and Ownership

- Put tests that exercise only extension-local logic, data normalization, or message handling in this repository under `tests/`.
- Put real Chromium extension tests in the separate E2E repository at `YIN_PANEL_E2E_DIR/tests/`. This includes `chrome_url_overrides`, new-tab behavior, service-worker loading, and workflows involving the Core service.
- Do not add a second Playwright configuration here for cross-repository acceptance coverage. E2E tests load this unpacked extension through `YIN_PANEL_EXTENSION_DIR`.
- Keep extension implementation and local fast tests here; keep cross-repository regression tests in E2E. Do not copy extension source files into the E2E repository.
- Keep test reports, traces, screenshots, videos, browser profiles, and other generated output untracked.

## Testing and Safety

- Preserve existing new-tab URL and enable/disable behavior when changing favicon retrieval.
- If browser tests or a Playwright configuration are present, run the relevant extension tests; otherwise state that browser tests were unavailable.
- Do not commit local credentials, proxy addresses, browser profiles, generated reports, or test artifacts.

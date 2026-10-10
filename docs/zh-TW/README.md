# Yin-Panel Helper

[English](../../README.md) | [简体中文](../zh-CN/README.md) | **繁體中文** | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Deutsch](../de-DE/README.md) | [Français](../fr-FR/README.md) | [Español](../es-ES/README.md) | [Português (Brasil)](../pt-BR/README.md) | [Русский](../ru-RU/README.md)

Yin-Panel 的選用 Chrome Manifest V3 擴充功能。當一般瀏覽器請求被 CORS 阻擋時，它會為書籤匯入取得真實網站的 favicon 位元組，並在失敗時改用公開 favicon 服務，同時新增可設定的新分頁重新導向。Yin-Panel 即使未安裝此擴充功能仍可運作，會改用自身伺服器端的 favicon 與文字圖示後援方案。

## 安裝

1. 開啟 `chrome://extensions`。
2. 啟用開發人員模式。
3. 選擇 **Load unpacked**，並選取此目錄。
4. 開始匯入書籤前，先重新載入 Yin-Panel。

## 權限

- `storage` — 儲存新分頁的目標網址。
- `host_permissions: ["<all_urls>"]` — 擴充功能會直接向書籤網站要求 favicon 資料。
- 不會要求相機、麥克風、位置、通知或裝置權限。

## 新分頁重新導向

`chrome_url_overrides` 會將每個新分頁送往 `newtab.html`，該頁面會立即重新導向至已儲存的目標。預設值為 `https://panel.yiniot.com`，且僅接受 `http` 與 `https` 網址；無效或缺少的值會改用預設值。可從工具列彈出式視窗或選項頁面設定目標。

## Favicon 取得

- 內容指令碼只回應標記為 `source: 'yin-panel'` 的訊息，並支援 `ping` 與 `fetch-icons` 訊息類型。
- 服務工作者會先依循網站自身的圖示宣告（`rel="icon"`、`apple-touch-icon`、`mask-icon`），再嘗試常見的根目錄 favicon 路徑。
- 若上述方式皆失敗，則會探測公開 favicon 服務，為每個可用的服務建立一個八個請求的集區。
- 查詢失敗的結果會傳回 Yin-Panel，由它套用自身的 favicon 與文字圖示後援方案；擴充功能不會另外產生後援圖示。

## 多語言

介面語言會跟隨瀏覽器介面語言。英文、簡體中文、繁體中文、日文、韓文、德文、法文、西班牙文、巴西葡萄牙文與俄文的文案存放於 `_locales/`；其他瀏覽器語言會回退為英文。擴充功能頁面文案透過 `i18n.js` 解析，絕不硬編碼。

## 開發

| 檔案 | 角色 |
| --- | --- |
| `service-worker.js` | 擴充功能訊息、網站 favicon 取得與公開後援 |
| `content-script.js` | Yin-Panel 使用的頁面端訊息橋接 |
| `config.js` | 新分頁網址正規化與預設目標 |
| `newtab.html`, `newtab.js` | 新分頁覆寫與重新導向 |
| `settings.html`, `settings.css`, `settings.js` | 選項頁面與工具列彈出式視窗 |
| `i18n.js`, `_locales/` | 共用頁面在地化輔助程式與各語言訊息目錄 |
| `manifest.json` | 權限、進入點、新分頁覆寫與內容指令碼註冊 |

沒有建置步驟；每個檔案都是直接載入。使用以下指令檢查 JavaScript 與資訊清單：

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
node --check i18n.js
```

[AGENTS.md](../../AGENTS.md) 說明了行為不變條件、測試放置位置與安全規則。瀏覽器層級的驗收測試位於 [E2E 儲存庫](https://github.com/yinorg/yin-panel-e2e)；Core 服務位於 [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel)。

## 自動發布至 Chrome Web Store

當推送發布標籤時，`.github/workflows/publish-chrome-web-store.yml` 中的工作流程會執行。它會建立一個臨時套件，從標籤設定套件資訊清單版本，透過 Chrome Web Store API v2 上傳，並提交以供審查。

Chrome 接受一到四段以點分隔的數字版本，因此標籤必須類似 `1.2.3` 或 `v1.2.3`。寫入資訊清單版本前，會移除開頭選用的 `v`。每一段都必須介於 `0` 與 `65535` 之間，且版本必須大於目前發布的版本。

### 一次性設定

1. 在 Google Cloud 專案中啟用 Chrome Web Store API。
2. 建立 Google Cloud 服務帳戶，並將其電子郵件新增至 Chrome Web Store 開發人員資訊主頁的帳戶設定中。請參閱 [Chrome Web Store 服務帳戶指南](https://developer.chrome.com/docs/webstore/service-accounts)。
3. 為此儲存庫設定 GitHub Actions Workload Identity Federation。[Google GitHub Actions 驗證指南](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) 說明了所需的集區、供應者與 IAM 繫結。
4. 新增下列儲存庫密鑰：

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`：完整的供應者資源名稱，例如 `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`。
   - `GCP_SERVICE_ACCOUNT`：服務帳戶的電子郵件。
   - `CHROME_WEBSTORE_PUBLISHER_ID`：來自開發人員資訊主頁的發布者 ID。
   - `CHROME_WEBSTORE_EXTENSION_ID`：此已發布擴充功能的 32 字元 ID。

例如，使用以下指令發布版本 `1.0.1`：

```sh
git tag v1.0.1
git push origin v1.0.1
```

工作流程會自動提交發布，但 Chrome Web Store 的審查可能會延遲新版本開放給使用者的時間。

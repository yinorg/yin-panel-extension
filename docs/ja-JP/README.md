# Yin-Panel Helper

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文](../zh-TW/README.md) | **日本語** | [한국어](../ko-KR/README.md) | [Deutsch](../de-DE/README.md) | [Français](../fr-FR/README.md) | [Español](../es-ES/README.md) | [Português (Brasil)](../pt-BR/README.md) | [Русский](../ru-RU/README.md) | [Bahasa Indonesia](../id-ID/README.md) | [Türkçe](../tr-TR/README.md) | [Polski](../pl-PL/README.md) | [Italiano](../it-IT/README.md) | [Nederlands](../nl-NL/README.md) | [हिन्दी](../hi-IN/README.md) | [ไทย](../th-TH/README.md)

Yin-Panel のための任意の Chrome Manifest V3 拡張機能です。通常のブラウザーリクエストが CORS によってブロックされる場合に、ブックマークのインポート用として実際のサイトの favicon データを取得し、公開 favicon サービスへフォールバックします。さらに、設定可能な新しいタブのリダイレクトを追加します。Yin-Panel はこれがなくても、独自のサーバー側 favicon とテキストアイコンのフォールバックによって動作し続けます。

## インストール

1. `chrome://extensions` を開きます。
2. デベロッパーモードを有効にします。
3. **Load unpacked** を選択し、このディレクトリを指定します。
4. ブックマークのインポートを開始する前に Yin-Panel を再読み込みします。

## 権限

- `storage` — 新しいタブの遷移先 URL を保存します。
- `host_permissions: ["<all_urls>"]` — 拡張機能はブックマーク先のサイトから favicon データを直接要求します。
- カメラ、マイク、位置情報、通知、デバイスに関する権限は要求しません。

## 新しいタブのリダイレクト

`chrome_url_overrides` は新しいタブをすべて `newtab.html` に送り、そこで保存された遷移先へ直ちにリダイレクトします。既定値は `https://panel.yiniot.com` で、受け付けるのは `http` と `https` の URL のみです。無効または未設定の値は既定値にフォールバックします。遷移先はツールバーのポップアップまたはオプションページから設定します。

## Favicon の取得

- コンテンツスクリプトは `source: 'yin-panel'` が付いたメッセージにのみ応答し、`ping` と `fetch-icons` のメッセージ種別をサポートします。
- 各ページについて、サービスワーカーはまずサイト自身のアイコン宣言（`rel="icon"`、`apple-touch-icon`、`mask-icon`）をたどり、次に一般的なルートの favicon パスを試します。
- それらが失敗すると、公開 favicon サービスを探索し、利用可能なサービスごとに 8 リクエストのプールを作成します。
- 失敗した検索は Yin-Panel に返され、Yin-Panel が独自の favicon とテキストアイコンのフォールバックを適用します。拡張機能は別途フォールバックアイコンを生成しません。

## 言語

インターフェースはブラウザーの UI 言語に従います。英語、簡体字中国語、繁体字中国語、日本語、韓国語、ドイツ語、フランス語、スペイン語、ブラジルポルトガル語、ロシア語、インドネシア語、トルコ語、ポーランド語、イタリア語、オランダ語、ヒンディー語、タイ語の文言は `_locales/` にあり、それ以外のブラウザー言語は英語にフォールバックします。拡張機能ページの文言は `i18n.js` を通じて解決され、ハードコーディングされません。

## 開発

| ファイル | 役割 |
| --- | --- |
| `service-worker.js` | 拡張機能のメッセージ、サイト favicon の取得、公開フォールバック |
| `content-script.js` | Yin-Panel が使用するページ側のメッセージブリッジ |
| `config.js` | 新しいタブ URL の正規化と既定の遷移先 |
| `newtab.html`, `newtab.js` | 新しいタブのオーバーライドとリダイレクト |
| `settings.html`, `settings.css`, `settings.js` | オプションページとツールバーのポップアップ |
| `i18n.js`, `_locales/` | ページのローカライズを共有するヘルパーと各言語のメッセージカタログ |
| `manifest.json` | 権限、エントリーポイント、新しいタブのオーバーライド、コンテンツスクリプトの登録 |

ビルド手順はなく、すべてのファイルは直接読み込まれます。JavaScript とマニフェストは次のように検証します。

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
node --check i18n.js
```

[AGENTS.md](../../AGENTS.md) には、動作の不変条件、テストの配置、安全性のルールが記載されています。ブラウザーレベルの受け入れテストは [E2E リポジトリ](https://github.com/yinorg/yin-panel-e2e) にあり、Core サービスは [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel) にあります。

## Chrome Web Store への自動公開

`.github/workflows/publish-chrome-web-store.yml` のワークフローは、リリースタグがプッシュされると実行されます。一時的なパッケージをビルドし、タグからパッケージのマニフェストバージョンを設定し、Chrome Web Store API v2 を通じてアップロードし、審査のために提出します。

Chrome はドットで区切られた 1〜4 個の数値バージョンセグメントを受け付けるため、タグは `1.2.3` または `v1.2.3` の形式でなければなりません。省略可能な先頭の `v` は、マニフェストのバージョンを書き込む前に削除されます。各セグメントは `0` から `65535` の間でなければならず、バージョンは現在公開されているバージョンより大きい必要があります。

### 初回セットアップ

1. Google Cloud プロジェクトで Chrome Web Store API を有効にします。
2. Google Cloud サービスアカウントを作成し、そのメールアドレスを Chrome Web Store Developer Dashboard のアカウント設定に追加します。詳しくは [Chrome Web Store サービスアカウントガイド](https://developer.chrome.com/docs/webstore/service-accounts) を参照してください。
3. このリポジトリに対して GitHub Actions Workload Identity Federation を構成します。[Google GitHub Actions 認証ガイド](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) に、必要なプール、プロバイダー、IAM バインディングが記載されています。
4. 以下のリポジトリシークレットを追加します。

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: プロバイダーの完全なリソース名。例: `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`
   - `GCP_SERVICE_ACCOUNT`: サービスアカウントのメールアドレス。
   - `CHROME_WEBSTORE_PUBLISHER_ID`: Developer Dashboard のパブリッシャー ID。
   - `CHROME_WEBSTORE_EXTENSION_ID`: 公開するこの拡張機能の 32 文字の ID。

たとえば、バージョン `1.0.1` を公開するには次のようにします。

```sh
git tag v1.0.1
git push origin v1.0.1
```

ワークフローはリリースを自動的に提出しますが、Chrome Web Store の審査により、新しいバージョンがユーザーに利用可能になるまで遅れることがあります。

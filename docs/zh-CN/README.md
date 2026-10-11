# Yin-Panel Helper

[English](../../README.md) | **简体中文** | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Deutsch](../de-DE/README.md) | [Français](../fr-FR/README.md) | [Español](../es-ES/README.md) | [Português (Brasil)](../pt-BR/README.md) | [Русский](../ru-RU/README.md) | [Bahasa Indonesia](../id-ID/README.md) | [Türkçe](../tr-TR/README.md) | [Polski](../pl-PL/README.md) | [Italiano](../it-IT/README.md) | [Nederlands](../nl-NL/README.md) | [हिन्दी](../hi-IN/README.md) | [ไทย](../th-TH/README.md)

Yin-Panel Helper 是 Yin-Panel 的可选 Chrome Manifest V3 扩展。当常规浏览器请求被 CORS 拦截时，它为书签导入获取真实站点图标字节，并在失败时回退到公共图标服务，同时提供一个可配置的新标签页重定向。没有该扩展时，Yin-Panel 会使用自带的服务器端图标与文字图标回退方案，因此仍可正常使用。

## 安装

1. 打开 `chrome://extensions`。
2. 开启开发者模式。
3. 选择 **Load unpacked** 并选择当前目录。
4. 开始导入书签前，先重新加载 Yin-Panel。

## 权限

- `storage` —— 存储新标签页目标 URL。
- `host_permissions: ["<all_urls>"]` —— 扩展直接从书签站点请求图标数据。
- 不请求摄像头、麦克风、定位、通知或设备权限。

## 新标签页重定向

`chrome_url_overrides` 会把每个新标签页发送到 `newtab.html`，后者随即重定向到已存储的目标。默认值为 `https://panel.yiniot.com`，且只接受 `http` 和 `https` URL；无效或缺失的值会回退到默认值。可在工具栏弹窗或选项页中设置目标。

## 图标获取

- 内容脚本只响应带有 `source: 'yin-panel'` 标记的消息，并支持 `ping` 和 `fetch-icons` 两种消息类型。
- 对每个页面，Service Worker 会先遵循站点自身的图标声明（`rel="icon"`、`apple-touch-icon`、`mask-icon`），然后尝试常见的根目录图标路径。
- 当这些尝试都失败时，它会探测公共图标服务，并为每个可用服务创建一个包含八个请求的请求池。
- 失败的查询会返回给 Yin-Panel，由后者应用自身的图标与文字图标回退方案；扩展不会另外生成回退图标。

## 多语言

界面语言跟随浏览器界面语言。英语、简体中文、繁体中文、日语、韩语、德语、法语、西班牙语、巴西葡萄牙语、俄语、印度尼西亚语、土耳其语、波兰语、意大利语、荷兰语、印地语和泰语的文案存放在 `_locales/` 中；其他浏览器语言会回退到英语。扩展页面文案通过 `i18n.js` 解析，绝不硬编码。

## 开发

| 文件 | 职责 |
| --- | --- |
| `service-worker.js` | 扩展消息、站点图标获取以及公共回退 |
| `content-script.js` | 供 Yin-Panel 使用的页面侧消息桥接 |
| `config.js` | 新标签页 URL 规范化及默认目标 |
| `newtab.html`, `newtab.js` | 新标签页覆盖与重定向 |
| `settings.html`, `settings.css`, `settings.js` | 选项页与工具栏弹窗 |
| `i18n.js`, `_locales/` | 共享页面本地化辅助脚本与各语言消息目录 |
| `manifest.json` | 权限、入口、新标签页覆盖以及内容脚本注册 |

本项目没有构建步骤，所有文件都会被直接加载。可使用以下命令检查 JavaScript 与 manifest：

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
node --check i18n.js
```

[AGENTS.md](../../AGENTS.md) 记录了行为不变量、测试放置和安全规则。浏览器级验收测试位于 [E2E 仓库](https://github.com/yinorg/yin-panel-e2e)；Core 服务位于 [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel)。

## 自动发布到 Chrome 应用商店

当推送发布标签时，会触发 `.github/workflows/publish-chrome-web-store.yml` 中的工作流。它会构建一个临时包，根据标签设置包的 manifest 版本，通过 Chrome Web Store API v2 上传，并提交审核。

Chrome 接受一到四个以点分隔的数字版本段，因此标签必须形如 `1.2.3` 或 `v1.2.3`。写入 manifest 版本前会去掉可选的前导 `v`。每个版本段都必须介于 `0` 和 `65535` 之间，且该版本必须大于当前已发布的版本。

### 一次性配置

1. 在某个 Google Cloud 项目中启用 Chrome Web Store API。
2. 创建一个 Google Cloud 服务账号，并在 Chrome Web Store 开发者信息中心的账号设置中添加其邮箱。参见 [Chrome Web Store 服务账号指南](https://developer.chrome.com/docs/webstore/service-accounts)。
3. 为本仓库配置 GitHub Actions Workload Identity Federation。[Google GitHub Actions 认证指南](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) 介绍了所需的池、提供方和 IAM 绑定。
4. 添加以下仓库密钥：

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`：完整的提供方资源名称，例如 `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`。
   - `GCP_SERVICE_ACCOUNT`：服务账号邮箱。
   - `CHROME_WEBSTORE_PUBLISHER_ID`：来自开发者信息中心的发布者 ID。
   - `CHROME_WEBSTORE_EXTENSION_ID`：此已发布扩展的 32 位 ID。

例如，使用以下命令发布版本 `1.0.1`：

```sh
git tag v1.0.1
git push origin v1.0.1
```

该工作流会自动提交发布，但 Chrome 应用商店的审核可能会延迟新版本向用户提供的时间。

# Yin-Panel Helper

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | **한국어** | [Deutsch](../de-DE/README.md) | [Français](../fr-FR/README.md) | [Español](../es-ES/README.md) | [Português (Brasil)](../pt-BR/README.md) | [Русский](../ru-RU/README.md)

Yin-Panel을 위한 선택적 Chrome Manifest V3 확장 프로그램입니다. 일반 브라우저 요청이 CORS로 차단될 때 북마크 가져오기를 위해 실제 사이트 favicon 바이트를 가져오고, 공개 favicon 서비스로 대체하며, 설정 가능한 새 탭 리디렉션을 추가합니다. 이 확장 프로그램이 없어도 Yin-Panel은 자체 서버 측 favicon과 텍스트 아이콘 대체 기능을 사용해 계속 동작합니다.

## 설치

1. `chrome://extensions`를 엽니다.
2. 개발자 모드를 활성화합니다.
3. **Load unpacked**를 선택하고 이 디렉터리를 고릅니다.
4. 북마크 가져오기를 시작하기 전에 Yin-Panel을 다시 로드합니다.

## 권한

- `storage` — 새 탭 대상 URL을 저장합니다.
- `host_permissions: ["<all_urls>"]` — 확장 프로그램이 북마크 사이트에서 직접 favicon 데이터를 요청합니다.
- 카메라, 마이크, 위치, 알림, 기기 권한은 요청하지 않습니다.

## 새 탭 리디렉션

`chrome_url_overrides`는 모든 새 탭을 `newtab.html`로 보내고, 이 파일은 저장된 대상으로 즉시 리디렉션합니다. 기본값은 `https://panel.yiniot.com`이며 `http`와 `https` URL만 허용되고, 값이 없거나 유효하지 않으면 기본값으로 대체됩니다. 대상은 도구 모음 팝업이나 옵션 페이지에서 설정합니다.

## Favicon 가져오기

- 콘텐츠 스크립트는 `source: 'yin-panel'`로 표시된 메시지에만 응답하며 `ping`과 `fetch-icons` 메시지 유형을 지원합니다.
- 서비스 워커는 각 페이지에 대해 먼저 사이트 자체의 아이콘 선언(`rel="icon"`, `apple-touch-icon`, `mask-icon`)을 따르고, 그다음 일반적인 루트 favicon 경로를 확인합니다.
- 이마저 실패하면 공개 favicon 서비스를 탐색하며, 사용할 수 있는 각 서비스에 대해 8개 요청 풀을 만듭니다.
- 실패한 조회는 Yin-Panel로 반환되고, Yin-Panel이 자체 favicon과 텍스트 아이콘 대체 기능을 적용합니다. 확장 프로그램은 별도의 대체 아이콘을 생성하지 않습니다.

## 언어

인터페이스는 브라우저 UI 언어를 따릅니다. 영어, 중국어 간체, 중국어 번체, 일본어, 한국어, 독일어, 프랑스어, 스페인어, 브라질 포르투갈어, 러시아어 문구는 `_locales/`에 있으며, 그 밖의 브라우저 언어는 영어로 대체됩니다. 확장 프로그램 페이지 문구는 `i18n.js`를 통해 처리되며 하드코딩되지 않습니다.

## 개발

| 파일 | 역할 |
| --- | --- |
| `service-worker.js` | 확장 프로그램 메시지, 사이트 favicon 가져오기, 공개 대체 서비스 |
| `content-script.js` | Yin-Panel이 사용하는 페이지 측 메시지 브리지 |
| `config.js` | 새 탭 URL 정규화와 기본 대상 |
| `newtab.html`, `newtab.js` | 새 탭 재정의와 리디렉션 |
| `settings.html`, `settings.css`, `settings.js` | 옵션 페이지와 도구 모음 팝업 |
| `i18n.js`, `_locales/` | 공용 페이지 현지화 도우미와 언어별 메시지 카탈로그 |
| `manifest.json` | 권한, 진입점, 새 탭 재정의, 콘텐츠 스크립트 등록 |

빌드 단계는 없으며 모든 파일을 직접 로드합니다. 다음으로 JavaScript와 매니페스트를 검사합니다.

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
node --check i18n.js
```

[AGENTS.md](../../AGENTS.md)는 동작 불변 규칙, 테스트 배치, 안전 규칙을 문서화합니다. 브라우저 수준 인수 테스트는 [E2E 저장소](https://github.com/yinorg/yin-panel-e2e)에 있으며, Core 서비스는 [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel)에 있습니다.

## Chrome 웹 스토어 자동 게시

`.github/workflows/publish-chrome-web-store.yml`의 워크플로는 릴리스 태그가 푸시될 때 실행됩니다. 임시 패키지를 빌드하고, 태그에서 패키지 매니페스트 버전을 설정한 뒤, Chrome Web Store API v2를 통해 업로드하고 검토를 위해 제출합니다.

Chrome은 점으로 구분된 1~4개의 숫자 버전 세그먼트를 허용하므로 태그는 `1.2.3` 또는 `v1.2.3` 형식이어야 합니다. 선택적으로 붙는 앞의 `v`는 매니페스트 버전을 기록하기 전에 제거됩니다. 각 세그먼트는 `0`과 `65535` 사이여야 하고, 버전은 현재 게시된 버전보다 커야 합니다.

### 최초 설정

1. Google Cloud 프로젝트에서 Chrome Web Store API를 활성화합니다.
2. Google Cloud 서비스 계정을 만들고 그 이메일을 Chrome 웹 스토어 개발자 대시보드 계정 설정에 추가합니다. [Chrome 웹 스토어 서비스 계정 가이드](https://developer.chrome.com/docs/webstore/service-accounts)를 참고하세요.
3. 이 저장소에 대해 GitHub Actions Workload Identity Federation을 구성합니다. [Google GitHub Actions 인증 가이드](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation)에 필요한 풀, 공급자, IAM 바인딩이 설명되어 있습니다.
4. 다음 저장소 시크릿을 추가합니다.

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: 전체 공급자 리소스 이름입니다(예: `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`).
   - `GCP_SERVICE_ACCOUNT`: 서비스 계정 이메일입니다.
   - `CHROME_WEBSTORE_PUBLISHER_ID`: 개발자 대시보드의 게시자 ID입니다.
   - `CHROME_WEBSTORE_EXTENSION_ID`: 게시된 이 확장 프로그램의 32자 ID입니다.

예를 들어 버전 `1.0.1`을 게시하려면 다음과 같이 합니다.

```sh
git tag v1.0.1
git push origin v1.0.1
```

워크플로는 릴리스를 자동으로 제출하지만, Chrome 웹 스토어 검토로 인해 새 버전이 사용자에게 제공되는 시점이 늦어질 수 있습니다.

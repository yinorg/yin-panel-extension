# Yin-Panel Helper

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Deutsch](../de-DE/README.md) | [Français](../fr-FR/README.md) | [Español](../es-ES/README.md) | **Português (Brasil)** | [Русский](../ru-RU/README.md) | [Bahasa Indonesia](../id-ID/README.md) | [Türkçe](../tr-TR/README.md) | [Polski](../pl-PL/README.md) | [Italiano](../it-IT/README.md) | [Nederlands](../nl-NL/README.md) | [हिन्दी](../hi-IN/README.md) | [ไทย](../th-TH/README.md)

Uma extensão opcional do Chrome Manifest V3 para o Yin-Panel. Ela obtém os bytes reais dos favicons dos sites para importações de favoritos quando as requisições normais do navegador são bloqueadas por CORS, recorre a serviços públicos de favicon e adiciona um redirecionamento configurável para novas abas. O Yin-Panel continua funcionando sem ela, usando seus próprios favicons do lado do servidor e ícones de texto como alternativa.

## Instalação

1. Abra `chrome://extensions`.
2. Ative o modo de desenvolvedor.
3. Escolha **Load unpacked** e selecione este diretório.
4. Recarregue o Yin-Panel antes de iniciar uma importação de favoritos.

## Permissões

- `storage` — armazena a URL de destino das novas abas.
- `host_permissions: ["<all_urls>"]` — a extensão solicita dados de favicon diretamente aos sites dos favoritos.
- Nenhuma permissão de câmera, microfone, localização, notificação ou dispositivo é solicitada.

## Redirecionamento de novas abas

`chrome_url_overrides` envia cada nova aba para `newtab.html`, que redireciona imediatamente para o destino armazenado. O padrão é `https://panel.yiniot.com`, e apenas URLs `http` e `https` são aceitas; valores inválidos ou ausentes recorrem ao padrão. Defina o destino pelo popup da barra de ferramentas ou pela página de opções.

## Recuperação de favicons

- O content script responde apenas a mensagens marcadas com `source: 'yin-panel'` e suporta os tipos de mensagem `ping` e `fetch-icons`.
- Para cada página, o service worker primeiro segue as próprias declarações de ícone do site (`rel="icon"`, `apple-touch-icon`, `mask-icon`) e depois caminhos comuns de favicon na raiz.
- Quando estas falham, ele sonda serviços públicos de favicon, criando um pool de oito requisições para cada serviço utilizável.
- As buscas malsucedidas são devolvidas ao Yin-Panel, que aplica seus próprios favicons e ícones de texto como alternativa; a extensão não gera um ícone de fallback separado.

## Idiomas

A interface segue o idioma da interface do navegador. Os textos em inglês, chinês simplificado, chinês tradicional, japonês, coreano, alemão, francês, espanhol, português do Brasil russo, indonésio, turco, polonês, italiano, holandês, hindi e tailandês ficam em `_locales/`; qualquer outro idioma do navegador recorre ao inglês. Os textos das páginas da extensão são resolvidos por meio do `i18n.js` e nunca são codificados de forma fixa.

## Desenvolvimento

| Arquivo | Função |
| --- | --- |
| `service-worker.js` | Mensagens da extensão, recuperação de favicons de sites e fallbacks públicos |
| `content-script.js` | Ponte de mensagens do lado da página usada pelo Yin-Panel |
| `config.js` | Normalização da URL de novas abas e o destino padrão |
| `newtab.html`, `newtab.js` | Substituição e redirecionamento de novas abas |
| `settings.html`, `settings.css`, `settings.js` | Página de opções e popup da barra de ferramentas |
| `i18n.js`, `_locales/` | Assistente compartilhado de localização de página e catálogos de mensagens por idioma |
| `manifest.json` | Permissões, pontos de entrada, substituição de novas abas e registro do content script |

Não há etapa de build; todos os arquivos são carregados diretamente. Verifique o JavaScript e o manifest com:

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
node --check i18n.js
```

O [AGENTS.md](../../AGENTS.md) documenta as invariantes de comportamento, o posicionamento de testes e as regras de segurança. Os testes de aceitação no nível do navegador ficam no [repositório de E2E](https://github.com/yinorg/yin-panel-e2e); o serviço Core fica em [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel).

## Publicação automática na Chrome Web Store

O workflow em `.github/workflows/publish-chrome-web-store.yml` é executado quando uma tag de release é enviada. Ele cria um pacote temporário, define a versão do manifest do pacote a partir da tag, faz o upload por meio da Chrome Web Store API v2 e o envia para revisão.

O Chrome aceita de um a quatro segmentos numéricos de versão separados por pontos, então as tags devem ter o formato `1.2.3` ou `v1.2.3`. O `v` inicial opcional é removido antes de gravar a versão no manifest. Cada segmento deve estar entre `0` e `65535`, e a versão deve ser maior que a versão publicada no momento.

### Configuração inicial

1. Ative a Chrome Web Store API em um projeto do Google Cloud.
2. Crie uma conta de serviço do Google Cloud e adicione o e-mail dela nas configurações da conta do Chrome Web Store Developer Dashboard. Consulte o [guia de contas de serviço da Chrome Web Store](https://developer.chrome.com/docs/webstore/service-accounts).
3. Configure o GitHub Actions Workload Identity Federation para este repositório. O [guia de autenticação do Google para GitHub Actions](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) descreve o pool, o provider e a vinculação de IAM necessários.
4. Adicione estes secrets do repositório:

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: o nome completo do recurso do provider, como `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`.
   - `GCP_SERVICE_ACCOUNT`: o e-mail da conta de serviço.
   - `CHROME_WEBSTORE_PUBLISHER_ID`: o publisher ID do Developer Dashboard.
   - `CHROME_WEBSTORE_EXTENSION_ID`: o ID de 32 caracteres desta extensão publicada.

Por exemplo, publique a versão `1.0.1` com:

```sh
git tag v1.0.1
git push origin v1.0.1
```

O workflow envia a release automaticamente, mas a revisão da Chrome Web Store pode atrasar o momento em que a nova versão fica disponível para os usuários.

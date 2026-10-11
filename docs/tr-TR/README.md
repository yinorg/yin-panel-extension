# Yin-Panel Helper

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Deutsch](../de-DE/README.md) | [Français](../fr-FR/README.md) | [Español](../es-ES/README.md) | [Português (Brasil)](../pt-BR/README.md) | [Русский](../ru-RU/README.md) | [Bahasa Indonesia](../id-ID/README.md) | **Türkçe** | [Polski](../pl-PL/README.md) | [Italiano](../it-IT/README.md) | [Nederlands](../nl-NL/README.md) | [हिन्दी](../hi-IN/README.md) | [ไทย](../th-TH/README.md)

Yin-Panel için isteğe bağlı bir Chrome Manifest V3 uzantısı. Normal tarayıcı istekleri CORS tarafından engellendiğinde yer işareti içe aktarımları için gerçek site favicon baytlarını alır, genel favicon hizmetlerine geri döner ve yapılandırılabilir bir yeni sekme yönlendirmesi ekler. Yin-Panel, kendi sunucu tarafı favicon ve metin simgesi yedeklerini kullanarak uzantı olmadan da çalışmaya devam eder.

## Kurulum

1. `chrome://extensions` adresini açın.
2. Geliştirici modunu etkinleştirin.
3. **Load unpacked** seçeneğini seçin ve bu dizini seçin.
4. Yer işareti içe aktarmaya başlamadan önce Yin-Panel'i yeniden yükleyin.

## İzinler

- `storage` — yeni sekme hedef URL'sini depolar.
- `host_permissions: ["<all_urls>"]` — uzantı favicon verilerini doğrudan yer işareti sitelerinden ister.
- Kamera, mikrofon, konum, bildirim veya cihaz izni istenmez.

## Yeni sekme yönlendirmesi

`chrome_url_overrides` her yeni sekmeyi `newtab.html` sayfasına gönderir; bu sayfa hemen depolanan hedefe yönlendirir. Varsayılan `https://panel.yiniot.com` adresidir ve yalnızca `http` ve `https` URL'leri kabul edilir; geçersiz veya eksik değerler varsayılana döner. Hedefi araç çubuğu açılır penceresinden veya seçenekler sayfasından ayarlayın.

## Favicon alma

- İçerik betiği yalnızca `source: 'yin-panel'` ile işaretlenmiş mesajları yanıtlar ve `ping` ile `fetch-icons` mesaj türlerini destekler.
- Hizmet çalışanı her sayfa için önce sitenin kendi simge bildirimlerini (`rel="icon"`, `apple-touch-icon`, `mask-icon`), ardından yaygın kök favicon yollarını izler.
- Bunlar başarısız olduğunda genel favicon hizmetlerini yoklar ve kullanılabilir her hizmet için sekiz isteklik bir havuz oluşturur.
- Başarısız aramalar Yin-Panel'e döndürülür; Yin-Panel kendi favicon ve metin simgesi yedeklerini uygular; uzantı ayrı bir yedek simge üretmez.

## Diller

Arayüz, tarayıcının arayüz dilini takip eder. İngilizce, Basitleştirilmiş Çince, Geleneksel Çince, Japonca, Korece, Almanca, Fransızca, İspanyolca, Brezilya Portekizcesi Rusça, Endonezce, Türkçe, Lehçe, İtalyanca, Felemenkçe, Hintçe ve Tayca metinler `_locales/` içinde bulunur; başka herhangi bir tarayıcı dili İngilizceye döner. Uzantı sayfası metinleri `i18n.js` üzerinden çözülür ve asla sabit kodlanmaz.

## Geliştirme

| Dosya | Rol |
| --- | --- |
| `service-worker.js` | Uzantı mesajları, site favicon'u alma ve genel yedekler |
| `content-script.js` | Yin-Panel tarafından kullanılan sayfa tarafı mesaj köprüsü |
| `config.js` | Yeni sekme URL normalizasyonu ve varsayılan hedef |
| `newtab.html`, `newtab.js` | Yeni sekme geçersiz kılması ve yönlendirme |
| `settings.html`, `settings.css`, `settings.js` | Seçenekler sayfası ve araç çubuğu açılır penceresi |
| `i18n.js`, `_locales/` | Ortak sayfa yerelleştirme yardımcısı ve dil başına mesaj katalogları |
| `manifest.json` | İzinler, giriş noktaları, yeni sekme geçersiz kılması ve içerik betiği kaydı |

Derleme adımı yoktur; her dosya doğrudan yüklenir. JavaScript'i ve manifest'i şununla kontrol edin:

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
node --check i18n.js
```

[AGENTS.md](../../AGENTS.md) davranış değişmezlerini, test yerleşimini ve güvenlik kurallarını belgeler. Tarayıcı düzeyindeki kabul testleri [E2E deposunda](https://github.com/yinorg/yin-panel-e2e) bulunur; Core hizmeti [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel) deposunda bulunur.

## Chrome Web Store'da otomatik yayımlama

`.github/workflows/publish-chrome-web-store.yml` içindeki iş akışı, bir sürüm etiketi gönderildiğinde çalışır. Geçici bir paket oluşturur, paketin manifest sürümünü etiketten ayarlar, paketi Chrome Web Store API v2 üzerinden yükler ve incelemeye sunar.

Chrome, noktayla ayrılmış bir ile dört arası sayısal sürüm segmentini kabul eder; bu nedenle etiketler `1.2.3` veya `v1.2.3` gibi görünmelidir. İsteğe bağlı baştaki `v`, manifest sürümü yazılmadan önce kaldırılır. Her segment `0` ile `65535` arasında olmalıdır ve sürüm, hâlihazırda yayımlanmış sürümden büyük olmalıdır.

### Tek seferlik kurulum

1. Bir Google Cloud projesinde Chrome Web Store API'sini etkinleştirin.
2. Bir Google Cloud hizmet hesabı oluşturun ve e-posta adresini Chrome Web Store Developer Dashboard hesap ayarlarına ekleyin. Bkz. [Chrome Web Store hizmet hesabı kılavuzu](https://developer.chrome.com/docs/webstore/service-accounts).
3. Bu depo için GitHub Actions Workload Identity Federation'ı yapılandırın. [Google GitHub Actions kimlik doğrulama kılavuzu](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) gerekli havuzu, sağlayıcıyı ve IAM bağlamasını açıklar.
4. Şu depo gizli değerlerini ekleyin:

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: tam sağlayıcı kaynak adı, örneğin `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`.
   - `GCP_SERVICE_ACCOUNT`: hizmet hesabının e-posta adresi.
   - `CHROME_WEBSTORE_PUBLISHER_ID`: Developer Dashboard'daki yayıncı kimliği.
   - `CHROME_WEBSTORE_EXTENSION_ID`: bu yayımlanmış uzantının 32 karakterlik kimliği.

Örneğin `1.0.1` sürümünü şununla yayımlayın:

```sh
git tag v1.0.1
git push origin v1.0.1
```

İş akışı sürümü otomatik olarak gönderir, ancak Chrome Web Store incelemesi yeni sürümün kullanıcılara ne zaman sunulacağını geciktirebilir.

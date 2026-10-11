# Yin-Panel Helper

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Deutsch](../de-DE/README.md) | [Français](../fr-FR/README.md) | [Español](../es-ES/README.md) | [Português (Brasil)](../pt-BR/README.md) | [Русский](../ru-RU/README.md) | [Bahasa Indonesia](../id-ID/README.md) | [Türkçe](../tr-TR/README.md) | [Polski](../pl-PL/README.md) | [Italiano](../it-IT/README.md) | [Nederlands](../nl-NL/README.md) | **हिन्दी** | [ไทย](../th-TH/README.md)

Yin-Panel के लिए एक वैकल्पिक Chrome Manifest V3 एक्सटेंशन। यह बुकमार्क आयात के लिए वास्तविक साइट favicon बाइट्स प्राप्त करता है जब सामान्य ब्राउज़र अनुरोध CORS द्वारा अवरुद्ध होते हैं, सार्वजनिक favicon सेवाओं पर वापस चला जाता है, और एक कॉन्फ़िगर करने योग्य new-tab रीडायरेक्ट जोड़ता है। Yin-Panel अपने स्वयं के सर्वर-साइड favicon और text-icon fallbacks का उपयोग करके इसके बिना भी काम करता रहता है।

## इंस्टॉल

1. `chrome://extensions` खोलें।
2. Developer mode सक्षम करें।
3. **Load unpacked** चुनें और इस डायरेक्टरी का चयन करें।
4. बुकमार्क आयात शुरू करने से पहले Yin-Panel को रीलोड करें।

## अनुमतियाँ

- `storage` — new-tab लक्ष्य URL संग्रहीत करता है।
- `host_permissions: ["<all_urls>"]` — एक्सटेंशन बुकमार्क साइटों से सीधे favicon डेटा का अनुरोध करता है।
- कोई कैमरा, माइक्रोफ़ोन, स्थान, नोटिफ़िकेशन या डिवाइस अनुमतियाँ अनुरोधित नहीं की जाती हैं।

## New-tab रीडायरेक्ट

`chrome_url_overrides` हर नए टैब को `newtab.html` पर भेजता है, जो तुरंत संग्रहीत लक्ष्य पर रीडायरेक्ट करता है। डिफ़ॉल्ट `https://panel.yiniot.com` है, और केवल `http` तथा `https` URL स्वीकार किए जाते हैं; अमान्य या अनुपस्थित मान डिफ़ॉल्ट पर वापस चले जाते हैं। लक्ष्य को टूलबार पॉपअप या options पेज से सेट करें।

## Favicon प्राप्ति

- content script केवल `source: 'yin-panel'` से चिह्नित संदेशों का उत्तर देता है, और `ping` तथा `fetch-icons` संदेश प्रकारों का समर्थन करता है।
- प्रत्येक पेज के लिए service worker पहले साइट की अपनी icon घोषणाओं (`rel="icon"`, `apple-touch-icon`, `mask-icon`) का अनुसरण करता है, फिर सामान्य root favicon पथों का।
- जब वे विफल होते हैं, तो यह सार्वजनिक favicon सेवाओं की जाँच करता है, प्रत्येक उपयोग-योग्य सेवा के लिए आठ-अनुरोध का पूल बनाता है।
- विफल लुकअप Yin-Panel को लौटाए जाते हैं, जो अपने स्वयं के favicon और text-icon fallbacks लागू करता है; एक्सटेंशन अलग fallback आइकन उत्पन्न नहीं करता।

## भाषाएँ

इंटरफ़ेस ब्राउज़र की UI भाषा का अनुसरण करता है। अंग्रेज़ी, सरलीकृत चीनी, पारंपरिक चीनी, जापानी, कोरियाई, जर्मन, फ़्रेंच, स्पेनिश, ब्राज़ीलियन पुर्तगाली रूसी, इंडोनेशियाई, तुर्की, पोलिश, इतालवी, डच, हिंदी और थाई स्ट्रिंग्स `_locales/` में रहती हैं; कोई अन्य ब्राउज़र भाषा अंग्रेज़ी पर वापस चली जाती है। एक्सटेंशन-पेज टेक्स्ट `i18n.js` के माध्यम से हल किया जाता है और कभी hard-coded नहीं होता।

## विकास

| फ़ाइल | भूमिका |
| --- | --- |
| `service-worker.js` | एक्सटेंशन संदेश, साइट favicon प्राप्ति और सार्वजनिक fallbacks |
| `content-script.js` | Yin-Panel द्वारा उपयोग किया जाने वाला पेज-साइड संदेश ब्रिज |
| `config.js` | New-tab URL सामान्यीकरण और डिफ़ॉल्ट लक्ष्य |
| `newtab.html`, `newtab.js` | New-tab override और रीडायरेक्ट |
| `settings.html`, `settings.css`, `settings.js` | Options पेज और टूलबार पॉपअप |
| `i18n.js`, `_locales/` | साझा पेज-लोकलाइज़ेशन हेल्पर और प्रति-भाषा संदेश कैटलॉग |
| `manifest.json` | अनुमतियाँ, entrypoints, new-tab override और content-script पंजीकरण |

कोई build चरण नहीं है; प्रत्येक फ़ाइल सीधे लोड की जाती है। JavaScript और manifest की जाँच इस प्रकार करें:

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
node --check i18n.js
```

[AGENTS.md](../../AGENTS.md) व्यवहार अपरिवर्तनीयताओं, परीक्षण स्थान और सुरक्षा नियमों का दस्तावेज़ीकरण करता है। ब्राउज़र-स्तरीय स्वीकृति परीक्षण [E2E रिपॉज़िटरी](https://github.com/yinorg/yin-panel-e2e) में हैं; Core सेवा [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel) में है।

## स्वचालित Chrome Web Store प्रकाशन

`.github/workflows/publish-chrome-web-store.yml` में workflow तब चलता है जब release tag push किया जाता है। यह एक अस्थायी package बनाता है, tag से package manifest version सेट करता है, Chrome Web Store API v2 के माध्यम से इसे अपलोड करता है, और समीक्षा के लिए सबमिट करता है।

Chrome एक से चार बिंदु-पृथक संख्यात्मक version सेगमेंट स्वीकार करता है, इसलिए tags `1.2.3` या `v1.2.3` जैसे दिखने चाहिए। manifest version लिखने से पहले वैकल्पिक अग्रणी `v` हटा दिया जाता है। प्रत्येक सेगमेंट `0` और `65535` के बीच होना चाहिए, और version वर्तमान में प्रकाशित version से बड़ा होना चाहिए।

### एकबारगी सेटअप

1. Google Cloud प्रोजेक्ट में Chrome Web Store API सक्षम करें।
2. Google Cloud service account बनाएँ और उसका ईमेल Chrome Web Store Developer Dashboard की account settings में जोड़ें। [Chrome Web Store service account गाइड](https://developer.chrome.com/docs/webstore/service-accounts) देखें।
3. इस रिपॉज़िटरी के लिए GitHub Actions Workload Identity Federation कॉन्फ़िगर करें। [Google GitHub Actions auth गाइड](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) आवश्यक pool, provider और IAM binding का वर्णन करता है।
4. इन repository secrets को जोड़ें:

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: पूरा provider resource नाम, जैसे `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`।
   - `GCP_SERVICE_ACCOUNT`: service account ईमेल।
   - `CHROME_WEBSTORE_PUBLISHER_ID`: Developer Dashboard से publisher ID।
   - `CHROME_WEBSTORE_EXTENSION_ID`: इस प्रकाशित एक्सटेंशन की 32-वर्ण ID।

उदाहरण के लिए, version `1.0.1` इस प्रकार प्रकाशित करें:

```sh
git tag v1.0.1
git push origin v1.0.1
```

workflow रिलीज़ को स्वचालित रूप से सबमिट करता है, लेकिन Chrome Web Store समीक्षा नए version के उपयोगकर्ताओं तक उपलब्ध होने में देरी कर सकती है।

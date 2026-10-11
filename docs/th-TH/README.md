# Yin-Panel Helper

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Deutsch](../de-DE/README.md) | [Français](../fr-FR/README.md) | [Español](../es-ES/README.md) | [Português (Brasil)](../pt-BR/README.md) | [Русский](../ru-RU/README.md) | [Bahasa Indonesia](../id-ID/README.md) | [Türkçe](../tr-TR/README.md) | [Polski](../pl-PL/README.md) | [Italiano](../it-IT/README.md) | [Nederlands](../nl-NL/README.md) | [हिन्दी](../hi-IN/README.md) | **ไทย**

ส่วนขยาย Chrome Manifest V3 แบบเลือกใช้ได้สำหรับ Yin-Panel ทำหน้าที่ดึงไบต์ favicon จริงของเว็บไซต์สำหรับการนำเข้าบุ๊กมาร์ก เมื่อคำขอปกติของเบราว์เซอร์ถูกบล็อกโดย CORS จะถอยไปใช้บริการ favicon สาธารณะ และเพิ่มการเปลี่ยนเส้นทางแท็บใหม่ที่กำหนดค่าได้ Yin-Panel ยังทำงานได้แม้ไม่มีส่วนขยายนี้ โดยใช้ favicon ฝั่งเซิร์ฟเวอร์และไอคอนข้อความสำรองของตัวเอง

## การติดตั้ง

1. เปิด `chrome://extensions`
2. เปิดใช้งานโหมดนักพัฒนา (Developer mode)
3. เลือก **Load unpacked** แล้วเลือกไดเรกทอรีนี้
4. โหลด Yin-Panel ใหม่ก่อนเริ่มนำเข้าบุ๊กมาร์ก

## สิทธิ์การเข้าถึง

- `storage` — จัดเก็บ URL เป้าหมายของแท็บใหม่
- `host_permissions: ["<all_urls>"]` — ส่วนขยายร้องขอข้อมูล favicon โดยตรงจากเว็บไซต์ของบุ๊กมาร์ก
- ไม่มีการร้องขอสิทธิ์กล้อง ไมโครโฟน ตำแหน่ง การแจ้งเตือน หรืออุปกรณ์

## การเปลี่ยนเส้นทางแท็บใหม่

`chrome_url_overrides` ส่งทุกแท็บใหม่ไปที่ `newtab.html` ซึ่งจะเปลี่ยนเส้นทางไปยังเป้าหมายที่จัดเก็บไว้ทันที ค่าเริ่มต้นคือ `https://panel.yiniot.com` และยอมรับเฉพาะ URL แบบ `http` และ `https` เท่านั้น ค่าที่ไม่ถูกต้องหรือไม่มีจะถอยไปใช้ค่าเริ่มต้น ตั้งค่าเป้าหมายได้จากป๊อปอัปบนแถบเครื่องมือหรือหน้าตัวเลือก

## การดึง favicon

- สคริปต์เนื้อหาจะตอบเฉพาะข้อความที่ทำเครื่องหมายด้วย `source: 'yin-panel'` และรองรับชนิดข้อความ `ping` และ `fetch-icons`
- สำหรับแต่ละหน้า service worker จะทำตามการประกาศไอคอนของเว็บไซต์เองก่อน (`rel="icon"`, `apple-touch-icon`, `mask-icon`) จากนั้นจึงลองเส้นทาง favicon ที่รากซึ่งพบบ่อย
- เมื่อวิธีเหล่านั้นล้มเหลว จะตรวจสอบบริการ favicon สาธารณะ โดยสร้างพูลคำขอจำนวนแปดคำขอสำหรับแต่ละบริการที่ใช้งานได้
- การค้นหาที่ล้มเหลวจะถูกส่งกลับไปยัง Yin-Panel ซึ่งจะใช้ favicon และไอคอนข้อความสำรองของตัวเอง ส่วนขยายจะไม่สร้างไอคอนสำรองแยกต่างหาก

## ภาษา

อินเทอร์เฟซจะตามภาษา UI ของเบราว์เซอร์ ข้อความภาษาอังกฤษ จีนตัวย่อ จีนตัวเต็ม ญี่ปุ่น เกาหลี เยอรมัน ฝรั่งเศส สเปน โปรตุเกส (บราซิล) รัสเซีย อินโดนีเซีย ตุรกี โปแลนด์ อิตาลี ดัตช์ ฮินดี และไทย อยู่ใน `_locales/` ส่วนภาษาเบราว์เซอร์อื่นใดจะถอยไปใช้ภาษาอังกฤษ ข้อความในหน้าของส่วนขยายจะถูกเลือกผ่าน `i18n.js` และไม่ถูกฮาร์ดโค้ด

## การพัฒนา

| ไฟล์ | หน้าที่ |
| --- | --- |
| `service-worker.js` | ข้อความของส่วนขยาย การดึง favicon ของเว็บไซต์ และตัวสำรองสาธารณะ |
| `content-script.js` | สะพานข้อความฝั่งหน้าเว็บที่ใช้โดย Yin-Panel |
| `config.js` | การปรับ URL ของแท็บใหม่ให้เป็นมาตรฐานและเป้าหมายเริ่มต้น |
| `newtab.html`, `newtab.js` | การแทนที่แท็บใหม่และการเปลี่ยนเส้นทาง |
| `settings.html`, `settings.css`, `settings.js` | หน้าตัวเลือกและป๊อปอัปบนแถบเครื่องมือ |
| `i18n.js`, `_locales/` | ตัวช่วยการแปลภาษาหน้าร่วมและแค็ตตาล็อกข้อความรายภาษา |
| `manifest.json` | สิทธิ์ จุดเริ่มต้น การแทนที่แท็บใหม่ และการลงทะเบียนสคริปต์เนื้อหา |

ไม่มีการบิลด์ ทุกไฟล์โหลดโดยตรง ตรวจสอบ JavaScript และ manifest ด้วย:

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
node --check i18n.js
```

[AGENTS.md](../../AGENTS.md) อธิบายค่าคงที่ของพฤติกรรม การจัดวางการทดสอบ และกฎความปลอดภัย การทดสอบการยอมรับระดับเบราว์เซอร์อยู่ใน [repository E2E](https://github.com/yinorg/yin-panel-e2e) ส่วนบริการ Core อยู่ใน [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel)

## การเผยแพร่ไปยัง Chrome Web Store โดยอัตโนมัติ

workflow ใน `.github/workflows/publish-chrome-web-store.yml` จะทำงานเมื่อมีการ push แท็ก release โดยจะสร้างแพ็กเกจชั่วคราว ตั้งค่าเวอร์ชันของ manifest แพ็กเกจจากแท็ก อัปโหลดผ่าน Chrome Web Store API v2 และส่งเพื่อตรวจสอบ

Chrome ยอมรับส่วนของเวอร์ชันที่เป็นตัวเลขคั่นด้วยจุดตั้งแต่หนึ่งถึงสี่ส่วน ดังนั้นแท็กต้องมีรูปแบบอย่าง `1.2.3` หรือ `v1.2.3` โดยจะตัด `v` นำหน้าที่ไม่บังคับออกก่อนเขียนเวอร์ชันลง manifest ทุกส่วนต้องอยู่ระหว่าง `0` ถึง `65535` และเวอร์ชันต้องใหม่กว่าเวอร์ชันที่เผยแพร่อยู่ในปัจจุบัน

### การตั้งค่าครั้งเดียว

1. เปิดใช้งาน Chrome Web Store API ในโปรเจกต์ Google Cloud
2. สร้างบัญชีบริการ (service account) ของ Google Cloud และเพิ่มอีเมลของบัญชีนั้นในหน้าตั้งค่าบัญชีของ Chrome Web Store Developer Dashboard ดู [คู่มือบัญชีบริการของ Chrome Web Store](https://developer.chrome.com/docs/webstore/service-accounts)
3. ตั้งค่า GitHub Actions Workload Identity Federation สำหรับ repository นี้ โดย [คู่มือการยืนยันตัวตนของ Google GitHub Actions](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) อธิบายพูล ผู้ให้บริการ และการผูก IAM ที่จำเป็น
4. เพิ่ม secret ของ repository เหล่านี้:

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: ชื่อทรัพยากรเต็มของ provider เช่น `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`
   - `GCP_SERVICE_ACCOUNT`: อีเมลของบัญชีบริการ
   - `CHROME_WEBSTORE_PUBLISHER_ID`: ID ผู้เผยแพร่จาก Developer Dashboard
   - `CHROME_WEBSTORE_EXTENSION_ID`: ID ความยาว 32 ตัวอักษรของส่วนขยายที่เผยแพร่นี้

ตัวอย่างเช่น เผยแพร่เวอร์ชัน `1.0.1` ด้วย:

```sh
git tag v1.0.1
git push origin v1.0.1
```

workflow จะส่ง release โดยอัตโนมัติ แต่การตรวจสอบของ Chrome Web Store อาจทำให้เวอร์ชันใหม่กว่าจะพร้อมใช้งานสำหรับผู้ใช้ล่าช้าออกไป

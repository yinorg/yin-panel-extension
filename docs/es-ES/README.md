# Yin-Panel Helper

[English](../../README.md) | [简体中文](../zh-CN/README.md) | [繁體中文](../zh-TW/README.md) | [日本語](../ja-JP/README.md) | [한국어](../ko-KR/README.md) | [Deutsch](../de-DE/README.md) | [Français](../fr-FR/README.md) | **Español** | [Português (Brasil)](../pt-BR/README.md) | [Русский](../ru-RU/README.md)

Extensión opcional de Chrome con Manifest V3 para Yin-Panel. Obtiene los bytes reales del favicon de los sitios para las importaciones de marcadores cuando las peticiones normales del navegador están bloqueadas por CORS, recurre a servicios públicos de favicon y añade una redirección de nueva pestaña configurable. Yin-Panel sigue funcionando sin ella gracias a su propio favicon del lado del servidor y a sus alternativas de iconos de texto.

## Instalación

1. Abra `chrome://extensions`.
2. Active el modo de desarrollador.
3. Elija **Load unpacked** y seleccione este directorio.
4. Recargue Yin-Panel antes de iniciar una importación de marcadores.

## Permisos

- `storage` — almacena la URL de destino de la nueva pestaña.
- `host_permissions: ["<all_urls>"]` — la extensión solicita los datos del favicon directamente a los sitios de marcadores.
- No se solicitan permisos de cámara, micrófono, ubicación, notificaciones ni dispositivos.

## Redirección de nueva pestaña

`chrome_url_overrides` envía cada nueva pestaña a `newtab.html`, que redirige inmediatamente al destino almacenado. El valor predeterminado es `https://panel.yiniot.com`, y solo se aceptan URL con `http` y `https`; los valores no válidos o ausentes recurren al predeterminado. Configure el destino desde la ventana emergente de la barra de herramientas o la página de opciones.

## Obtención del favicon

- El script de contenido solo responde a los mensajes marcados con `source: 'yin-panel'` y admite los tipos de mensaje `ping` y `fetch-icons`.
- Para cada página, el service worker sigue primero las declaraciones de iconos del propio sitio (`rel="icon"`, `apple-touch-icon`, `mask-icon`) y, después, las rutas de favicon habituales en la raíz.
- Cuando estas fallan, sondea servicios públicos de favicon y crea un grupo de ocho peticiones por cada servicio utilizable.
- Las búsquedas fallidas se devuelven a Yin-Panel, que aplica sus propias alternativas de favicon e iconos de texto; la extensión no genera un icono de reserva independiente.

## Idiomas

La interfaz sigue el idioma de la interfaz del navegador. Los textos en inglés, chino simplificado, chino tradicional, japonés, coreano, alemán, francés, español, portugués de Brasil y ruso se encuentran en `_locales/`; cualquier otro idioma del navegador recurre al inglés. Los textos de las páginas de la extensión se resuelven mediante `i18n.js` y nunca están codificados de forma fija.

## Desarrollo

| Archivo | Función |
| --- | --- |
| `service-worker.js` | Mensajes de la extensión, obtención del favicon del sitio y alternativas públicas |
| `content-script.js` | Puente de mensajes del lado de la página que usa Yin-Panel |
| `config.js` | Normalización de la URL de nueva pestaña y destino predeterminado |
| `newtab.html`, `newtab.js` | Anulación de la nueva pestaña y redirección |
| `settings.html`, `settings.css`, `settings.js` | Página de opciones y ventana emergente de la barra de herramientas |
| `i18n.js`, `_locales/` | Asistente compartido de localización de página y catálogos de mensajes por idioma |
| `manifest.json` | Permisos, puntos de entrada, anulación de la nueva pestaña y registro del script de contenido |

No hay paso de compilación; todos los archivos se cargan directamente. Compruebe el JavaScript y el manifiesto con:

```bash
node --check service-worker.js
node --check content-script.js
node --check config.js
node --check newtab.js
node --check settings.js
node --check i18n.js
```

[AGENTS.md](../../AGENTS.md) documenta las invariantes de comportamiento, la ubicación de las pruebas y las reglas de seguridad. Las pruebas de aceptación a nivel de navegador viven en el [repositorio de E2E](https://github.com/yinorg/yin-panel-e2e); el servicio Core vive en [yinorg/Yin-Panel](https://github.com/yinorg/Yin-Panel).

## Publicación automática en Chrome Web Store

El flujo de trabajo de `.github/workflows/publish-chrome-web-store.yml` se ejecuta cuando se envía una etiqueta de versión. Crea un paquete temporal, establece la versión del manifiesto del paquete a partir de la etiqueta, lo sube mediante Chrome Web Store API v2 y lo envía para su revisión.

Chrome acepta de uno a cuatro segmentos numéricos de versión separados por puntos, por lo que las etiquetas deben tener el formato `1.2.3` o `v1.2.3`. La `v` inicial opcional se elimina antes de escribir la versión en el manifiesto. Cada segmento debe estar entre `0` y `65535`, y la versión debe ser mayor que la versión publicada actualmente.

### Configuración inicial

1. Habilite Chrome Web Store API en un proyecto de Google Cloud.
2. Cree una cuenta de servicio de Google Cloud y añada su correo electrónico en la configuración de la cuenta del Panel de desarrollador de Chrome Web Store. Consulte la [guía de cuentas de servicio de Chrome Web Store](https://developer.chrome.com/docs/webstore/service-accounts).
3. Configure GitHub Actions Workload Identity Federation para este repositorio. La [guía de autenticación de Google GitHub Actions](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) describe el grupo, el proveedor y la vinculación de IAM necesarios.
4. Añada estos secretos del repositorio:

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: el nombre completo del recurso del proveedor, como `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`.
   - `GCP_SERVICE_ACCOUNT`: el correo electrónico de la cuenta de servicio.
   - `CHROME_WEBSTORE_PUBLISHER_ID`: el ID de editor del Panel de desarrollador.
   - `CHROME_WEBSTORE_EXTENSION_ID`: el ID de 32 caracteres de esta extensión publicada.

Por ejemplo, publique la versión `1.0.1` con:

```sh
git tag v1.0.1
git push origin v1.0.1
```

El flujo de trabajo envía la versión automáticamente, pero la revisión de Chrome Web Store puede retrasar el momento en que la nueva versión esté disponible para los usuarios.

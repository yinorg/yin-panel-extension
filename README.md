# Yin-Panel Helper

This optional Chrome Manifest V3 extension helps Yin-Panel import bookmarks by retrieving real site favicon bytes when normal browser requests are blocked by CORS restrictions. It also supports public favicon fallbacks and a custom new-tab redirect.

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose **Load unpacked** and select this directory.
4. Reload Yin-Panel before starting a bookmark import.

The extension only responds to messages marked with the `yin-panel` source. Yin-Panel continues to work without it by using the server-side favicon fallback.

The only broad permission is host access to fetch favicon data from bookmark sites. The extension does not request camera, microphone, location, notification, or device permissions.

The extension also provides a custom new-tab redirect. Open the toolbar popup or the extension's Options page to set the target URL. The default target is `https://panel.yiniot.com`; only `http` and `https` URLs are accepted.

Icon requests first follow the site's standard favicon declarations and common root paths. If those fail, the extension probes all public favicon services and creates an eight-request pool for each usable service. Failed requests are dynamically distributed across those pools, and each request uses one public service. Failed requests are returned to Yin-Panel for its normal favicon and text-icon fallbacks; the extension does not generate a separate fallback icon.

# Yin-Panel Helper

This optional Chrome Manifest V3 extension helps Yin-Panel import bookmarks by retrieving real site favicon bytes when normal browser requests are blocked by CORS restrictions. It also supports public favicon fallbacks, temporary proxy retries, and an optional new-tab redirect.

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose **Load unpacked** and select this directory.
4. Reload Yin-Panel before starting a bookmark import.

The extension only responds to messages marked with the `yin-panel` source. Yin-Panel continues to work without it by using the server-side favicon fallback.

The only broad permission is host access to fetch favicon data from bookmark sites. The extension does not request camera, microphone, location, notification, or device permissions.

The extension also provides a custom new-tab redirect. Open the toolbar popup or the extension's Options page to set the target URL. The default target is `http://panel.yiniot.com`; only `http` and `https` URLs are accepted.

Icon fetching supports an optional temporary proxy retry. Configure a full proxy address such as `http://192.168.31.10:7890` in the toolbar popup or Options page. The proxy is only applied while retrying failed icon requests and the previous Chrome proxy configuration is restored afterward. Proxy authentication is not supported.

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

## Automatic Chrome Web Store publishing

The workflow in `.github/workflows/publish-chrome-web-store.yml` runs when a release tag is pushed. It builds a temporary package, sets the package manifest version from the tag, uploads it through Chrome Web Store API v2, and submits it for review.

Chrome accepts one to four dot-separated numeric version segments, so tags must look like `1.2.3` or `v1.2.3`. The optional leading `v` is removed before writing the manifest version. Every segment must be between `0` and `65535`, and the version must be greater than the currently published version.

### One-time setup

1. Enable the Chrome Web Store API in a Google Cloud project.
2. Create a Google Cloud service account and add its email under the Chrome Web Store Developer Dashboard account settings. See the [Chrome Web Store service account guide](https://developer.chrome.com/docs/webstore/service-accounts).
3. Configure GitHub Actions Workload Identity Federation for this repository. The [Google GitHub Actions auth guide](https://github.com/google-github-actions/auth#setting-up-workload-identity-federation) describes the required pool, provider, and IAM binding.
4. Add these repository secrets:

   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: the full provider resource name, such as `projects/123456789/locations/global/workloadIdentityPools/github/providers/yin-panel-extension`.
   - `GCP_SERVICE_ACCOUNT`: the service account email.
   - `CHROME_WEBSTORE_PUBLISHER_ID`: the publisher ID from the Developer Dashboard.
   - `CHROME_WEBSTORE_EXTENSION_ID`: the 32-character ID of this published extension.

For example, publish version `1.0.1` with:

```sh
git tag v1.0.1
git push origin v1.0.1
```

The workflow submits the release automatically, but Chrome Web Store review can delay when the new version becomes available to users.

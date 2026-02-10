# Console messages you can ignore

These **do not come from your app**. They come from browser extensions or the browser itself. You can ignore them or reduce them by:

- **Hard refresh** after code changes: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) so you see the latest JS.
- **lockdown-install.js / SES Removing unpermitted intrinsics** – from a security/SES extension.
- **data:;base64,= / chrome-extension://invalid/** – from extensions (e.g. MetaMask, inpage.js).
- **quillbot-content.js** – from the QuillBot extension.

To get a clean console while developing: open your app in an **Incognito/Private window** with extensions disabled, or disable extensions for localhost.

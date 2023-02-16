(window.opener || window.parent).postMessage({ url: location.href, source: "oidc-client", keepOpen: false }, location.origin);

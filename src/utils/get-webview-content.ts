import { ColorThemeKind, Uri, window, type Webview } from "vscode";

/**
 * Optional extra attributes serialized onto the `#root` element so pages can
 * read contextual data (e.g. an agent-chat session id) synchronously before
 * their first postMessage round-trip.
 *
 * Keys become `data-<kebab-case-key>` attributes. Values are HTML-escaped.
 */
export interface WebviewDataAttributes {
	readonly [attribute: string]: string | undefined;
}

export const getWebviewContent = (
	webview: Webview,
	extensionUri: Uri,
	page: string,
	extraDataAttributes?: WebviewDataAttributes
): string => {
	const scriptUri = webview.asWebviewUri(
		Uri.joinPath(extensionUri, "dist", "webview", "app", "index.js")
	);
	const styleUri = webview.asWebviewUri(
		Uri.joinPath(extensionUri, "dist", "webview", "app", "assets", "index.css")
	);

	const nonce = getNonce();
	const dataAttrs = serializeDataAttrs(extraDataAttributes ?? {});
	const themeKind = resolveThemeKind();

	return `<!DOCTYPE html>
        <html lang="en" style="height: 100%;">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta property="csp-nonce" nonce="${nonce}" />
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data: https:; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource} data:; script-src 'nonce-${nonce}';">
            <link href="${styleUri}" rel="stylesheet" />
            <title>GatomIA</title>
        </head>
        <body data-vscode-theme-kind="${themeKind}" style="height: 100%; margin: 0;">
            <div id="root" data-page="${page}"${dataAttrs} style="height: 100%;"></div>
            <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
};

/**
 * Map the active VS Code color theme kind to the `data-vscode-theme-kind`
 * attribute injected onto the webview `<body>`. CSS rules can then target
 * `body[data-vscode-theme-kind~="dark"]` to adapt rendering (e.g. invert
 * registry icons that ship as dark-on-transparent SVGs).
 *
 * Returns `"light"` as a safe fallback when the theme API is unavailable
 * (e.g. in unit tests that stub the VS Code namespace).
 */
function resolveThemeKind(): string {
	try {
		const kind = window.activeColorTheme.kind;
		switch (kind) {
			case ColorThemeKind.Dark:
				return "vscode-dark";
			case ColorThemeKind.HighContrast:
				return "vscode-high-contrast";
			case ColorThemeKind.HighContrastLight:
				return "vscode-high-contrast-light";
			default:
				return "vscode-light";
		}
	} catch {
		return "vscode-light";
	}
}

function serializeDataAttrs(attrs: WebviewDataAttributes): string {
	const parts: string[] = [];
	for (const [key, value] of Object.entries(attrs)) {
		if (value === undefined) {
			continue;
		}
		parts.push(` data-${key}="${escapeHtml(value)}"`);
	}
	return parts.join("");
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function getNonce() {
	let text = "";
	const possible =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const NonceLength = 32;
	for (let i = 0; i < NonceLength; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

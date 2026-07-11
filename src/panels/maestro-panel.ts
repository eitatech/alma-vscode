/**
 * MaestroPanel
 *
 * Handles lifecycle and messaging for the Maestro Board webview panel.
 * Mirrors the pattern from welcome-screen-panel.ts.
 */

import type { Disposable, Webview, WebviewPanel } from "vscode";
import {
	Uri,
	ViewColumn,
	window,
	type ExtensionContext,
	type OutputChannel,
} from "vscode";
import { getWebviewContent } from "../utils/get-webview-content";
import type {
	ExtensionToWebviewMessage,
	WebviewToExtensionMessage,
} from "../types/maestro";
import type { MaestroProvider } from "../providers/maestro-provider";

export interface MaestroPanelCallbacks {
	onReady?: () => Promise<void> | void;
	onRefresh?: () => Promise<void> | void;
	onStartTask?: (
		taskKey: string,
		prompt: string,
		target: "local" | "cloud"
	) => Promise<void> | void;
	onNewFreeformTask?: (
		prompt: string,
		target: "local" | "cloud"
	) => Promise<void> | void;
	onFilterSpec?: (specId: string | null) => Promise<void> | void;
	onToggleGroup?: (groupBySpec: boolean) => Promise<void> | void;
	onSwitchTab?: (tab: "board" | "composer" | "list") => Promise<void> | void;
	onOpenExternal?: (url: string) => Promise<void> | void;
	setPanel?: (panel: MaestroPanel) => void;
}

/**
 * Manages the Maestro Board webview panel lifecycle and message passing.
 * Singleton pattern ensures only one instance exists.
 */
export class MaestroPanel {
	static readonly panelType = "gatomia.maestro";
	private static currentPanel: MaestroPanel | undefined;

	private panel: WebviewPanel | undefined;
	private isWebviewReady = false;
	private pendingMessages: ExtensionToWebviewMessage[] = [];
	private disposables: Disposable[] = [];
	private readonly context: ExtensionContext;
	private readonly outputChannel: OutputChannel;
	private readonly callbacks: MaestroPanelCallbacks;

	private constructor(
		context: ExtensionContext,
		outputChannel: OutputChannel,
		callbacks: MaestroPanelCallbacks = {}
	) {
		this.context = context;
		this.outputChannel = outputChannel;
		this.callbacks = callbacks;
	}

	/**
	 * Show or focus the Maestro panel (singleton pattern).
	 */
	static show(
		context: ExtensionContext,
		outputChannel: OutputChannel,
		callbacks: MaestroPanelCallbacks = {}
	): MaestroPanel {
		if (MaestroPanel.currentPanel) {
			MaestroPanel.currentPanel.panel?.reveal(ViewColumn.One);
			return MaestroPanel.currentPanel;
		}

		const panel = new MaestroPanel(context, outputChannel, callbacks);
		MaestroPanel.currentPanel = panel;
		panel.ensurePanel();
		return panel;
	}

	/**
	 * Create a Maestro panel with a provider.
	 */
	static showWithProvider(
		context: ExtensionContext,
		outputChannel: OutputChannel,
		provider: MaestroProvider
	): MaestroPanel {
		const callbacks: MaestroPanelCallbacks = {
			onReady: () => provider.onReady(),
			onRefresh: () => provider.refresh(),
			onStartTask: (taskKey, prompt, target) =>
				provider.onStartTask(taskKey, prompt, target),
			onNewFreeformTask: (prompt, target) =>
				provider.onNewFreeformTask(prompt, target),
			onFilterSpec: (specId) => provider.onFilterSpec(specId),
			onToggleGroup: (groupBySpec) => provider.onToggleGroup(groupBySpec),
			onSwitchTab: (tab) => provider.onSwitchTab(tab),
			onOpenExternal: (url) => provider.onOpenExternal(url),
		};

		const panel = MaestroPanel.show(context, outputChannel, callbacks);
		provider.setPanel(panel);
		return panel;
	}

	/**
	 * Post message to webview.
	 */
	async postMessage(message: ExtensionToWebviewMessage): Promise<void> {
		this.outputChannel.appendLine(
			`[MaestroPanel] Posting message: ${message.type}, ready: ${this.isWebviewReady}`
		);

		if (!this.panel?.webview) {
			this.pendingMessages.push(message);
			return;
		}

		if (!this.isWebviewReady) {
			this.pendingMessages.push(message);
			return;
		}

		const success = await this.panel.webview.postMessage(message);
		if (!success) {
			this.outputChannel.appendLine("[MaestroPanel] Failed to post message");
		}
	}

	/**
	 * Dispose panel and cleanup resources.
	 */
	dispose(): void {
		this.disposePanel();
		for (const disposable of this.disposables) {
			disposable.dispose();
		}
		this.disposables = [];
		MaestroPanel.currentPanel = undefined;
	}

	/**
	 * Check if panel is currently visible.
	 */
	isVisible(): boolean {
		return this.panel?.visible ?? false;
	}

	/**
	 * Ensure panel exists and return it.
	 */
	private ensurePanel(): WebviewPanel {
		if (this.panel) {
			return this.panel;
		}

		const panel = window.createWebviewPanel(
			MaestroPanel.panelType,
			"Maestro Board",
			{
				viewColumn: ViewColumn.One,
				preserveFocus: false,
			},
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [this.context.extensionUri],
			}
		);

		panel.iconPath = {
			light: Uri.joinPath(
				this.context.extensionUri,
				"assets",
				"icons",
				"logo-light.svg"
			),
			dark: Uri.joinPath(
				this.context.extensionUri,
				"assets",
				"icons",
				"logo-dark.svg"
			),
		};

		panel.webview.html = this.getHtml(panel.webview);

		panel.webview.onDidReceiveMessage(
			async (message: WebviewToExtensionMessage) => {
				await this.handleWebviewMessage(message);
			},
			undefined,
			this.disposables
		);

		panel.onDidDispose(() => this.disposePanel(), undefined, this.disposables);

		this.panel = panel;
		this.isWebviewReady = false;

		return panel;
	}

	/**
	 * Dispose panel and reset state.
	 */
	private disposePanel(): void {
		if (this.panel) {
			this.panel.dispose();
			this.panel = undefined;
		}
		this.isWebviewReady = false;
		this.pendingMessages = [];
		MaestroPanel.currentPanel = undefined;
	}

	/**
	 * Get HTML content for webview.
	 */
	private getHtml(webview: Webview): string {
		return getWebviewContent(webview, this.context.extensionUri, "maestro");
	}

	/**
	 * Handle messages received from webview.
	 */
	private async handleWebviewMessage(
		message: WebviewToExtensionMessage
	): Promise<void> {
		this.outputChannel.appendLine(
			`[MaestroPanel] Received message: ${message?.type ?? "undefined"}`
		);

		switch (message?.type) {
			case "maestro/ready":
				this.outputChannel.appendLine("[MaestroPanel] Webview ready");
				this.isWebviewReady = true;
				await this.flushPendingMessages();
				await this.callbacks.onReady?.();
				return;

			case "maestro/refresh":
				await this.callbacks.onRefresh?.();
				return;

			case "maestro/start-task":
				await this.callbacks.onStartTask?.(
					message.taskKey,
					message.prompt,
					message.target
				);
				return;

			case "maestro/new-freeform-task":
				await this.callbacks.onNewFreeformTask?.(
					message.prompt,
					message.target
				);
				return;

			case "maestro/filter-spec":
				await this.callbacks.onFilterSpec?.(message.specId);
				return;

			case "maestro/toggle-group":
				await this.callbacks.onToggleGroup?.(message.groupBySpec);
				return;

			case "maestro/switch-tab":
				await this.callbacks.onSwitchTab?.(message.tab);
				return;

			case "maestro/open-external":
				await this.callbacks.onOpenExternal?.(message.url);
				return;

			default:
				this.outputChannel.appendLine(
					`[MaestroPanel] Unknown message type: ${(message as { type?: string })?.type ?? "undefined"}`
				);
		}
	}

	/**
	 * Flush pending messages after webview becomes ready.
	 */
	private async flushPendingMessages(): Promise<void> {
		const messages = [...this.pendingMessages];
		this.pendingMessages = [];
		for (const message of messages) {
			await this.postMessage(message);
		}
	}
}

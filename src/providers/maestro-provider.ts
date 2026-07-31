/**
 * MaestroProvider
 *
 * Aggregates state for the Maestro Board webview.
 * Collects specs, tasks, and sessions, and handles user actions
 * (start task, filter, refresh, etc.).
 *
 * Mirrors the pattern from welcome-screen-provider.ts.
 */

import type { ExtensionContext, OutputChannel } from "vscode";
import { commands, env, Uri } from "vscode";
import type { MaestroPanel } from "../panels/maestro-panel";
import type {
	MaestroTask,
	RunningCard,
	MaestroTab,
	BoardSpecStatus,
} from "../features/maestro/types";
import { taskPromptKey } from "../features/maestro/task-prompt";
import { columnFor } from "../features/maestro/board-projection";
import {
	aggregateRunningCards,
	groupCardsByTaskKey,
	activeTaskKeys,
	failedTaskKeys,
} from "../features/maestro/session-aggregator";
import type { MaestroStateMessage, MaestroSpecInfo } from "../types/maestro";
import { getSpecSystemAdapter } from "../utils/spec-kit-adapter";
import { parseTasksFromFile, getTasksFilePath } from "../utils/task-parser";
import { getSpecState } from "../features/spec/review-flow/state";
import type { SpecStatus } from "../features/spec/review-flow/types";
import type { AgentSessionStorage } from "../features/cloud-agents/agent-session-storage";
import type { DevinSessionStorage } from "../features/devin/devin-session-storage";
import type { AgentChatSessionStore } from "../features/agent-chat/agent-chat-session-store";

/** Auto-refresh interval in milliseconds (2.5s, matching JetBrains). */
const AUTO_REFRESH_INTERVAL_MS = 2500;

/**
 * Map review-flow SpecStatus to BoardSpecStatus.
 * Ported from MaestroData.kt `boardStatus()`.
 */
function mapSpecStatus(status: SpecStatus | null): BoardSpecStatus {
	switch (status) {
		case "current":
			return "CURRENT";
		case "review":
			return "REVIEW";
		case "reopened":
			return "REOPENED";
		case "archived":
			return "ARCHIVED";
		default:
			return "DRAFT";
	}
}

/**
 * Check if a spec has any open change requests (blockers).
 */
function specHasOpenBlocker(specId: string): boolean {
	const specState = getSpecState(specId);
	if (!specState?.changeRequests) {
		return false;
	}
	return specState.changeRequests.some((cr) => cr.status === "open");
}

export interface MaestroProviderOptions {
	readonly context: ExtensionContext;
	readonly output: OutputChannel;
	readonly agentSessionStorage: AgentSessionStorage;
	readonly devinSessionStorage: DevinSessionStorage;
	readonly agentChatSessionStore: AgentChatSessionStore;
	readonly acpSessionManager?: unknown;
	readonly startLocalTask?: (
		prompt: string,
		taskKey: string | null
	) => Promise<void>;
	readonly startCloudTask?: (
		prompt: string,
		taskKey: string | null
	) => Promise<void>;
}

export class MaestroProvider {
	private readonly context: ExtensionContext;
	private readonly output: OutputChannel;
	private readonly agentSessionStorage: AgentSessionStorage;
	private readonly devinSessionStorage: DevinSessionStorage;
	private readonly agentChatSessionStore: AgentChatSessionStore;
	private readonly startLocalTask?: (
		prompt: string,
		taskKey: string | null
	) => Promise<void>;
	private readonly startCloudTask?: (
		prompt: string,
		taskKey: string | null
	) => Promise<void>;

	private panel: MaestroPanel | null = null;
	private autoRefreshTimer: ReturnType<typeof setInterval> | null = null;

	private activeSpec: string | null = null;
	private groupBySpec = false;
	private activeTab: MaestroTab = "board";

	constructor(options: MaestroProviderOptions) {
		this.context = options.context;
		this.output = options.output;
		this.agentSessionStorage = options.agentSessionStorage;
		this.devinSessionStorage = options.devinSessionStorage;
		this.agentChatSessionStore = options.agentChatSessionStore;
		this.startLocalTask = options.startLocalTask;
		this.startCloudTask = options.startCloudTask;
	}

	setPanel(panel: MaestroPanel): void {
		this.panel = panel;
	}

	startAutoRefresh(): void {
		if (this.autoRefreshTimer) {
			return;
		}
		this.autoRefreshTimer = setInterval(() => {
			this.refresh().catch((err) => {
				this.output.appendLine(`[Maestro] Auto-refresh error: ${err}`);
			});
		}, AUTO_REFRESH_INTERVAL_MS);
	}

	stopAutoRefresh(): void {
		if (this.autoRefreshTimer) {
			clearInterval(this.autoRefreshTimer);
			this.autoRefreshTimer = null;
		}
	}

	/**
	 * Aggregate all Maestro tasks from specs' tasks.md files.
	 */
	async collectTasks(): Promise<MaestroTask[]> {
		const adapter = getSpecSystemAdapter();
		let specs: Awaited<ReturnType<typeof adapter.listSpecs>>;
		try {
			specs = await adapter.listSpecs();
		} catch (err) {
			this.output.appendLine(`[Maestro] Failed to list specs: ${err}`);
			return [];
		}

		const tasks: MaestroTask[] = [];

		for (const spec of specs) {
			const specState = getSpecState(spec.id);
			const specStatus = mapSpecStatus(specState?.status ?? null);
			const hasBlocker = specHasOpenBlocker(spec.id);

			const tasksFilePath = getTasksFilePath(spec.id);
			if (!tasksFilePath) {
				continue;
			}

			let groups: ReturnType<typeof parseTasksFromFile>;
			try {
				groups = parseTasksFromFile(tasksFilePath);
			} catch (err) {
				this.output.appendLine(
					`[Maestro] Failed to parse tasks for ${spec.id}: ${err}`
				);
				continue;
			}

			for (const group of groups) {
				for (const task of group.tasks) {
					tasks.push({
						spec: spec.name,
						specId: spec.id,
						phase: group.name,
						id: task.id,
						title: task.title,
						done: task.status === "completed",
						specStatus,
						specHasOpenBlocker: hasBlocker,
					});
				}
			}
		}

		return tasks;
	}

	/**
	 * Aggregate all running/finished sessions as RunningCards.
	 */
	async collectSessions(): Promise<RunningCard[]> {
		const cloudSessions = await this.agentSessionStorage.getAll();
		const devinSessions = this.devinSessionStorage.getAll();
		const acpSessions = await this.agentChatSessionStore.listActive();

		return aggregateRunningCards(cloudSessions, devinSessions, acpSessions);
	}

	/**
	 * Collect specs for the filter bar.
	 */
	async collectSpecs(): Promise<MaestroSpecInfo[]> {
		const adapter = getSpecSystemAdapter();
		let specs: Awaited<ReturnType<typeof adapter.listSpecs>>;
		try {
			specs = await adapter.listSpecs();
		} catch {
			return [];
		}

		return specs.map((spec) => ({
			id: spec.id,
			name: spec.name,
			status: getSpecState(spec.id)?.status ?? "current",
		}));
	}

	/**
	 * Build the full state message for the webview.
	 */
	async buildStateMessage(): Promise<MaestroStateMessage> {
		const [tasks, sessions, specs] = await Promise.all([
			this.collectTasks(),
			this.collectSessions(),
			this.collectSpecs(),
		]);

		return {
			type: "maestro/state",
			tasks,
			sessions,
			specs,
			activeSpec: this.activeSpec,
			groupBySpec: this.groupBySpec,
			activeTab: this.activeTab,
		};
	}

	/**
	 * Refresh the webview with current state.
	 */
	async refresh(): Promise<void> {
		if (!this.panel) {
			return;
		}
		try {
			const state = await this.buildStateMessage();
			await this.panel.postMessage(state);
		} catch (err) {
			this.output.appendLine(`[Maestro] Refresh error: ${err}`);
			await this.panel.postMessage({
				type: "maestro/error",
				message: `Failed to refresh: ${err instanceof Error ? err.message : String(err)}`,
			});
		}
	}

	/**
	 * Handle webview ready message.
	 */
	async onReady(): Promise<void> {
		this.startAutoRefresh();
		await this.refresh();
	}

	/**
	 * Handle start-task message from webview.
	 */
	async onStartTask(
		taskKey: string,
		prompt: string,
		target: "local" | "cloud"
	): Promise<void> {
		this.output.appendLine(`[Maestro] Start task ${target}: ${taskKey}`);
		try {
			if (target === "local") {
				if (this.startLocalTask) {
					await this.startLocalTask(prompt, taskKey);
				} else {
					await commands.executeCommand("gatomia.spec.runTask", {
						taskKey,
						prompt,
					});
				}
			} else if (this.startCloudTask) {
				await this.startCloudTask(prompt, taskKey);
			} else {
				await commands.executeCommand("gatomia.cloud.startTask", {
					taskKey,
					prompt,
				});
			}
			await this.refresh();
		} catch (err) {
			this.output.appendLine(`[Maestro] Start task error: ${err}`);
			await this.panel?.postMessage({
				type: "maestro/error",
				message: `Failed to start task: ${err instanceof Error ? err.message : String(err)}`,
			});
		}
	}

	/**
	 * Handle new free-form task from composer.
	 */
	async onNewFreeformTask(
		prompt: string,
		target: "local" | "cloud"
	): Promise<void> {
		this.output.appendLine(`[Maestro] New freeform task ${target}`);
		try {
			if (target === "local") {
				await this.startLocalTask?.(prompt, null);
			} else {
				await this.startCloudTask?.(prompt, null);
			}
			await this.refresh();
		} catch (err) {
			this.output.appendLine(`[Maestro] Freeform task error: ${err}`);
			await this.panel?.postMessage({
				type: "maestro/error",
				message: `Failed to start task: ${err instanceof Error ? err.message : String(err)}`,
			});
		}
	}

	/**
	 * Handle spec filter change.
	 */
	async onFilterSpec(specId: string | null): Promise<void> {
		this.activeSpec = specId;
		await this.refresh();
	}

	/**
	 * Handle group-by-spec toggle.
	 */
	async onToggleGroup(groupBySpec: boolean): Promise<void> {
		this.groupBySpec = groupBySpec;
		await this.refresh();
	}

	/**
	 * Handle tab switch.
	 */
	async onSwitchTab(tab: MaestroTab): Promise<void> {
		this.activeTab = tab;
		await this.refresh();
	}

	/**
	 * Handle open external URL.
	 * Only http/https URLs are allowed to prevent opening arbitrary
	 * URI schemes (file://, javascript:, etc.) from webview messages.
	 */
	async onOpenExternal(url: string): Promise<void> {
		// Only allow http/https URLs to prevent opening arbitrary URI schemes
		// (file://, javascript:, etc.) from webview messages.
		const lowerUrl = url.toLowerCase();
		if (!(lowerUrl.startsWith("https://") || lowerUrl.startsWith("http://"))) {
			this.outputChannel.appendLine(
				`[Maestro] Refused to open URL with unsupported scheme: ${url}`
			);
			return;
		}
		await env.openExternal(Uri.parse(url));
	}

	/**
	 * Get the column for a task given the current session state.
	 */
	getTaskColumn(
		task: MaestroTask,
		cards: RunningCard[]
	): ReturnType<typeof columnFor> {
		const cardsByKey = groupCardsByTaskKey(cards);
		const activeKeys = activeTaskKeys(cards);
		const failedKeys = failedTaskKeys(cards);
		const key = taskPromptKey(task.specId, task.id, task.title);

		return columnFor({
			specId: task.specId,
			specStatus: task.specStatus,
			done: task.done,
			hasActiveSession: activeKeys.has(key),
			specHasOpenBlocker: task.specHasOpenBlocker,
			hasFailedSession: failedKeys.has(key),
		});
	}

	dispose(): void {
		this.stopAutoRefresh();
	}
}

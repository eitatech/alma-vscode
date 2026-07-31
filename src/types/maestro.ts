/**
 * Message contracts for Maestro Board extension <-> webview communication.
 * Mirrors the pattern from src/types/welcome.ts.
 */

import type {
	MaestroTask,
	RunningCard,
	MaestroTab,
} from "../features/maestro/types";

// ============================================================================
// Shared Data Types (serialized for webview)
// ============================================================================

export interface MaestroSpecInfo {
	readonly id: string;
	readonly name: string;
	readonly status: string;
}

// ============================================================================
// Extension -> Webview Messages
// ============================================================================

export interface MaestroStateMessage {
	type: "maestro/state";
	tasks: MaestroTask[];
	sessions: RunningCard[];
	specs: MaestroSpecInfo[];
	activeSpec: string | null;
	groupBySpec: boolean;
	activeTab: MaestroTab;
}

export interface MaestroErrorMessage {
	type: "maestro/error";
	message: string;
}

export type ExtensionToWebviewMessage =
	| MaestroStateMessage
	| MaestroErrorMessage;

// ============================================================================
// Webview -> Extension Messages
// ============================================================================

export interface MaestroReadyMessage {
	type: "maestro/ready";
}

export interface MaestroRefreshMessage {
	type: "maestro/refresh";
}

export interface MaestroStartTaskMessage {
	type: "maestro/start-task";
	taskKey: string;
	prompt: string;
	target: "local" | "cloud";
}

export interface MaestroNewFreeformTaskMessage {
	type: "maestro/new-freeform-task";
	prompt: string;
	target: "local" | "cloud";
}

export interface MaestroFilterSpecMessage {
	type: "maestro/filter-spec";
	specId: string | null;
}

export interface MaestroToggleGroupMessage {
	type: "maestro/toggle-group";
	groupBySpec: boolean;
}

export interface MaestroSwitchTabMessage {
	type: "maestro/switch-tab";
	tab: MaestroTab;
}

export interface MaestroOpenExternalMessage {
	type: "maestro/open-external";
	url: string;
}

export type WebviewToExtensionMessage =
	| MaestroReadyMessage
	| MaestroRefreshMessage
	| MaestroStartTaskMessage
	| MaestroNewFreeformTaskMessage
	| MaestroFilterSpecMessage
	| MaestroToggleGroupMessage
	| MaestroSwitchTabMessage
	| MaestroOpenExternalMessage;

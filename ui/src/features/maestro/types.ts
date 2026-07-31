/**
 * Maestro Board webview types.
 * Mirrors the extension-side types from src/features/maestro/types.ts
 * and src/types/maestro.ts for use in the React webview.
 */

export type BoardColumn =
	| "DRAFT"
	| "TODO"
	| "IN_PROGRESS"
	| "IN_REVIEW"
	| "BLOCKED"
	| "READY"
	| "DONE";

export const BOARD_COLUMNS: BoardColumn[] = [
	"DRAFT",
	"TODO",
	"IN_PROGRESS",
	"IN_REVIEW",
	"BLOCKED",
	"READY",
	"DONE",
];

export type MaestroTab = "board" | "composer" | "list";

export interface MaestroTask {
	readonly spec: string;
	readonly specId: string;
	readonly phase: string;
	readonly id: string;
	readonly title: string;
	readonly done: boolean;
	readonly specStatus: string;
	readonly specHasOpenBlocker: boolean;
}

export interface RunningCard {
	readonly title: string;
	readonly subtitle: string;
	readonly status: string;
	readonly running: boolean;
	readonly taskKey: string | null;
	readonly source: string;
	readonly sessionId: string;
	readonly externalUrl: string | null;
}

export interface MaestroSpecInfo {
	readonly id: string;
	readonly name: string;
	readonly status: string;
}

export interface MaestroState {
	tasks: MaestroTask[];
	sessions: RunningCard[];
	specs: MaestroSpecInfo[];
	activeSpec: string | null;
	groupBySpec: boolean;
	activeTab: MaestroTab;
}

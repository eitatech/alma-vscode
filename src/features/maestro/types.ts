/**
 * Core domain types for the Maestro Board.
 * Ported from JetBrains MaestroData.kt and BoardProjection.kt.
 */

/** Kanban board columns in display order. */
export type BoardColumn =
	| "DRAFT"
	| "TODO"
	| "IN_PROGRESS"
	| "IN_REVIEW"
	| "BLOCKED"
	| "READY"
	| "DONE";

/** All board columns in display order. */
export const BOARD_COLUMNS: BoardColumn[] = [
	"DRAFT",
	"TODO",
	"IN_PROGRESS",
	"IN_REVIEW",
	"BLOCKED",
	"READY",
	"DONE",
];

/** Spec review status mapped to board-level buckets. */
export type BoardSpecStatus =
	| "DRAFT"
	| "CURRENT"
	| "REVIEW"
	| "REOPENED"
	| "ARCHIVED";

/** Input to the board projection logic. */
export interface BoardTaskInput {
	readonly specId: string;
	readonly specStatus: BoardSpecStatus;
	readonly done: boolean;
	readonly hasActiveSession: boolean;
	readonly specHasOpenBlocker: boolean;
	readonly hasFailedSession: boolean;
}

/** A spec task enriched with spec metadata for board display. */
export interface MaestroTask {
	readonly spec: string;
	readonly specId: string;
	readonly phase: string;
	readonly id: string;
	readonly title: string;
	readonly done: boolean;
	readonly specStatus: BoardSpecStatus;
	readonly specHasOpenBlocker: boolean;
}

/** A running or finished agent session linked to a task. */
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

/** Parsed task key reference. */
export interface TaskRef {
	readonly specId: string;
	readonly taskId: string;
}

/** Active UI tab. */
export type MaestroTab = "board" | "composer" | "list";

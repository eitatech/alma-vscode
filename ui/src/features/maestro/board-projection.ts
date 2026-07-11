/**
 * Board projection logic for the webview.
 * Ported from src/features/maestro/board-projection.ts.
 * Duplicated here because the webview cannot import extension-side modules.
 */

import type { BoardColumn, MaestroTask, RunningCard } from "../types";

interface BoardTaskInput {
	specStatus: string;
	done: boolean;
	hasActiveSession: boolean;
	specHasOpenBlocker: boolean;
	hasFailedSession: boolean;
}

export function columnFor(task: BoardTaskInput): BoardColumn {
	switch (task.specStatus) {
		case "DRAFT":
			return "DRAFT";
		case "REVIEW":
			return "IN_REVIEW";
		case "ARCHIVED":
			return "DONE";
		case "CURRENT":
		case "REOPENED": {
			if (task.done) {
				return "READY";
			}
			if (task.hasActiveSession) {
				return "IN_PROGRESS";
			}
			if (task.specHasOpenBlocker || task.hasFailedSession) {
				return "BLOCKED";
			}
			return "TODO";
		}
		default:
			return "DRAFT";
	}
}

/** Task key generation matching the extension-side TaskPrompt.key(). */
export function taskKey(
	specId: string,
	taskId: string,
	taskTitle: string
): string {
	const effectiveTaskId = taskId.trim().length > 0 ? taskId : taskTitle;
	return `${specId}::${effectiveTaskId}`;
}

/** Parse a task key back to specId and taskId. */
export function parseTaskKey(
	key: string
): { specId: string; taskId: string } | null {
	const index = key.indexOf("::");
	if (index < 0) {
		return null;
	}
	const specId = key.substring(0, index);
	const taskId = key.substring(index + 2);
	if (specId.length === 0 || taskId.length === 0) {
		return null;
	}
	return { specId, taskId };
}

/** Group running cards by taskKey, preferring running over non-running. */
function groupCardsByTaskKey(cards: RunningCard[]): Map<string, RunningCard> {
	const byKey = new Map<string, RunningCard>();
	for (const card of cards) {
		if (!card.taskKey) {
			continue;
		}
		const existing = byKey.get(card.taskKey);
		if (!existing || (card.running && !existing.running)) {
			byKey.set(card.taskKey, card);
		}
	}
	return byKey;
}

/** Get the column for a task given the current session state. */
export function getTaskColumn(
	task: MaestroTask,
	cards: RunningCard[]
): { column: BoardColumn; card: RunningCard | null } {
	const cardsByKey = groupCardsByTaskKey(cards);
	const key = taskKey(task.specId, task.id, task.title);
	const card = cardsByKey.get(key) ?? null;

	const hasActiveSession = card?.running ?? false;
	const hasFailedSession =
		card !== null && !card.running && isFailedStatus(card.status);

	return {
		column: columnFor({
			specStatus: task.specStatus,
			done: task.done,
			hasActiveSession,
			specHasOpenBlocker: task.specHasOpenBlocker,
			hasFailedSession,
		}),
		card,
	};
}

function isFailedStatus(status: string): boolean {
	return status === "failed" || status === "cancelled";
}

/** Prompt text generation matching the extension-side TaskPrompt.text(). */
export function taskPromptText(
	specTitle: string,
	phase: string,
	taskId: string,
	taskTitle: string
): string {
	const parts: string[] = ["Implement task"];
	if (taskId.trim().length > 0) {
		parts.push(` ${taskId}`);
	}
	parts.push(`: ${taskTitle}`);
	parts.push(` (spec: ${specTitle}`);
	if (phase.trim().length > 0) {
		parts.push(` — ${phase}`);
	}
	parts.push(")");
	return parts.join("");
}

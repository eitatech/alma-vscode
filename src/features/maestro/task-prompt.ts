/**
 * TaskPrompt - stable key generation and prompt text formatting.
 * Ported from JetBrains TaskPrompt.kt.
 */

import type { TaskRef } from "./types";

const SEPARATOR = "::";

/**
 * Generates a stable task key: "{specId}::{taskId}".
 * Falls back to taskTitle when taskId is blank or whitespace-only.
 */
export function taskPromptKey(
	specId: string,
	taskId: string,
	taskTitle: string
): string {
	const effectiveTaskId = taskId.trim().length > 0 ? taskId : taskTitle;
	return `${specId}${SEPARATOR}${effectiveTaskId}`;
}

/**
 * Parses a task key back to its specId and taskId components.
 * Returns null if the key is malformed (no separator, blank parts).
 * Handles specIds that contain the separator by splitting on the first occurrence only.
 */
export function parseTaskKey(taskKey: string): TaskRef | null {
	const index = taskKey.indexOf(SEPARATOR);
	if (index < 0) {
		return null;
	}
	const specId = taskKey.substring(0, index);
	const taskId = taskKey.substring(index + SEPARATOR.length);
	if (specId.length === 0 || taskId.length === 0) {
		return null;
	}
	return { specId, taskId };
}

/**
 * Generates a natural-language prompt for an agent.
 * Format: "Implement task {taskId}: {title} (spec: {specTitle} — {phase})"
 * Omits taskId when blank, omits phase when blank.
 */
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

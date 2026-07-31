/**
 * BoardProjection - maps task signals to Kanban board columns.
 * Ported from JetBrains BoardProjection.kt.
 *
 * Spec status drives the bucket while the spec is not being worked:
 *   DRAFT -> DRAFT, REVIEW -> IN_REVIEW, ARCHIVED -> DONE
 *
 * Once approved (CURRENT/REOPENED), task signals win in priority order:
 *   1. done -> READY
 *   2. hasActiveSession -> IN_PROGRESS
 *   3. specHasOpenBlocker || hasFailedSession -> BLOCKED
 *   4. otherwise -> TODO
 */

import type { BoardColumn, BoardTaskInput } from "./types";

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

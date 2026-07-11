/**
 * SessionAggregator - collects running/finished sessions from local ACP
 * and cloud providers, mapping them to RunningCards linked by taskKey.
 *
 * Ported from JetBrains MaestroData.kt `runningCards()`.
 */

import type { AgentSession } from "../cloud-agents/types";
import { SessionStatus } from "../cloud-agents/types";
import type { DevinSession } from "../devin/entities";
import type { AgentChatSession } from "../agent-chat/types";
import { isTerminalState } from "../agent-chat/types";
import type { RunningCard } from "./types";
import { parseTaskKey } from "./task-prompt";

/** Devin session URL base for external links. */
const DEVIN_SESSION_BASE = "https://app.devin.ai/sessions/";

/**
 * Build a RunningCard from a cloud AgentSession.
 * The taskKey is derived from the first task's specTaskId if present.
 */
export function cloudSessionToCard(
	session: AgentSession,
	specIdFromPath?: (specPath: string) => string | undefined
): RunningCard {
	const firstTask = session.tasks[0];
	let taskKey: string | null = null;
	if (firstTask?.specTaskId) {
		const specId = specIdFromPath?.(session.specPath);
		if (specId) {
			taskKey = `${specId}::${firstTask.specTaskId}`;
		}
	}

	const running = isCloudSessionRunning(session.status);
	const externalUrl = session.externalUrl ?? null;

	return {
		title: session.providerId,
		subtitle: `cloud · ${session.localId.slice(0, 8)}`,
		status: session.status,
		running,
		taskKey,
		source: "cloud",
		sessionId: session.localId,
		externalUrl,
	};
}

/**
 * Build a RunningCard from a Devin session.
 */
export function devinSessionToCard(session: DevinSession): RunningCard {
	const running = isDevinSessionRunning(session.status);
	const externalUrl =
		session.devinUrl || `${DEVIN_SESSION_BASE}${session.sessionId}`;

	return {
		title: "devin",
		subtitle: `cloud · ${session.sessionId.slice(0, 8)}`,
		status: session.status,
		running,
		taskKey: null,
		source: "cloud",
		sessionId: session.localId,
		externalUrl,
	};
}

/**
 * Build a RunningCard from an AgentChatSession (ACP local session).
 */
export function acpSessionToCard(session: AgentChatSession): RunningCard {
	const running = !isTerminalState(session.lifecycleState);
	const externalUrl = session.cloud?.externalUrl ?? null;
	const source = session.source === "cloud" ? "cloud" : "local";

	return {
		title: session.agentDisplayName,
		subtitle: `ACP · ${session.id.slice(0, 8)}`,
		status: session.lifecycleState,
		running,
		taskKey: null,
		source,
		sessionId: session.id,
		externalUrl,
	};
}

/**
 * Aggregate all RunningCards from cloud sessions and ACP sessions.
 * Cloud sessions take priority (they have taskKey linkage); ACP sessions
 * are included for display but may not have taskKey.
 */
export function aggregateRunningCards(
	cloudSessions: AgentSession[],
	devinSessions: DevinSession[],
	acpSessions: AgentChatSession[],
	specIdFromPath?: (specPath: string) => string | undefined
): RunningCard[] {
	const cards: RunningCard[] = [];

	for (const session of cloudSessions) {
		cards.push(cloudSessionToCard(session, specIdFromPath));
	}

	for (const session of devinSessions) {
		cards.push(devinSessionToCard(session));
	}

	for (const session of acpSessions) {
		cards.push(acpSessionToCard(session));
	}

	return cards;
}

/**
 * Group RunningCards by taskKey for board projection.
 * Returns a Map from taskKey to the best (most recently active) RunningCard.
 */
export function groupCardsByTaskKey(
	cards: RunningCard[]
): Map<string, RunningCard> {
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

/**
 * Get the set of taskKeys that have active (running) sessions.
 */
export function activeTaskKeys(cards: RunningCard[]): Set<string> {
	const keys = new Set<string>();
	for (const card of cards) {
		if (card.taskKey && card.running) {
			keys.add(card.taskKey);
		}
	}
	return keys;
}

/**
 * Get the set of taskKeys that have failed sessions.
 */
export function failedTaskKeys(cards: RunningCard[]): Set<string> {
	const keys = new Set<string>();
	for (const card of cards) {
		if (card.taskKey && !card.running && isFailedStatus(card.status)) {
			keys.add(card.taskKey);
		}
	}
	return keys;
}

/**
 * Group sessions by specId for the session list tab.
 * Free-form sessions (no taskKey or unparseable) go under null.
 */
export function groupSessionsBySpec(
	cards: RunningCard[]
): Map<string | null, RunningCard[]> {
	const grouped = new Map<string | null, RunningCard[]>();
	for (const card of cards) {
		let specId: string | null = null;
		if (card.taskKey) {
			const ref = parseTaskKey(card.taskKey);
			if (ref) {
				specId = ref.specId;
			}
		}
		const list = grouped.get(specId) ?? [];
		list.push(card);
		grouped.set(specId, list);
	}
	return grouped;
}

function isCloudSessionRunning(status: SessionStatus): boolean {
	return status === SessionStatus.PENDING || status === SessionStatus.RUNNING;
}

function isDevinSessionRunning(status: string): boolean {
	return (
		status === "queued" || status === "initializing" || status === "running"
	);
}

function isFailedStatus(status: string): boolean {
	return (
		status === "failed" ||
		status === SessionStatus.FAILED ||
		status === "cancelled" ||
		status === SessionStatus.CANCELLED
	);
}

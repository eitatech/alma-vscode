/**
 * Tests for session-aggregator.ts
 */

import { describe, expect, it } from "vitest";
import {
	cloudSessionToCard,
	acpSessionToCard,
	aggregateRunningCards,
	groupCardsByTaskKey,
	activeTaskKeys,
	failedTaskKeys,
	groupSessionsBySpec,
} from "./session-aggregator";
import type { AgentSession } from "../cloud-agents/types";
import { SessionStatus } from "../cloud-agents/types";
import type { AgentChatSession } from "../agent-chat/types";
import type { RunningCard } from "./types";

function makeCloudSession(overrides: Partial<AgentSession> = {}): AgentSession {
	return {
		localId: "cloud-1",
		providerId: "devin",
		providerSessionId: "dev-123",
		status: SessionStatus.RUNNING,
		branch: "main",
		specPath: "specs/001-auth",
		tasks: [],
		pullRequests: [],
		createdAt: Date.now(),
		updatedAt: Date.now(),
		completedAt: undefined,
		isReadOnly: false,
		...overrides,
	};
}

function makeAcpSession(
	overrides: Partial<AgentChatSession> = {}
): AgentChatSession {
	return {
		id: "acp-1",
		source: "acp",
		agentId: "copilot-cli",
		agentDisplayName: "Copilot CLI",
		capabilities: { source: "none" } as never,
		executionTarget: { kind: "local" },
		lifecycleState: "running",
		trigger: { kind: "user" },
		worktree: null,
		cloud: null,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		workspaceUri: "file:///workspace",
		...overrides,
	};
}

describe("session-aggregator", () => {
	describe("cloudSessionToCard", () => {
		it("converts a running cloud session to a RunningCard", () => {
			const session = makeCloudSession();
			const card = cloudSessionToCard(session);
			expect(card.source).toBe("cloud");
			expect(card.running).toBe(true);
			expect(card.status).toBe(SessionStatus.RUNNING);
			expect(card.sessionId).toBe("cloud-1");
		});

		it("marks completed session as not running", () => {
			const session = makeCloudSession({ status: SessionStatus.COMPLETED });
			const card = cloudSessionToCard(session);
			expect(card.running).toBe(false);
		});

		it("extracts taskKey from first task with specId resolver", () => {
			const session = makeCloudSession({
				specPath: "specs/001-auth",
				tasks: [
					{
						id: "task-1",
						specTaskId: "T001",
						title: "Test",
						description: "",
						priority: "medium",
						status: "in_progress",
					},
				],
			});
			const card = cloudSessionToCard(session, (path) => {
				if (path.includes("001-auth")) {
					return "001-auth";
				}
				return;
			});
			expect(card.taskKey).toBe("001-auth::T001");
		});

		it("returns null taskKey when no specId resolver matches", () => {
			const session = makeCloudSession({
				tasks: [
					{
						id: "task-1",
						specTaskId: "T001",
						title: "Test",
						description: "",
						priority: "medium",
						status: "in_progress",
					},
				],
			});
			const card = cloudSessionToCard(session);
			expect(card.taskKey).toBeNull();
		});
	});

	describe("acpSessionToCard", () => {
		it("converts a running ACP session to a RunningCard", () => {
			const session = makeAcpSession();
			const card = acpSessionToCard(session);
			expect(card.source).toBe("local");
			expect(card.running).toBe(true);
			expect(card.title).toBe("Copilot CLI");
		});

		it("marks completed session as not running", () => {
			const session = makeAcpSession({ lifecycleState: "completed" });
			const card = acpSessionToCard(session);
			expect(card.running).toBe(false);
		});

		it("marks failed session as not running", () => {
			const session = makeAcpSession({ lifecycleState: "failed" });
			const card = acpSessionToCard(session);
			expect(card.running).toBe(false);
		});
	});

	describe("aggregateRunningCards", () => {
		it("combines cloud, devin, and ACP sessions", () => {
			const cards = aggregateRunningCards(
				[makeCloudSession()],
				[],
				[makeAcpSession()]
			);
			expect(cards).toHaveLength(2);
			expect(cards.some((c) => c.source === "cloud")).toBe(true);
			expect(cards.some((c) => c.source === "local")).toBe(true);
		});

		it("returns empty array when no sessions exist", () => {
			const cards = aggregateRunningCards([], [], []);
			expect(cards).toHaveLength(0);
		});
	});

	describe("groupCardsByTaskKey", () => {
		it("groups cards by taskKey, preferring running over non-running", () => {
			const cards: RunningCard[] = [
				{
					title: "devin",
					subtitle: "cloud · 1",
					status: "completed",
					running: false,
					taskKey: "001::T001",
					source: "cloud",
					sessionId: "s1",
					externalUrl: null,
				},
				{
					title: "devin",
					subtitle: "cloud · 2",
					status: "running",
					running: true,
					taskKey: "001::T001",
					source: "cloud",
					sessionId: "s2",
					externalUrl: null,
				},
			];
			const grouped = groupCardsByTaskKey(cards);
			expect(grouped.get("001::T001")?.sessionId).toBe("s2");
		});

		it("skips cards without taskKey", () => {
			const cards: RunningCard[] = [
				{
					title: "devin",
					subtitle: "cloud · 1",
					status: "running",
					running: true,
					taskKey: null,
					source: "cloud",
					sessionId: "s1",
					externalUrl: null,
				},
			];
			const grouped = groupCardsByTaskKey(cards);
			expect(grouped.size).toBe(0);
		});
	});

	describe("activeTaskKeys", () => {
		it("returns set of taskKeys with running sessions", () => {
			const cards: RunningCard[] = [
				{
					title: "a",
					subtitle: "",
					status: "running",
					running: true,
					taskKey: "001::T001",
					source: "cloud",
					sessionId: "s1",
					externalUrl: null,
				},
				{
					title: "b",
					subtitle: "",
					status: "completed",
					running: false,
					taskKey: "001::T002",
					source: "cloud",
					sessionId: "s2",
					externalUrl: null,
				},
			];
			const keys = activeTaskKeys(cards);
			expect(keys.has("001::T001")).toBe(true);
			expect(keys.has("001::T002")).toBe(false);
		});
	});

	describe("failedTaskKeys", () => {
		it("returns set of taskKeys with failed sessions", () => {
			const cards: RunningCard[] = [
				{
					title: "a",
					subtitle: "",
					status: "failed",
					running: false,
					taskKey: "001::T001",
					source: "cloud",
					sessionId: "s1",
					externalUrl: null,
				},
				{
					title: "b",
					subtitle: "",
					status: "completed",
					running: false,
					taskKey: "001::T002",
					source: "cloud",
					sessionId: "s2",
					externalUrl: null,
				},
			];
			const keys = failedTaskKeys(cards);
			expect(keys.has("001::T001")).toBe(true);
			expect(keys.has("001::T002")).toBe(false);
		});
	});

	describe("groupSessionsBySpec", () => {
		it("groups sessions by specId from taskKey", () => {
			const cards: RunningCard[] = [
				{
					title: "a",
					subtitle: "",
					status: "running",
					running: true,
					taskKey: "001::T001",
					source: "cloud",
					sessionId: "s1",
					externalUrl: null,
				},
				{
					title: "b",
					subtitle: "",
					status: "running",
					running: true,
					taskKey: "002::T001",
					source: "cloud",
					sessionId: "s2",
					externalUrl: null,
				},
				{
					title: "c",
					subtitle: "",
					status: "running",
					running: true,
					taskKey: null,
					source: "local",
					sessionId: "s3",
					externalUrl: null,
				},
			];
			const grouped = groupSessionsBySpec(cards);
			expect(grouped.get("001")?.length).toBe(1);
			expect(grouped.get("002")?.length).toBe(1);
			expect(grouped.get(null)?.length).toBe(1);
		});
	});
});

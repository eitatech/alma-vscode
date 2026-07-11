import { describe, expect, it } from "vitest";
import { columnFor } from "./board-projection";
import type { BoardTaskInput } from "./types";

function makeTask(overrides: Partial<BoardTaskInput>): BoardTaskInput {
	return {
		specId: "001",
		specStatus: "CURRENT",
		done: false,
		hasActiveSession: false,
		specHasOpenBlocker: false,
		hasFailedSession: false,
		...overrides,
	};
}

describe("board-projection", () => {
	describe("columnFor - spec status driven", () => {
		it("DRAFT spec -> DRAFT column regardless of task signals", () => {
			expect(columnFor(makeTask({ specStatus: "DRAFT", done: true }))).toBe(
				"DRAFT"
			);
		});

		it("DRAFT spec with active session still goes to DRAFT", () => {
			expect(
				columnFor(makeTask({ specStatus: "DRAFT", hasActiveSession: true }))
			).toBe("DRAFT");
		});

		it("REVIEW spec -> IN_REVIEW column", () => {
			expect(columnFor(makeTask({ specStatus: "REVIEW" }))).toBe("IN_REVIEW");
		});

		it("ARCHIVED spec -> DONE column", () => {
			expect(columnFor(makeTask({ specStatus: "ARCHIVED" }))).toBe("DONE");
		});

		it("ARCHIVED spec with not-done task still goes to DONE", () => {
			expect(columnFor(makeTask({ specStatus: "ARCHIVED", done: false }))).toBe(
				"DONE"
			);
		});
	});

	describe("columnFor - CURRENT/REOPENED task signal priority", () => {
		it("CURRENT + done -> READY", () => {
			expect(columnFor(makeTask({ specStatus: "CURRENT", done: true }))).toBe(
				"READY"
			);
		});

		it("REOPENED + done -> READY", () => {
			expect(columnFor(makeTask({ specStatus: "REOPENED", done: true }))).toBe(
				"READY"
			);
		});

		it("done wins over active session -> READY", () => {
			expect(
				columnFor(
					makeTask({
						specStatus: "CURRENT",
						done: true,
						hasActiveSession: true,
					})
				)
			).toBe("READY");
		});

		it("done wins over blocker -> READY", () => {
			expect(
				columnFor(
					makeTask({
						specStatus: "CURRENT",
						done: true,
						specHasOpenBlocker: true,
					})
				)
			).toBe("READY");
		});

		it("CURRENT + active session (not done) -> IN_PROGRESS", () => {
			expect(
				columnFor(makeTask({ specStatus: "CURRENT", hasActiveSession: true }))
			).toBe("IN_PROGRESS");
		});

		it("active session wins over blocker -> IN_PROGRESS", () => {
			expect(
				columnFor(
					makeTask({
						specStatus: "CURRENT",
						hasActiveSession: true,
						specHasOpenBlocker: true,
					})
				)
			).toBe("IN_PROGRESS");
		});

		it("active session wins over failed session -> IN_PROGRESS", () => {
			expect(
				columnFor(
					makeTask({
						specStatus: "CURRENT",
						hasActiveSession: true,
						hasFailedSession: true,
					})
				)
			).toBe("IN_PROGRESS");
		});

		it("CURRENT + open blocker (no session, not done) -> BLOCKED", () => {
			expect(
				columnFor(makeTask({ specStatus: "CURRENT", specHasOpenBlocker: true }))
			).toBe("BLOCKED");
		});

		it("CURRENT + failed session (no active, not done) -> BLOCKED", () => {
			expect(
				columnFor(makeTask({ specStatus: "CURRENT", hasFailedSession: true }))
			).toBe("BLOCKED");
		});

		it("REOPENED + open blocker -> BLOCKED", () => {
			expect(
				columnFor(
					makeTask({ specStatus: "REOPENED", specHasOpenBlocker: true })
				)
			).toBe("BLOCKED");
		});

		it("CURRENT + no signals -> TODO", () => {
			expect(columnFor(makeTask({ specStatus: "CURRENT" }))).toBe("TODO");
		});

		it("REOPENED + no signals -> TODO", () => {
			expect(columnFor(makeTask({ specStatus: "REOPENED" }))).toBe("TODO");
		});
	});
});

import { describe, expect, it } from "vitest";
import { taskPromptKey, parseTaskKey, taskPromptText } from "./task-prompt";

describe("task-prompt", () => {
	describe("taskPromptKey", () => {
		it("generates key with specId and taskId", () => {
			expect(taskPromptKey("001", "T040", "T040 Validate")).toBe("001::T040");
		});

		it("falls back to taskTitle when taskId is blank", () => {
			expect(taskPromptKey("001", "", "Some title")).toBe("001::Some title");
		});

		it("falls back to taskTitle when taskId is whitespace-only", () => {
			expect(taskPromptKey("001", "   ", "Fallback")).toBe("001::Fallback");
		});

		it("handles specId with numbers", () => {
			expect(taskPromptKey("010-auth", "T1.1", "Create types")).toBe(
				"010-auth::T1.1"
			);
		});
	});

	describe("parseTaskKey", () => {
		it("parses a valid key back to specId and taskId", () => {
			const ref = parseTaskKey("001::T040");
			expect(ref).toEqual({ specId: "001", taskId: "T040" });
		});

		it("parses key with title fallback", () => {
			const ref = parseTaskKey("001::Some title");
			expect(ref).toEqual({ specId: "001", taskId: "Some title" });
		});

		it("returns null when separator is missing", () => {
			expect(parseTaskKey("001T040")).toBeNull();
		});

		it("returns null when specId is blank", () => {
			expect(parseTaskKey("::T040")).toBeNull();
		});

		it("returns null when taskId is blank", () => {
			expect(parseTaskKey("001::")).toBeNull();
		});

		it("handles specId containing separator characters", () => {
			const ref = parseTaskKey("a::b::c");
			expect(ref).toEqual({ specId: "a", taskId: "b::c" });
		});
	});

	describe("taskPromptText", () => {
		it("generates prompt with taskId, title, spec, and phase", () => {
			expect(
				taskPromptText("Observability", "Phase 6", "T040", "Validate checklist")
			).toBe(
				"Implement task T040: Validate checklist (spec: Observability — Phase 6)"
			);
		});

		it("omits taskId when blank", () => {
			expect(taskPromptText("Auth", "Phase 1", "", "Create types")).toBe(
				"Implement task: Create types (spec: Auth — Phase 1)"
			);
		});

		it("omits phase when blank", () => {
			expect(taskPromptText("Auth", "", "T001", "Setup")).toBe(
				"Implement task T001: Setup (spec: Auth)"
			);
		});

		it("omits both taskId and phase when blank", () => {
			expect(taskPromptText("Auth", "", "", "Do thing")).toBe(
				"Implement task: Do thing (spec: Auth)"
			);
		});
	});

	describe("key round-trip", () => {
		it("key then parseKey returns original components", () => {
			const key = taskPromptKey("005-api", "T2.3", "Some title");
			const ref = parseTaskKey(key);
			expect(ref).toEqual({ specId: "005-api", taskId: "T2.3" });
		});

		it("key with title fallback round-trips", () => {
			const key = taskPromptKey("005-api", "", "Freeform task");
			const ref = parseTaskKey(key);
			expect(ref).toEqual({ specId: "005-api", taskId: "Freeform task" });
		});
	});
});

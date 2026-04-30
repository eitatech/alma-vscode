import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { OrchestrationFeature } from "../../../ui/src/features/orchestration";

describe("OrchestrationFeature", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders loading state before the first snapshot arrives", () => {
		render(<OrchestrationFeature />);
		expect(screen.getByText("Loading orchestration state...")).toBeTruthy();
	});

	it("renders bucket columns", async () => {
		render(<OrchestrationFeature />);
		window.dispatchEvent(
			new MessageEvent("message", {
				data: {
					type: "orchestration/snapshot",
					payload: {
						sessions: [
							{
								id: "agent-chat:1",
								source: "agent-chat",
								sourceSessionId: "1",
								title: "OpenCode (code)",
								agentName: "OpenCode",
								state: "running",
								bucket: "active",
								createdAt: Date.now(),
								updatedAt: Date.now(),
								lastVisibleActivityAt: Date.now(),
								isBlocked: false,
								executionTargetLabel: "Local",
							},
						],
						generatedAt: Date.now(),
						degradedReasons: [],
					},
				},
			})
		);
		expect(
			await screen.findByTestId("orchestration-bucket-active")
		).toBeTruthy();
		expect(
			await screen.findByTestId("orchestration-bucket-waiting")
		).toBeTruthy();
		expect(
			await screen.findByTestId("orchestration-bucket-completed")
		).toBeTruthy();
		expect(
			await screen.findByTestId("orchestration-bucket-failed")
		).toBeTruthy();
	});
});

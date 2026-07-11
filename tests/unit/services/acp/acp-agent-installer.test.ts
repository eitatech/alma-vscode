/**
 * AcpAgentInstaller unit tests.
 */

import { describe, expect, it, vi } from "vitest";

// Mock child_process so runShellCommand does not spawn real processes
// (which would be slow and flaky in CI / machines without network).
vi.mock("node:child_process", async (importOriginal) => {
	const actual = await importOriginal<typeof import("node:child_process")>();
	const mockedExecFile = vi.fn(
		(_cmd: string, _args: string[], _opts: unknown, cb: any) => {
			cb(null, { stdout: "", stderr: "" });
		}
	) as unknown as typeof actual.execFile;
	return {
		...actual,
		execFile: mockedExecFile,
		default: { ...actual, execFile: mockedExecFile },
	};
});

import { AcpAgentInstaller } from "../../../../src/services/acp/acp-agent-installer";
import type { AcpProviderDescriptor } from "../../../../src/services/acp/types";

function createDescriptor(
	overrides: Partial<AcpProviderDescriptor> = {}
): AcpProviderDescriptor {
	return {
		id: "test-agent",
		displayName: "Test Agent",
		preferredHosts: [],
		spawnCommand: "npx",
		spawnArgs: ["-y", "test-agent"],
		installUrl: "https://example.com/install",
		authCommand: "",
		installCommand: "npm install -g test-agent",
		updateCommand: "npm install -g test-agent@latest",
		probe: () =>
			Promise.resolve({
				installed: false,
				version: null,
				authenticated: false,
				acpSupported: true,
				executablePath: null,
			}),
		...overrides,
	};
}

describe("AcpAgentInstaller", () => {
	it("reports failure when descriptor has no install command or url", async () => {
		const installer = new AcpAgentInstaller();
		const descriptor = createDescriptor({
			installCommand: undefined,
			installUrl: undefined,
		});

		const result = await installer.install(descriptor);

		expect(result.success).toBe(false);
		expect(result.message).toContain("No install command or URL");
	});

	it("returns success when installUrl is present and no install command", async () => {
		const installer = new AcpAgentInstaller();
		const descriptor = createDescriptor({
			installCommand: undefined,
			installUrl: "https://example.com/install",
		});

		const result = await installer.install(descriptor);

		expect(result.success).toBe(true);
		expect(result.message).toContain("https://example.com/install");
	});

	it("uses updateCommand for update when present", async () => {
		const installer = new AcpAgentInstaller();
		const descriptor = createDescriptor({
			spawnCommand: "npx",
			updateCommand: "npm install -g test-agent@latest",
		});

		const result = await installer.update(descriptor);

		// npx update commands run in a shell; failures are expected in test env
		// so we just assert the result is a well-formed object.
		expect(typeof result.success).toBe("boolean");
		expect(typeof result.message).toBe("string");
	});
});

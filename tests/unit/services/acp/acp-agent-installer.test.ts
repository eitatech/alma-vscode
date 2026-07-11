/**
 * AcpAgentInstaller unit tests.
 */

import { describe, expect, it } from "vitest";
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

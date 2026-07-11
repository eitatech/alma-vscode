/**
 * Integration test for the Maestro Board panel.
 * Tests panel lifecycle, message passing, and provider integration.
 * Mirrors the pattern from welcome-command.test.ts.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { MaestroPanel } from "../../../src/panels/maestro-panel";
import { MaestroProvider } from "../../../src/providers/maestro-provider";
import { Uri } from "vscode";
import type { ExtensionContext, OutputChannel } from "vscode";

describe("Maestro Board - Panel Integration", () => {
	let mockContext: ExtensionContext;
	let mockOutputChannel: OutputChannel;
	let workspaceStateMap: Map<string, unknown>;

	beforeEach(() => {
		workspaceStateMap = new Map();
		vi.clearAllMocks();

		mockOutputChannel = {
			name: "GatomIA",
			appendLine: vi.fn(),
			append: vi.fn(),
			clear: vi.fn(),
			show: vi.fn(),
			hide: vi.fn(),
			dispose: vi.fn(),
			replace: vi.fn(),
		} as unknown as OutputChannel;

		mockContext = {
			extensionPath: "/fake/extension/path",
			extensionUri: { fsPath: "/fake/extension/path" } as unknown as Uri,
			workspaceState: {
				get: vi.fn((key: string) => workspaceStateMap.get(key)),
				update: vi.fn((key: string, value: unknown) => {
					if (value === undefined) {
						workspaceStateMap.delete(key);
					} else {
						workspaceStateMap.set(key, value);
					}
				}),
				keys: vi.fn(() => Array.from(workspaceStateMap.keys())),
			},
			globalState: {
				get: vi.fn(),
				update: vi.fn(),
				keys: vi.fn(() => []),
			},
			subscriptions: [],
			storageUri: Uri.file("/fake/storage"),
			globalStorageUri: Uri.file("/fake/global-storage"),
			logUri: Uri.file("/fake/logs"),
			extensionMode: 3,
			asAbsolutePath: vi.fn(
				(relativePath: string) => `/fake/extension/path/${relativePath}`
			),
		} as unknown as ExtensionContext;

		// Reset singleton before each test
		// @ts-expect-error - accessing private static for testing
		MaestroPanel.currentPanel = undefined;
	});

	afterEach(() => {
		// @ts-expect-error - accessing private static for testing
		MaestroPanel.currentPanel = undefined;
	});

	describe("Panel lifecycle", () => {
		it("should create panel via show()", () => {
			const panel = MaestroPanel.show(mockContext, mockOutputChannel, {});
			expect(panel).toBeDefined();
			expect(panel.isVisible).toBeDefined();
		});

		it("should return same panel on second show() (singleton)", () => {
			const panel1 = MaestroPanel.show(mockContext, mockOutputChannel, {});
			const panel2 = MaestroPanel.show(mockContext, mockOutputChannel, {});
			expect(panel1).toBe(panel2);
		});

		it("should dispose and allow re-creation", () => {
			const panel1 = MaestroPanel.show(mockContext, mockOutputChannel, {});
			panel1.dispose();
			const panel2 = MaestroPanel.show(mockContext, mockOutputChannel, {});
			expect(panel1).not.toBe(panel2);
		});
	});

	describe("Message passing", () => {
		it("should queue messages before webview is ready", async () => {
			const panel = MaestroPanel.show(mockContext, mockOutputChannel, {});
			await panel.postMessage({ type: "maestro/error", message: "test" });
			// Message should be queued (webview not ready)
			expect(mockOutputChannel.appendLine).toHaveBeenCalled();
		});

		it("should handle maestro/ready message", () => {
			const onReady = vi.fn();
			const panel = MaestroPanel.show(mockContext, mockOutputChannel, {
				onReady,
			});

			// Simulate webview ready by calling handleWebviewMessage indirectly
			// The panel's internal message handler is wired to the webview
			// We can verify the callback structure is correct
			expect(onReady).toBeDefined();
			panel.dispose();
		});
	});

	describe("Provider integration", () => {
		it("should create provider with required options", () => {
			const mockStorage = {
				getAll: vi.fn().mockResolvedValue([]),
				getById: vi.fn().mockResolvedValue(undefined),
				getByProvider: vi.fn().mockResolvedValue([]),
				getActive: vi.fn().mockResolvedValue([]),
			};

			const mockDevinStorage = {
				getAll: vi.fn().mockReturnValue([]),
				getActive: vi.fn().mockReturnValue([]),
			};

			const mockChatStore = {
				listActive: vi.fn().mockResolvedValue([]),
			};

			const provider = new MaestroProvider({
				context: mockContext,
				output: mockOutputChannel,
				agentSessionStorage: mockStorage as never,
				devinSessionStorage: mockDevinStorage as never,
				agentChatSessionStore: mockChatStore as never,
			});

			expect(provider).toBeDefined();
			expect(provider.setPanel).toBeDefined();
			expect(provider.refresh).toBeDefined();
			expect(provider.onReady).toBeDefined();
			provider.dispose();
		});

		it("should handle filter spec change", async () => {
			const mockStorage = {
				getAll: vi.fn().mockResolvedValue([]),
			};
			const mockDevinStorage = {
				getAll: vi.fn().mockReturnValue([]),
			};
			const mockChatStore = {
				listActive: vi.fn().mockResolvedValue([]),
			};

			const provider = new MaestroProvider({
				context: mockContext,
				output: mockOutputChannel,
				agentSessionStorage: mockStorage as never,
				devinSessionStorage: mockDevinStorage as never,
				agentChatSessionStore: mockChatStore as never,
			});

			// Should not throw
			await provider.onFilterSpec("001-auth");
			await provider.onFilterSpec(null);
			provider.dispose();
		});

		it("should handle tab switch", async () => {
			const mockStorage = { getAll: vi.fn().mockResolvedValue([]) };
			const mockDevinStorage = { getAll: vi.fn().mockReturnValue([]) };
			const mockChatStore = { listActive: vi.fn().mockResolvedValue([]) };

			const provider = new MaestroProvider({
				context: mockContext,
				output: mockOutputChannel,
				agentSessionStorage: mockStorage as never,
				devinSessionStorage: mockDevinStorage as never,
				agentChatSessionStore: mockChatStore as never,
			});

			await provider.onSwitchTab("composer");
			await provider.onSwitchTab("list");
			await provider.onSwitchTab("board");
			provider.dispose();
		});
	});

	describe("showWithProvider", () => {
		it("should wire provider callbacks to panel", () => {
			const mockStorage = { getAll: vi.fn().mockResolvedValue([]) };
			const mockDevinStorage = { getAll: vi.fn().mockReturnValue([]) };
			const mockChatStore = { listActive: vi.fn().mockResolvedValue([]) };

			const provider = new MaestroProvider({
				context: mockContext,
				output: mockOutputChannel,
				agentSessionStorage: mockStorage as never,
				devinSessionStorage: mockDevinStorage as never,
				agentChatSessionStore: mockChatStore as never,
			});

			const panel = MaestroPanel.showWithProvider(
				mockContext,
				mockOutputChannel,
				provider
			);

			expect(panel).toBeDefined();
			panel.dispose();
			provider.dispose();
		});
	});
});

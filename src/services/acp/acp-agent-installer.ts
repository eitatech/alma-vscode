import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { env, type Terminal, Uri, window } from "vscode";
import type { AcpProviderDescriptor } from "./types";

const execFileAsync = promisify(execFile);
const INSTALL_TERMINAL_NAME = "GatomIA - ACP Agent Install";
const COMMAND_SPLIT_RE = /\s+/;

export interface AcpAgentInstallerOptions {
	readonly outputChannel?: { appendLine(value: string): void };
}

export interface AcpInstallResult {
	success: boolean;
	message: string;
	installedVersion?: string | null;
}

/**
 * Handles installation and update commands for ACP Registry agents.
 *
 * For npx-backed providers it runs `npm install -g <package>` (or the
 * provided update command). For binary providers it opens a terminal with
 * the pre-generated download/extract script and gives the user control to
 * finish the install. In both cases the result is reported back so the
 * caller can refresh the probe cache.
 */
export class AcpAgentInstaller {
	private readonly outputChannel?: { appendLine(value: string): void };
	private installTerminal: Terminal | undefined;

	constructor(options: AcpAgentInstallerOptions = {}) {
		this.outputChannel = options.outputChannel;
	}

	async install(descriptor: AcpProviderDescriptor): Promise<AcpInstallResult> {
		if (descriptor.installCommand) {
			return this.runInstallCommand(descriptor, descriptor.installCommand);
		}
		if (descriptor.installUrl) {
			await this.openInstallUrl(descriptor.installUrl);
			return {
				success: true,
				message: `Opened ${descriptor.installUrl} in your browser.`,
			};
		}
		return {
			success: false,
			message: `No install command or URL for ${descriptor.displayName}.`,
		};
	}

	async update(descriptor: AcpProviderDescriptor): Promise<AcpInstallResult> {
		if (descriptor.updateCommand) {
			return this.runInstallCommand(descriptor, descriptor.updateCommand);
		}
		if (descriptor.installCommand) {
			return this.runInstallCommand(descriptor, descriptor.installCommand);
		}
		if (descriptor.installUrl) {
			await this.openInstallUrl(descriptor.installUrl);
			return {
				success: true,
				message: `Opened ${descriptor.installUrl} in your browser.`,
			};
		}
		return {
			success: false,
			message: `No update command or URL for ${descriptor.displayName}.`,
		};
	}

	private async runInstallCommand(
		descriptor: AcpProviderDescriptor,
		command: string
	): Promise<AcpInstallResult> {
		// For binary providers we prefer opening a terminal so the user can
		// see and control the download/extract process.
		if (descriptor.spawnCommand !== "npx") {
			this.sendToTerminal(command);
			return {
				success: true,
				message:
					"Install command sent to terminal. Run it, then refresh the agent list.",
			};
		}

		try {
			this.outputChannel?.appendLine(`[AcpAgentInstaller] Running: ${command}`);
			await this.runShellCommand(command);
			const installedVersion = await this.probeVersionAfterInstall(descriptor);
			return {
				success: true,
				message: `${descriptor.displayName} installed successfully.`,
				installedVersion,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			this.outputChannel?.appendLine(
				`[AcpAgentInstaller] Install failed: ${message}`
			);
			return {
				success: false,
				message: `Failed to install ${descriptor.displayName}: ${message}`,
			};
		}
	}

	private sendToTerminal(command: string): void {
		const terminal = this.getOrCreateTerminal();
		terminal.show(true);
		terminal.sendText(command, true);
	}

	private getOrCreateTerminal(): Terminal {
		if (this.installTerminal && !this.installTerminal.exitStatus) {
			return this.installTerminal;
		}
		this.installTerminal = window.createTerminal({
			name: INSTALL_TERMINAL_NAME,
		});
		return this.installTerminal;
	}

	private async runShellCommand(command: string): Promise<void> {
		// Parse the command string into an executable and arguments array
		// to avoid shell injection through metacharacters in registry-sourced
		// command strings. We use execFile (no shell) so each argument is
		// passed literally to the child process.
		const parts = command.trim().split(COMMAND_SPLIT_RE);
		if (parts.length === 0 || !parts[0]) {
			throw new Error(`Invalid install command: "${command}"`);
		}
		const executable = parts[0];
		const args = parts.slice(1);
		await execFileAsync(executable, args, {
			timeout: 120_000,
			shell: false,
		});
	}

	private async openInstallUrl(url: string): Promise<void> {
		// Only allow http/https URLs to prevent opening arbitrary URI schemes
		// (file://, javascript:, etc.) that could be exploited.
		const lowerUrl = url.toLowerCase();
		if (!(lowerUrl.startsWith("https://") || lowerUrl.startsWith("http://"))) {
			this.outputChannel?.appendLine(
				`[AcpAgentInstaller] Refused to open URL with unsupported scheme: ${url}`
			);
			return;
		}
		await env.openExternal(Uri.parse(url));
	}

	private async probeVersionAfterInstall(
		descriptor: AcpProviderDescriptor
	): Promise<string | null> {
		try {
			const probe = await descriptor.probe();
			return probe.version;
		} catch {
			return null;
		}
	}
}

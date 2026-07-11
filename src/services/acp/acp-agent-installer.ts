import { execFile } from "node:child_process";
import { platform } from "node:os";
import { promisify } from "node:util";
import { commands, env, type Terminal, Uri, window } from "vscode";
import type { AcpProviderDescriptor } from "./types";

const execFileAsync = promisify(execFile);
const INSTALL_TERMINAL_NAME = "GatomIA - ACP Agent Install";

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
		const shell = platform() === "win32" ? "cmd" : "/bin/sh";
		const shellFlag = platform() === "win32" ? "/c" : "-c";
		await execFileAsync(shell, [shellFlag, command], { timeout: 120_000 });
	}

	private async openInstallUrl(url: string): Promise<void> {
		if (url.startsWith("https://")) {
			await env.openExternal(Uri.parse(url));
		} else {
			await commands.executeCommand("workbench.action.openUrl", Uri.parse(url));
		}
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

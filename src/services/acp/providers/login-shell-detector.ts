/**
 * Shared login-shell PATH detection for ACP provider probes.
 *
 * The VS Code Extension Host does not always inherit the user's shell
 * profile PATH (`.zshrc`, `.bashrc`, fish config, etc.). This module
 * provides helpers that spawn the user's login shell to resolve binaries
 * and run commands with the full user PATH, so agents installed via
 * brew, bun, volta, asdf, mise, nix, etc. are detected correctly.
 *
 * Mirrors the approach used by `KnownAgentDetector` but is self-contained
 * so it can be used by the built-in provider probes (Devin, Gemini)
 * without pulling in the hooks-layer detector.
 */

import { execFile as execFileCb } from "node:child_process";
import { homedir } from "node:os";
import { platform } from "node:os";
import { promisify } from "node:util";

const execFileAsync = promisify(execFileCb);
const WHITESPACE_SPLIT_RE = /\s/;

/**
 * Returns the user's PATH extended with common CLI tool installation
 * directories, mirroring `KnownAgentDetector.getExtendedPath`.
 */
export function getExtendedPath(): string {
	const home = homedir();
	const additionalPaths = [
		`${home}/.local/bin`,
		`${home}/.cargo/bin`,
		`${home}/.bun/bin`,
		`${home}/.deno/bin`,
		`${home}/.langflow/uv`,
		`${home}/.astral/uv/bin`,
		`${home}/.uv/bin`,
		"/opt/homebrew/bin",
		"/usr/local/bin",
	];
	const currentPath = process.env.PATH || "";
	return [...additionalPaths, currentPath].join(":");
}

/**
 * Resolves a binary through the user's login shell PATH on Unix, so any
 * PATH configuration in `.zshrc`, `.bashrc`, fish config, etc. is honoured.
 * On Windows, uses `where.exe` with the extended PATH.
 *
 * Returns the resolved executable path or `null`.
 */
export async function resolveViaLoginShell(
	binary: string,
	timeoutMs: number
): Promise<string | null> {
	const extendedPath = getExtendedPath();
	if (platform() === "win32") {
		try {
			const { stdout } = await execFileAsync("where.exe", [binary], {
				timeout: timeoutMs,
				env: { ...process.env, PATH: extendedPath },
			});
			const path = stdout.trim().split(WHITESPACE_SPLIT_RE)[0];
			return path || null;
		} catch {
			return null;
		}
	}
	const shell = process.env.SHELL || "/bin/sh";
	try {
		const { stdout } = await execFileAsync(
			shell,
			["-l", "-c", `command -v ${binary}`],
			{
				timeout: timeoutMs,
				env: { ...process.env, PATH: extendedPath },
			}
		);
		const path = stdout.trim().split(WHITESPACE_SPLIT_RE)[0];
		if (!path?.includes("/")) {
			return null;
		}
		return path;
	} catch {
		return null;
	}
}

/**
 * Run a shell command through the user's login shell so the user's
 * full PATH (from `.zshrc`, `.bashrc`, etc.) is available.
 *
 * Returns the stdout/stderr output and whether the command succeeded.
 * Never throws — errors are captured in the returned object.
 */
export async function runViaLoginShell(
	command: string,
	timeoutMs: number
): Promise<{ success: boolean; output: string; error?: string }> {
	if (platform() === "win32") {
		// On Windows, login shell concept doesn't apply — the extended
		// PATH from getExtendedPath is sufficient because Windows package
		// managers all write to the system/user PATH.
		return { success: false, output: "", error: "not supported on Windows" };
	}
	const shell = process.env.SHELL || "/bin/sh";
	const extendedPath = getExtendedPath();
	try {
		const { stdout, stderr } = await execFileAsync(
			shell,
			["-l", "-c", command],
			{
				timeout: timeoutMs,
				env: { ...process.env, PATH: extendedPath },
			}
		);
		return {
			success: true,
			output: stdout.trim() || stderr.trim(),
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return { success: false, output: "", error: message };
	}
}

/**
 * provider-bridge — converts entries from the local known-agent catalog and
 * the remote ACP Registry into runnable {@link AcpProviderDescriptor}s.
 *
 * This module is intentionally side-effect-free: it only assembles
 * descriptors. Spawning is handled by `AcpSessionManager` / `AcpClient`.
 *
 * @see specs/018-agent-chat-panel — Plan A.3
 */

import { arch, platform } from "node:os";
import type {
	KnownAgentEntry,
	InstallCheckStrategy,
} from "../../features/hooks/services/known-agent-catalog";
import type { KnownAgentDetector } from "../../features/hooks/services/known-agent-detector";
import { checkCLI, locateCLIExecutable } from "../../utils/cli-detector";
import type {
	RemoteRegistryBinaryEntry,
	RemoteRegistryEntry,
} from "./acp-provider-registry";
import type { AcpProviderDescriptor, AcpProviderProbe } from "./types";

const COMMAND_SPLIT_RE = /\s+/;
const RELATIVE_PREFIX_RE = /^\.\//;
const VERSION_FLAG_TIMEOUT_MS = 5000;
const NPX_PACKAGE_NAME_RE = /(@[^/]+\/[^@]+)@.+/;

function archKeyFor(cpu: string): "aarch64" | "x86_64" | undefined {
	if (cpu === "arm64" || cpu === "arm") {
		return "aarch64";
	}
	if (cpu === "x64") {
		return "x86_64";
	}
	return;
}

// ---------------------------------------------------------------------------
// Platform handling
// ---------------------------------------------------------------------------

export type ProviderBridgePlatform =
	| "darwin-aarch64"
	| "darwin-x86_64"
	| "linux-aarch64"
	| "linux-x86_64"
	| "windows-aarch64"
	| "windows-x86_64";

/**
 * Best-effort mapping of Node's `os.platform()` + `os.arch()` to the
 * 6-key matrix used by the ACP Registry. Returns `undefined` when the host
 * doesn't match any supported combination (BSD, exotic Linux ARMs, etc.).
 */
export function detectHostPlatform(): ProviderBridgePlatform | undefined {
	const os = platform();
	const archKey = archKeyFor(arch());
	if (!archKey) {
		return;
	}
	if (os === "darwin") {
		return `darwin-${archKey}` as ProviderBridgePlatform;
	}
	if (os === "linux") {
		return `linux-${archKey}` as ProviderBridgePlatform;
	}
	if (os === "win32") {
		return `windows-${archKey}` as ProviderBridgePlatform;
	}
	return;
}

/**
 * Picks the binary entry for the requested platform from a registry-shaped
 * map. Returns `undefined` when the key is absent.
 */
export function selectPlatformBinary(
	binaries: Record<string, RemoteRegistryBinaryEntry> | undefined,
	preferred: ProviderBridgePlatform
): RemoteRegistryBinaryEntry | undefined {
	if (!binaries) {
		return;
	}
	return binaries[preferred];
}

// ---------------------------------------------------------------------------
// Local catalog -> AcpProviderDescriptor
// ---------------------------------------------------------------------------

/**
 * Build a runnable descriptor for a local catalog entry. The probe delegates
 * to {@link KnownAgentDetector.isInstalledAny} so the existing detection
 * pipeline (login shell PATH + npm-global lookups) drives availability.
 */
export function createDescriptorFromKnownAgent(
	entry: KnownAgentEntry,
	detector: KnownAgentDetector
): AcpProviderDescriptor {
	const [spawnCommand, ...spawnArgs] = entry.agentCommand
		.trim()
		.split(COMMAND_SPLIT_RE);
	if (!spawnCommand) {
		throw new Error(
			`[provider-bridge] empty agentCommand for known agent '${entry.id}'`
		);
	}

	return {
		id: entry.id,
		displayName: entry.displayName,
		preferredHosts: [],
		spawnCommand,
		spawnArgs,
		installUrl: entry.installUrl ?? "",
		authCommand: "",
		source: "local",
		description: entry.description,
		probe: () => probeKnownAgent(entry.installChecks, detector),
	};
}

async function probeKnownAgent(
	checks: readonly InstallCheckStrategy[],
	detector: KnownAgentDetector
): Promise<AcpProviderProbe> {
	try {
		const installed = await detector.isInstalledAny([...checks]);
		return {
			installed,
			version: null,
			authenticated: installed, // Local catalog has no first-class auth probe.
			acpSupported: installed,
			executablePath: null,
		};
	} catch (error) {
		return {
			installed: false,
			version: null,
			authenticated: false,
			acpSupported: false,
			executablePath: null,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

// ---------------------------------------------------------------------------
// Remote registry -> AcpProviderDescriptor
// ---------------------------------------------------------------------------

export interface RemoteDescriptorOptions {
	/** Override the host platform — primarily for tests. */
	platform: ProviderBridgePlatform;
}

/**
 * Build a runnable descriptor for a remote registry entry. Prefers a
 * platform-specific binary archive when present and falls back to the npx
 * channel otherwise.
 *
 * Probing is now real: it checks the local filesystem / PATH for the binary
 * (or globally installed npm package) and reports the installed version so
 * the UI can offer install or update actions. The `npx` fallback still lets
 * `npx -y <package>` lazily download on spawn, but detection lets users see
 * what is already installed.
 */
export function createDescriptorFromRemoteEntry(
	entry: RemoteRegistryEntry,
	options: RemoteDescriptorOptions
): AcpProviderDescriptor {
	const distribution = entry.distribution;
	const binary = selectPlatformBinary(distribution?.binary, options.platform);

	let spawnCommand: string;
	let spawnArgs: string[];
	let canRunViaNpx = false;
	let npxPackage: string | undefined;
	let installCommand: string | undefined;
	let updateCommand: string | undefined;

	if (binary) {
		// The CDN ships `cmd` as a bare executable name (`./agent`). We strip
		// the `./` prefix when it's there because we will spawn from PATH after
		// the user has placed the unpacked archive in a known location. (For
		// v1 we treat binary entries as opaque commands; the user is expected
		// to install the archive themselves.)
		spawnCommand = binary.cmd.replace(RELATIVE_PREFIX_RE, "");
		spawnArgs = [...(binary.args ?? [])];
		installCommand = buildBinaryInstallCommand(binary, entry);
	} else if (distribution?.npx) {
		canRunViaNpx = true;
		npxPackage = distribution.npx.package;
		spawnCommand = "npx";
		spawnArgs = [
			"-y",
			distribution.npx.package,
			...(distribution.npx.args ?? []),
		];
		installCommand = `npm install -g ${npxPackage}`;
		updateCommand = `npm install -g ${npxPackage}`;
	} else {
		// Should never happen: `isValidRemoteEntry` filters these out at fetch
		// time. We keep a defensive fallback so downstream code can still build
		// a descriptor without throwing.
		spawnCommand = entry.id;
		spawnArgs = [];
	}

	const latestVersion = entry.version;
	const installUrl = entry.installUrl ?? entry.repository ?? "";

	return {
		id: entry.id,
		displayName: entry.displayName,
		preferredHosts: [],
		spawnCommand,
		spawnArgs,
		installUrl,
		authCommand: "",
		source: "remote",
		description: entry.description,
		iconUrl: entry.icon,
		latestVersion,
		installCommand,
		updateCommand,
		probe: () =>
			probeRemoteAgent({
				spawnCommand,
				spawnArgs,
				canRunViaNpx,
				npxPackage,
				latestVersion,
				installUrl,
			}),
	};
}

interface ProbeRemoteAgentOptions {
	spawnCommand: string;
	spawnArgs: string[];
	canRunViaNpx: boolean;
	npxPackage: string | undefined;
	latestVersion: string | undefined;
	installUrl: string;
}

async function probeRemoteAgent(
	options: ProbeRemoteAgentOptions
): Promise<AcpProviderProbe> {
	try {
		// If the provider runs through npx, prefer checking the globally
		// installed package first to avoid a network download during probe.
		if (options.npxPackage) {
			const npmVersion = await probeNpmGlobalPackageVersion(options.npxPackage);
			if (npmVersion.installed) {
				return {
					installed: true,
					version: npmVersion.version,
					authenticated: false,
					acpSupported: true,
					executablePath: null,
					canRunViaNpx: true,
					npxPackage: options.npxPackage,
					latestVersion: options.latestVersion ?? null,
				};
			}
		}

		// Binary / non-npx path: resolve the binary on PATH and ask for its
		// version. For npx-only providers, this also catches cases where the
		// binary is on PATH via a different package manager (e.g. bun, brew).
		const executable = await locateCLIExecutable(
			options.spawnCommand,
			VERSION_FLAG_TIMEOUT_MS
		);
		if (executable) {
			const version = await probeBinaryVersion(
				options.spawnCommand,
				options.spawnArgs
			);
			return {
				installed: true,
				version,
				authenticated: false,
				acpSupported: true,
				executablePath: executable,
				canRunViaNpx: options.canRunViaNpx,
				npxPackage: options.npxPackage,
				latestVersion: options.latestVersion ?? null,
			};
		}

		return {
			installed: false,
			version: null,
			authenticated: false,
			acpSupported: true,
			executablePath: null,
			canRunViaNpx: options.canRunViaNpx,
			npxPackage: options.npxPackage,
			latestVersion: options.latestVersion ?? null,
		};
	} catch (error) {
		return {
			installed: false,
			version: null,
			authenticated: false,
			acpSupported: true,
			executablePath: null,
			canRunViaNpx: options.canRunViaNpx,
			npxPackage: options.npxPackage,
			latestVersion: options.latestVersion ?? null,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

async function probeNpmGlobalPackageVersion(
	packageSpec: string
): Promise<{ installed: boolean; version: string | null }> {
	// Strip semver suffix from `@scope/name@version` for `npm list`.
	const packageName = packageSpec.replace(NPX_PACKAGE_NAME_RE, "$1");
	const result = await checkCLI(
		`npm list -g ${packageName} --depth=0 --json`,
		VERSION_FLAG_TIMEOUT_MS
	);
	if (!result.installed) {
		return { installed: false, version: null };
	}
	try {
		const parsed = JSON.parse(result.output ?? "{}") as {
			dependencies?: Record<string, { version?: string }>;
		};
		const dep = parsed.dependencies?.[packageName];
		if (dep?.version) {
			return { installed: true, version: dep.version };
		}
	} catch {
		// fall through to regex
	}
	return { installed: true, version: result.version };
}

async function probeBinaryVersion(
	binary: string,
	args: string[]
): Promise<string | null> {
	const versionResult = await checkCLI(
		`${binary} --version`,
		VERSION_FLAG_TIMEOUT_MS
	);
	if (versionResult.installed && versionResult.version) {
		return versionResult.version;
	}

	// Some CLIs only print version when invoked with a non-ACP subcommand.
	const versionResultAlt = await checkCLI(
		`${binary} version`,
		VERSION_FLAG_TIMEOUT_MS
	);
	if (versionResultAlt.installed && versionResultAlt.version) {
		return versionResultAlt.version;
	}

	return null;
}

function buildBinaryInstallCommand(
	binary: RemoteRegistryBinaryEntry,
	entry: RemoteRegistryEntry
): string | undefined {
	if (!binary.archive) {
		return;
	}
	const installDir = `~/.local/bin/${entry.id}`;
	const archiveFile = binary.archive.split("/").pop() ?? "archive";
	const extractCmd = archiveFile.endsWith(".zip")
		? `unzip -o -q "${archiveFile}"`
		: `tar -xzf "${archiveFile}"`;
	return `mkdir -p ${installDir} && cd ${installDir} && curl -fsSL -o "${archiveFile}" "${binary.archive}" && ${extractCmd} && rm "${archiveFile}"`;
}

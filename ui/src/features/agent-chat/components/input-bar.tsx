/**
 * InputBar — follow-up message composer for the agent chat panel.
 *
 * Disables itself (with a visible explanation) whenever the session cannot
 * accept new input: read-only cloud sessions, agents with
 * `acceptsFollowUp: false` after the first turn, or sessions in a terminal
 * state (FR-003, FR-004).
 *
 * Visual layout (Windsurf-inspired redesign — codicons, no emojis):
 *   ┌────────────────────────────────────────────────────┐
 *   │ Ask anything (⌘L)                                  │  ← textarea
 *   │                                                    │
 *   ├────────────────────────────────────────────────────┤
 *   │ [+] [</>Code] [Shield Auto▾] modelLabel  [Mic][▶]  │  ← toolbar
 *   └────────────────────────────────────────────────────┘
 *
 * Toolbar icons are codicons from `@vscode/codicons` (already loaded by the
 * webview). The `+`, `<>` and mic buttons remain placeholders (`disabled`)
 * until their respective specs ship — they preserve the chrome layout
 * without implying functionality.
 *
 * The {@link PermissionChip} surfaces the current
 * `gatomia.acp.permissionDefault` so the user can flip auto-approve mid
 * conversation without re-opening the empty composer.
 */

import {
	type ChangeEvent,
	type KeyboardEvent,
	useCallback,
	useMemo,
	useState,
} from "react";
import { ChipDropdown, type ChipDropdownOption } from "./chip-dropdown";
import { ComposerContext } from "./composer-context";
import { providerIconClass } from "./provider-icon";
import type {
	AgentRoleDescriptor,
	AcpUsageSnapshot,
	AvailableAgentCommand,
	ModelDescriptor,
	PermissionDefaultMode,
	SessionConfigOptionDescriptor,
	ThinkingLevelDescriptor,
} from "@/features/agent-chat/types";

interface InputBarProps {
	readonly onSubmit: (content: string) => void;
	readonly acceptsFollowUp: boolean;
	readonly readOnly?: boolean;
	readonly readOnlyReason?: string;
	readonly terminal?: boolean;
	readonly busy?: boolean;
	readonly modelLabel?: string;
	readonly onCancel?: () => void;
	readonly permissionDefault: PermissionDefaultMode | undefined;
	readonly onChangePermissionDefault: (mode: PermissionDefaultMode) => void;
	/**
	 * Models the agent surfaced for this session via ACP. When non-empty
	 * the chip becomes a `<select>`; otherwise it falls back to the
	 * static `modelLabel`. Empty array hides the chip entirely.
	 */
	readonly availableModels?: readonly ModelDescriptor[];
	/**
	 * Currently selected model id (from the session payload). Drives
	 * the chip's `<select value>` when `availableModels` is non-empty.
	 */
	readonly currentModelId?: string;
	/**
	 * Persists a new model selection through the bridge so the host
	 * calls `session/set_model` and the chip reflects the agent's echo.
	 */
	readonly onChangeModel?: (modelId: string) => void;
	/**
	 * Optional refresh handler for the model dropdown — when present, a
	 * small refresh button is rendered next to the chip and triggers a
	 * re-probe of the active provider.
	 */
	readonly onRefreshModels?: () => void;
	/** True while a model probe for the active provider is in flight. */
	readonly modelsLoading?: boolean;
	/**
	 * Provider id of the active session. Drives the leftmost icon-only
	 * chip (the agent identifier in the toolbar). When omitted the chip
	 * falls back to the generic robot codicon.
	 */
	readonly providerId?: string;
	/** Display name shown as the provider chip's tooltip + a11y label. */
	readonly providerDisplayName?: string;
	/** Optional icon URL from the remote registry, rendered instead of a codicon. */
	readonly providerIconUrl?: string;
	/**
	 * Thinking levels reported by the agent for this session. Empty /
	 * undefined hides the chip.
	 */
	readonly availableThinkingLevels?: readonly ThinkingLevelDescriptor[];
	readonly selectedThinkingLevelId?: string;
	readonly onChangeThinkingLevel?: (id: string) => void;
	/** Agent roles reported by the agent for this session. */
	readonly availableAgentRoles?: readonly AgentRoleDescriptor[];
	readonly selectedAgentRoleId?: string;
	readonly onChangeAgentRole?: (id: string) => void;
	readonly availableCommands?: readonly AvailableAgentCommand[];
	readonly usage?: AcpUsageSnapshot;
	readonly executionTargetLabel?: string;
	readonly configOptions?: readonly SessionConfigOptionDescriptor[];
	readonly onChangeConfigOption?: (configId: string, value: string) => void;
}

const SLASH_COMMAND_QUERY = /^\/([^\s]*)$/;

export function InputBar({
	onSubmit,
	acceptsFollowUp,
	readOnly,
	readOnlyReason,
	terminal,
	busy,
	modelLabel,
	onCancel,
	permissionDefault,
	onChangePermissionDefault,
	availableModels,
	currentModelId,
	onChangeModel,
	onRefreshModels,
	modelsLoading,
	providerId,
	providerDisplayName,
	providerIconUrl,
	availableThinkingLevels,
	selectedThinkingLevelId,
	onChangeThinkingLevel,
	availableAgentRoles,
	selectedAgentRoleId,
	onChangeAgentRole,
	availableCommands,
	usage,
	executionTargetLabel = "Local",
	configOptions,
	onChangeConfigOption,
}: InputBarProps): JSX.Element {
	const [value, setValue] = useState("");
	const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

	const disabled = Boolean(readOnly) || !acceptsFollowUp || Boolean(terminal);
	const disabledReason = resolveDisabledReason({
		readOnly: Boolean(readOnly),
		readOnlyReason,
		acceptsFollowUp,
		terminal: Boolean(terminal),
	});

	const handleSubmit = useCallback(() => {
		const trimmed = value.trim();
		if (trimmed.length === 0 || disabled) {
			return;
		}
		onSubmit(trimmed);
		setValue("");
	}, [value, disabled, onSubmit]);

	const canSend = !disabled && value.trim().length > 0;
	const showStop = Boolean(busy) && Boolean(onCancel);
	const filteredCommands = useMemo(
		() => filterCommands(value, availableCommands ?? []),
		[value, availableCommands]
	);
	const commandMenuOpen = filteredCommands.length > 0;

	const selectCommand = useCallback((command: AvailableAgentCommand) => {
		setValue(`/${command.name} `);
		setSelectedCommandIndex(0);
	}, []);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLTextAreaElement>) => {
			if (
				handleCommandMenuKey({
					event,
					commands: filteredCommands,
					selectedIndex: selectedCommandIndex,
					selectCommand,
					setSelectedIndex: setSelectedCommandIndex,
				})
			) {
				return;
			}
			if (event.key === "Escape" && busy && onCancel) {
				event.preventDefault();
				onCancel();
				return;
			}
			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				handleSubmit();
			}
		},
		[
			busy,
			filteredCommands,
			handleSubmit,
			onCancel,
			selectCommand,
			selectedCommandIndex,
		]
	);

	return (
		<div className="agent-chat-input">
			{disabled && disabledReason ? (
				<div className="agent-chat-input__disabled-reason">
					{disabledReason}
				</div>
			) : null}
			<div className="agent-chat-input__box">
				{availableCommands &&
				availableCommands.length > 0 &&
				value.length === 0 ? (
					<div className="agent-chat-input__tip">
						<strong>Tip:</strong> Type <code>/</code> to use agent commands.
					</div>
				) : null}
				<textarea
					className="agent-chat-input__textarea"
					disabled={disabled}
					onChange={(e) => setValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={
						disabled
							? (disabledReason ?? "Input disabled")
							: "Ask anything (⌘L)"
					}
					rows={3}
					value={value}
				/>
				{commandMenuOpen ? (
					<div
						aria-label="Agent commands"
						className="agent-chat-input__commands"
						role="listbox"
					>
						{filteredCommands.map((command, index) => (
							<button
								aria-selected={index === selectedCommandIndex}
								className="agent-chat-input__command"
								key={command.name}
								onClick={() => selectCommand(command)}
								role="option"
								type="button"
							>
								<code>/{command.name}</code>
								<span>
									{command.description ??
										command.input?.hint ??
										"Agent command"}
								</span>
							</button>
						))}
					</div>
				) : null}
				<div className="agent-chat-input__toolbar">
					<div className="agent-chat-input__toolbar-left">
						<button
							aria-label="Add attachment (coming soon)"
							className="agent-chat-input__icon-button"
							disabled
							title="Attachments coming soon"
							type="button"
						>
							<i aria-hidden="true" className="codicon codicon-add" />
						</button>
						{providerId ? (
							<ProviderIconChip
								displayName={providerDisplayName ?? providerId}
								iconUrl={providerIconUrl}
								providerId={providerId}
							/>
						) : null}
						<InputSelectors
							availableAgentRoles={availableAgentRoles}
							availableModels={availableModels}
							availableThinkingLevels={availableThinkingLevels}
							configOptions={configOptions}
							currentModelId={currentModelId}
							modelLabel={modelLabel}
							modelsLoading={Boolean(modelsLoading)}
							onChangeAgentRole={onChangeAgentRole}
							onChangeConfigOption={onChangeConfigOption}
							onChangeModel={onChangeModel}
							onChangeThinkingLevel={onChangeThinkingLevel}
							onRefreshModels={onRefreshModels}
							selectedAgentRoleId={selectedAgentRoleId}
							selectedThinkingLevelId={selectedThinkingLevelId}
						/>
					</div>
					<div className="agent-chat-input__toolbar-right">
						{busy ? (
							<span
								aria-hidden="true"
								className="agent-chat-input__activity"
								data-testid="input-activity"
							/>
						) : null}
						<button
							aria-label="Dictation (coming soon)"
							className="agent-chat-input__icon-button"
							disabled
							title="Dictation coming soon"
							type="button"
						>
							<i aria-hidden="true" className="codicon codicon-mic" />
						</button>
						{showStop ? (
							<button
								aria-label="Stop"
								className="agent-chat-input__stop"
								onClick={onCancel}
								title="Stop the agent"
								type="button"
							>
								<i aria-hidden="true" className="codicon codicon-debug-stop" />
							</button>
						) : (
							<button
								aria-label="Send"
								className="agent-chat-input__send"
								disabled={!canSend}
								onClick={handleSubmit}
								type="button"
							>
								<i aria-hidden="true" className="codicon codicon-arrow-up" />
							</button>
						)}
					</div>
				</div>
			</div>
			<ComposerContext
				executionTargetLabel={executionTargetLabel}
				onChangePermissionDefault={onChangePermissionDefault}
				permissionDefault={permissionDefault}
				usage={usage}
			/>
		</div>
	);
}

function filterCommands(
	value: string,
	commands: readonly AvailableAgentCommand[]
): AvailableAgentCommand[] {
	const match = SLASH_COMMAND_QUERY.exec(value);
	if (!match) {
		return [];
	}
	const query = (match[1] ?? "").toLocaleLowerCase();
	return commands
		.filter((command) => command.name.toLocaleLowerCase().includes(query))
		.slice(0, 8);
}

interface CommandMenuKeyContext {
	readonly event: KeyboardEvent<HTMLTextAreaElement>;
	readonly commands: readonly AvailableAgentCommand[];
	readonly selectedIndex: number;
	readonly selectCommand: (command: AvailableAgentCommand) => void;
	readonly setSelectedIndex: (updater: (index: number) => number) => void;
}

function handleCommandMenuKey({
	event,
	commands,
	selectedIndex,
	selectCommand,
	setSelectedIndex,
}: CommandMenuKeyContext): boolean {
	if (commands.length === 0) {
		return false;
	}
	switch (event.key) {
		case "ArrowDown":
			event.preventDefault();
			setSelectedIndex((index) => (index + 1) % commands.length);
			return true;
		case "ArrowUp":
			event.preventDefault();
			setSelectedIndex(
				(index) => (index - 1 + commands.length) % commands.length
			);
			return true;
		case "Tab":
		case "Enter": {
			event.preventDefault();
			const command = commands[selectedIndex];
			if (command) {
				selectCommand(command);
			}
			return true;
		}
		default:
			return false;
	}
}

interface InputSelectorsProps {
	readonly availableAgentRoles?: readonly AgentRoleDescriptor[];
	readonly availableModels?: readonly ModelDescriptor[];
	readonly availableThinkingLevels?: readonly ThinkingLevelDescriptor[];
	readonly configOptions?: readonly SessionConfigOptionDescriptor[];
	readonly currentModelId?: string;
	readonly modelLabel?: string;
	readonly modelsLoading: boolean;
	readonly onChangeAgentRole?: (id: string) => void;
	readonly onChangeConfigOption?: (configId: string, value: string) => void;
	readonly onChangeModel?: (modelId: string) => void;
	readonly onChangeThinkingLevel?: (id: string) => void;
	readonly onRefreshModels?: () => void;
	readonly selectedAgentRoleId?: string;
	readonly selectedThinkingLevelId?: string;
}

function InputSelectors({
	availableAgentRoles,
	availableModels,
	availableThinkingLevels,
	configOptions,
	currentModelId,
	modelLabel,
	modelsLoading,
	onChangeAgentRole,
	onChangeConfigOption,
	onChangeModel,
	onChangeThinkingLevel,
	onRefreshModels,
	selectedAgentRoleId,
	selectedThinkingLevelId,
}: InputSelectorsProps): JSX.Element {
	if (configOptions && configOptions.length > 0) {
		return (
			<>
				{configOptions.map((option) => (
					<SessionConfigChip
						key={option.id}
						onChange={onChangeConfigOption}
						option={option}
					/>
				))}
			</>
		);
	}
	return (
		<>
			<ModelChip
				availableModels={availableModels}
				currentModelId={currentModelId}
				loading={modelsLoading}
				modelLabel={modelLabel}
				onChange={onChangeModel}
				onRefresh={onRefreshModels}
			/>
			<ThinkingChip
				onChange={onChangeThinkingLevel}
				options={availableThinkingLevels}
				value={selectedThinkingLevelId}
			/>
			<AgentRoleChip
				onChange={onChangeAgentRole}
				options={availableAgentRoles}
				value={selectedAgentRoleId}
			/>
		</>
	);
}

interface SessionConfigChipProps {
	readonly option: SessionConfigOptionDescriptor;
	readonly onChange: ((configId: string, value: string) => void) | undefined;
}

function SessionConfigChip({
	option,
	onChange,
}: SessionConfigChipProps): JSX.Element {
	const values = option.values.map((value) => ({
		value: value.value,
		label: value.name,
		description: value.description ?? value.group,
		icon: configOptionIcon(option.category),
	}));
	const active = option.values.find(
		(value) => value.value === option.currentValue
	);
	return (
		<ChipDropdown
			ariaPrefix={option.name}
			currentLabel={active?.name ?? option.currentValue}
			disabled={!onChange}
			icon={configOptionIcon(option.category)}
			onChange={(value) => onChange?.(option.id, value)}
			options={values}
			value={option.currentValue}
		/>
	);
}

function configOptionIcon(category: string | undefined): string {
	switch (category) {
		case "model":
			return "codicon-symbol-color";
		case "thought_level":
			return "codicon-pulse";
		case "mode":
			return "codicon-robot";
		default:
			return "codicon-settings-gear";
	}
}

interface DisabledReasonInput {
	readonly readOnly: boolean;
	readonly readOnlyReason?: string;
	readonly acceptsFollowUp: boolean;
	readonly terminal: boolean;
}

function resolveDisabledReason(input: DisabledReasonInput): string | undefined {
	if (input.readOnly) {
		return input.readOnlyReason ?? "This session is read-only.";
	}
	if (!input.acceptsFollowUp) {
		return "This agent does not accept follow-up messages in the same session.";
	}
	if (input.terminal) {
		return "This session has ended. Start a new one to continue.";
	}
	return;
}

interface ModelChipProps {
	readonly availableModels: readonly ModelDescriptor[] | undefined;
	readonly currentModelId: string | undefined;
	readonly loading: boolean;
	readonly modelLabel: string | undefined;
	readonly onChange: ((modelId: string) => void) | undefined;
	readonly onRefresh: (() => void) | undefined;
}

/**
 * Compact model chip rendered next to the {@link PermissionChip}.
 *
 * Render contract (matches the redesign):
 *
 *   - When `availableModels` is non-empty: the chip is an interactive
 *     `<select>` whose `change` events flow through `onChange` (the
 *     bridge calls `session/set_model` and persists the choice).
 *   - When `availableModels` is empty/undefined but the host probe is
 *     in flight: the chip becomes a passive "Loading models…" label.
 *   - When `availableModels` is empty AND no probe is running: the
 *     chip falls back to the static `modelLabel` (provider display
 *     name) so the chrome is never empty.
 *   - When `modelLabel` is also empty: the chip is hidden entirely.
 *
 * The optional refresh button only renders when `onRefresh` is wired
 * AND the dropdown variant is showing — refreshing the static label
 * has no effect.
 */
function ModelChip({
	availableModels,
	currentModelId,
	loading,
	modelLabel,
	onChange,
	onRefresh,
}: ModelChipProps): JSX.Element | null {
	const models = availableModels ?? [];
	const hasDynamicModels = models.length > 0;
	const handleChange = useMemo(
		() =>
			(event: ChangeEvent<HTMLSelectElement>): void => {
				if (!onChange) {
					return;
				}
				const next = event.target.value;
				if (next && next !== currentModelId) {
					onChange(next);
				}
			},
		[onChange, currentModelId]
	);

	if (hasDynamicModels) {
		return (
			<span className="agent-chat-input__model-chip">
				<select
					aria-label="Select agent model"
					className="agent-chat-input__model-select"
					disabled={!onChange}
					onChange={handleChange}
					value={currentModelId ?? ""}
				>
					{currentModelId ? null : (
						<option disabled value="">
							Select a model
						</option>
					)}
					{models.map((model) => (
						<option key={model.id} value={model.id}>
							{model.displayName}
						</option>
					))}
				</select>
				{onRefresh ? (
					<button
						aria-label="Refresh model list"
						className="agent-chat-input__icon-button agent-chat-input__icon-button--inline"
						onClick={onRefresh}
						title={loading ? "Refreshing models…" : "Refresh model list"}
						type="button"
					>
						<i
							aria-hidden="true"
							className={
								loading
									? "codicon codicon-sync codicon-modifier-spin"
									: "codicon codicon-sync"
							}
						/>
					</button>
				) : null}
			</span>
		);
	}

	if (loading) {
		return (
			<span
				className="agent-chat-input__model-label"
				title="Loading model list…"
			>
				Loading models…
			</span>
		);
	}

	if (modelLabel) {
		return (
			<span className="agent-chat-input__model-label" title={modelLabel}>
				{modelLabel}
			</span>
		);
	}

	return null;
}

interface ProviderIconChipProps {
	readonly providerId: string;
	readonly displayName: string;
	readonly iconUrl?: string;
}

/**
 * Icon-only chip identifying the active provider on the InputBar
 * toolbar. Mirrors the leftmost element of the second reference image
 * (`@ Gemini 3 Flash`) — we only render the agent's logo glyph because
 * the model chip immediately to its right already carries the textual
 * label the user cares about.
 *
 * Today the chip is non-interactive (an active session is locked to
 * its spawned provider). It still uses the same chrome as the rest of
 * the chips so the row reads as a single coherent toolbar.
 */
function ProviderIconChip({
	providerId,
	displayName,
	iconUrl,
}: ProviderIconChipProps): JSX.Element {
	return (
		<span className="agent-chat-chip" title={displayName}>
			<button
				aria-label={`Provider: ${displayName}`}
				className="agent-chat-chip__toggle"
				disabled
				type="button"
			>
				{iconUrl ? (
					<img
						alt=""
						aria-hidden="true"
						className="agent-chat-chip__icon-img"
						height={14}
						src={iconUrl}
						width={14}
					/>
				) : (
					<i
						aria-hidden="true"
						className={`codicon ${providerIconClass(providerId)}`}
					/>
				)}
			</button>
		</span>
	);
}

interface ThinkingChipProps {
	readonly options: readonly ThinkingLevelDescriptor[] | undefined;
	readonly value: string | undefined;
	readonly onChange: ((id: string) => void) | undefined;
}

/**
 * Wraps {@link ChipDropdown} with the on-session thinking-level
 * contract: hide entirely when the agent did not surface any tier and
 * defer to the bridge handler when the user picks a new value.
 */
function ThinkingChip({
	options,
	value,
	onChange,
}: ThinkingChipProps): JSX.Element | null {
	const dropdownOptions = useMemo<readonly ChipDropdownOption<string>[]>(() => {
		if (!options) {
			return [];
		}
		return options.map((level) => ({
			value: level.id,
			label: level.displayName,
			description: level.description,
			icon: "codicon-pulse",
		}));
	}, [options]);
	if (!options || options.length === 0) {
		return null;
	}
	const active = options.find((o) => o.id === value);
	return (
		<ChipDropdown
			ariaPrefix="Thinking"
			currentLabel={active?.displayName ?? options[0].displayName}
			disabled={!onChange}
			icon="codicon-pulse"
			onChange={(next) => onChange?.(next)}
			options={dropdownOptions}
			value={value}
		/>
	);
}

interface AgentRoleChipProps {
	readonly options: readonly AgentRoleDescriptor[] | undefined;
	readonly value: string | undefined;
	readonly onChange: ((id: string) => void) | undefined;
}

function AgentRoleChip({
	options,
	value,
	onChange,
}: AgentRoleChipProps): JSX.Element | null {
	const dropdownOptions = useMemo<readonly ChipDropdownOption<string>[]>(() => {
		if (!options) {
			return [];
		}
		return options.map((role) => ({
			value: role.id,
			label: role.displayName,
			description: role.description,
			icon: "codicon-shield",
		}));
	}, [options]);
	if (!options || options.length === 0) {
		return null;
	}
	const active = options.find((o) => o.id === value);
	return (
		<ChipDropdown
			ariaPrefix="Agent role"
			currentLabel={active?.displayName ?? options[0].displayName}
			disabled={!onChange}
			icon="codicon-shield"
			onChange={(next) => onChange?.(next)}
			options={dropdownOptions}
			value={value}
		/>
	);
}

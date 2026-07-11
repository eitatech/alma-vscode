import { PermissionChip } from "./permission-chip";
import type {
	AcpUsageSnapshot,
	PermissionDefaultMode,
} from "@/features/agent-chat/types";

interface ComposerContextProps {
	readonly executionTargetLabel: string;
	readonly permissionDefault: PermissionDefaultMode | undefined;
	readonly onChangePermissionDefault: (mode: PermissionDefaultMode) => void;
	readonly usage?: AcpUsageSnapshot;
}

/** Compact environment and permission strip below a chat composer. */
export function ComposerContext({
	executionTargetLabel,
	permissionDefault,
	onChangePermissionDefault,
	usage,
}: ComposerContextProps): JSX.Element {
	const usageLabel = formatUsage(usage);
	return (
		<div className="agent-chat-composer-context">
			<div className="agent-chat-composer-context__item">
				<i aria-hidden="true" className="codicon codicon-device-desktop" />
				<span>{executionTargetLabel}</span>
			</div>
			<PermissionChip
				onChange={onChangePermissionDefault}
				value={permissionDefault}
			/>
			{usageLabel ? (
				<div
					className="agent-chat-composer-context__usage"
					title={formatUsageTitle(usage)}
				>
					<i aria-hidden="true" className="codicon codicon-pie-chart" />
					<span>{usageLabel}</span>
				</div>
			) : null}
		</div>
	);
}

function formatUsage(usage: AcpUsageSnapshot | undefined): string | undefined {
	if (!(usage?.used !== undefined && usage.size && usage.size > 0)) {
		return;
	}
	const percent = Math.min(100, Math.round((usage.used / usage.size) * 100));
	return `${percent}% context`;
}

function formatUsageTitle(usage: AcpUsageSnapshot | undefined): string {
	if (!usage) {
		return "";
	}
	const parts: string[] = [];
	if (usage.used !== undefined && usage.size !== undefined) {
		parts.push(
			`${usage.used.toLocaleString()} of ${usage.size.toLocaleString()} tokens`
		);
	}
	if (usage.cost) {
		parts.push(
			`${usage.cost.amount.toLocaleString(undefined, {
				style: "currency",
				currency: usage.cost.currency,
			})} cumulative cost`
		);
	}
	return parts.join(" · ");
}

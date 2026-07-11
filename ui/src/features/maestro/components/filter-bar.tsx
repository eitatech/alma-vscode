/**
 * Filter bar with spec filter dropdown and group-by-spec toggle.
 */

import type { MaestroSpecInfo } from "../types";

interface FilterBarProps {
	specs: MaestroSpecInfo[];
	activeSpec: string | null;
	groupBySpec: boolean;
	onFilterSpec: (specId: string | null) => void;
	onToggleGroup: (groupBySpec: boolean) => void;
	onRefresh: () => void;
}

export function FilterBar({
	specs,
	activeSpec,
	groupBySpec,
	onFilterSpec,
	onToggleGroup,
	onRefresh,
}: FilterBarProps) {
	return (
		<div className="maestro-filter-bar">
			<select
				className="maestro-spec-filter"
				onChange={(e) => onFilterSpec(e.target.value || null)}
				value={activeSpec ?? ""}
			>
				<option value="">All specs</option>
				{specs.map((spec) => (
					<option key={spec.id} value={spec.id}>
						{spec.name} ({spec.status})
					</option>
				))}
			</select>

			<label className="maestro-group-toggle">
				<input
					checked={groupBySpec}
					onChange={(e) => onToggleGroup(e.target.checked)}
					type="checkbox"
				/>
				<span>Group by spec</span>
			</label>

			<button
				className="maestro-refresh-button"
				onClick={onRefresh}
				title="Refresh"
				type="button"
			>
				<i className="codicon codicon-refresh" />
			</button>
		</div>
	);
}

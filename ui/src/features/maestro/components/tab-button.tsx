/**
 * Tab button for switching between Board, Composer, and List.
 */

import type { MaestroTab } from "../types";

interface TabButtonProps {
	active: boolean;
	tab: MaestroTab;
	label: string;
	icon: string;
	onClick: (tab: MaestroTab) => void;
}

export function TabButton({
	active,
	tab,
	label,
	icon,
	onClick,
}: TabButtonProps) {
	return (
		<button
			className={`maestro-tab-button ${active ? "maestro-tab-button--active" : ""}`}
			onClick={() => onClick(tab)}
			type="button"
		>
			<i className={`codicon codicon-${icon}`} />
			<span>{label}</span>
		</button>
	);
}

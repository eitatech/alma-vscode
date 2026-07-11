/**
 * Single session row in the session list.
 */

import type { RunningCard } from "../types";

interface SessionRowProps {
	card: RunningCard;
	onOpenExternal: (url: string) => void;
}

export function SessionRow({ card, onOpenExternal }: SessionRowProps) {
	let statusClass = "maestro-session-row--done";
	if (card.running) {
		statusClass = "maestro-session-row--running";
	} else if (card.status === "failed" || card.status === "cancelled") {
		statusClass = "maestro-session-row--failed";
	}

	return (
		<div className={`maestro-session-row ${statusClass}`}>
			<div className="maestro-session-row__info">
				<span className="maestro-session-row__title">{card.title}</span>
				<span className="maestro-session-row__detail">
					{card.source} · {card.sessionId.slice(0, 8)} · {card.status}
				</span>
				{card.taskKey && (
					<span className="maestro-session-row__task-key">{card.taskKey}</span>
				)}
			</div>
			{card.externalUrl && (
				<button
					className="maestro-session-row__open"
					onClick={() => onOpenExternal(card.externalUrl!)}
					title="Open session"
					type="button"
				>
					<i className="codicon codicon-link-external" />
				</button>
			)}
		</div>
	);
}

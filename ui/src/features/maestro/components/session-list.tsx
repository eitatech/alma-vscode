/**
 * Session list tab - shows all running/finished sessions,
 * optionally grouped by spec.
 */

import { useMemo } from "react";
import type { RunningCard } from "../types";
import { parseTaskKey } from "../board-projection";
import { SessionRow } from "./session-row";

interface SessionListProps {
	sessions: RunningCard[];
	groupBySpec: boolean;
	onOpenExternal: (url: string) => void;
}

export function SessionList({
	sessions,
	groupBySpec,
	onOpenExternal,
}: SessionListProps) {
	const grouped = useMemo(() => {
		if (!groupBySpec) {
			return null;
		}
		const map = new Map<string | null, RunningCard[]>();
		for (const card of sessions) {
			let specId: string | null = null;
			if (card.taskKey) {
				const ref = parseTaskKey(card.taskKey);
				if (ref) {
					specId = ref.specId;
				}
			}
			const list = map.get(specId) ?? [];
			list.push(card);
			map.set(specId, list);
		}
		return map;
	}, [sessions, groupBySpec]);

	if (sessions.length === 0) {
		return (
			<div className="maestro-session-list maestro-session-list--empty">
				No sessions yet. Start a task from the Board or Composer.
			</div>
		);
	}

	if (grouped) {
		const entries = Array.from(grouped.entries()).sort(([a], [b]) => {
			if (a === null) {
				return 1;
			}
			if (b === null) {
				return -1;
			}
			return a.localeCompare(b);
		});

		return (
			<div className="maestro-session-list">
				{entries.map(([specId, cards]) => (
					<div
						className="maestro-session-list__group"
						key={specId ?? "__freeform"}
					>
						<div className="maestro-session-list__group-label">
							{specId ?? "Free-form sessions"}
						</div>
						{cards.map((card) => (
							<SessionRow
								card={card}
								key={card.sessionId}
								onOpenExternal={onOpenExternal}
							/>
						))}
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="maestro-session-list">
			{sessions.map((card) => (
				<SessionRow
					card={card}
					key={card.sessionId}
					onOpenExternal={onOpenExternal}
				/>
			))}
		</div>
	);
}

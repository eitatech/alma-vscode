/**
 * Kanban board with 7 columns.
 * Distributes tasks across columns using board projection logic.
 */

import { useMemo } from "react";
import type { BoardColumn, MaestroTask, RunningCard } from "../types";
import { BOARD_COLUMNS } from "../types";
import { getTaskColumn } from "../board-projection";
import { KanbanColumn } from "./kanban-column";

interface KanbanBoardProps {
	tasks: MaestroTask[];
	sessions: RunningCard[];
	activeSpec: string | null;
	groupBySpec: boolean;
	onStartTask: (
		taskKey: string,
		prompt: string,
		target: "local" | "cloud"
	) => void;
	onOpenExternal: (url: string) => void;
}

function buildKanbanProjection(
	tasks: MaestroTask[],
	sessions: RunningCard[],
	activeSpec: string | null
): {
	tasksByColumn: Map<BoardColumn, MaestroTask[]>;
	cardsByKey: Map<string, RunningCard>;
} {
	const filtered = activeSpec
		? tasks.filter((t) => t.specId === activeSpec)
		: tasks;

	const byColumn = new Map<BoardColumn, MaestroTask[]>();
	for (const col of BOARD_COLUMNS) {
		byColumn.set(col, []);
	}

	const cardsMap = new Map<string, RunningCard>();
	for (const card of sessions) {
		if (card.taskKey) {
			const existing = cardsMap.get(card.taskKey);
			if (!existing || (card.running && !existing.running)) {
				cardsMap.set(card.taskKey, card);
			}
		}
	}

	for (const task of filtered) {
		const { column } = getTaskColumn(task, sessions);
		byColumn.get(column)?.push(task);
	}

	return { tasksByColumn: byColumn, cardsByKey: cardsMap };
}

export function KanbanBoard({
	tasks,
	sessions,
	activeSpec,
	groupBySpec,
	onStartTask,
	onOpenExternal,
}: KanbanBoardProps) {
	const { tasksByColumn, cardsByKey } = useMemo(
		() => buildKanbanProjection(tasks, sessions, activeSpec),
		[tasks, sessions, activeSpec]
	);

	if (groupBySpec) {
		const specIds = new Set(tasks.map((t) => t.specId));
		return (
			<div className="maestro-board maestro-board--grouped">
				{Array.from(specIds).map((specId) => {
					const specTasks = tasks.filter((t) => t.specId === specId);
					const specName = specTasks[0]?.spec ?? specId;
					return (
						<div className="maestro-board__group" key={specId}>
							<div className="maestro-board__group-label">{specName}</div>
							<div className="maestro-board__columns">
								{BOARD_COLUMNS.map((col) => {
									const colTasks =
										tasksByColumn
											.get(col)
											?.filter((t) => t.specId === specId) ?? [];
									return (
										<KanbanColumn
											cardsByKey={cardsByKey}
											column={col}
											key={col}
											onOpenExternal={onOpenExternal}
											onStartTask={onStartTask}
											tasks={colTasks}
										/>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		);
	}

	return (
		<div className="maestro-board">
			<div className="maestro-board__columns">
				{BOARD_COLUMNS.map((col) => (
					<KanbanColumn
						cardsByKey={cardsByKey}
						column={col}
						key={col}
						onOpenExternal={onOpenExternal}
						onStartTask={onStartTask}
						tasks={tasksByColumn.get(col) ?? []}
					/>
				))}
			</div>
		</div>
	);
}

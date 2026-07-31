/**
 * Single Kanban column with its task cards.
 */

import type { BoardColumn, MaestroTask, RunningCard } from "../types";
import { taskKey } from "../board-projection";
import { TaskCard } from "./task-card";

interface KanbanColumnProps {
	column: BoardColumn;
	tasks: MaestroTask[];
	cardsByKey: Map<string, RunningCard>;
	onStartTask: (
		taskKey: string,
		prompt: string,
		target: "local" | "cloud"
	) => void;
	onOpenExternal: (url: string) => void;
}

const COLUMN_META: Record<BoardColumn, { icon: string; label: string }> = {
	DRAFT: { icon: "edit", label: "Draft" },
	TODO: { icon: "list-flat", label: "To Do" },
	IN_PROGRESS: { icon: "play", label: "In Progress" },
	IN_REVIEW: { icon: "search", label: "In Review" },
	BLOCKED: { icon: "error", label: "Blocked" },
	READY: { icon: "check", label: "Ready" },
	DONE: { icon: "pass", label: "Done" },
};

export function KanbanColumn({
	column,
	tasks,
	cardsByKey,
	onStartTask,
	onOpenExternal,
}: KanbanColumnProps) {
	const meta = COLUMN_META[column];

	return (
		<div
			className={`maestro-column maestro-column--${column.toLowerCase().replace("_", "-")}`}
		>
			<div className="maestro-column__header">
				<i className={`codicon codicon-${meta.icon}`} />
				<span className="maestro-column__label">{meta.label}</span>
				<span className="maestro-column__count">{tasks.length}</span>
			</div>
			<div className="maestro-column__cards">
				{tasks.length === 0 && (
					<div className="maestro-column__empty">No tasks</div>
				)}
				{tasks.map((task) => {
					const key = taskKey(task.specId, task.id, task.title);
					const card = cardsByKey.get(key) ?? null;
					return (
						<TaskCard
							card={card}
							key={`${task.specId}-${task.id}`}
							onOpenExternal={onOpenExternal}
							onStartTask={onStartTask}
							showRunButtons={column === "TODO"}
							task={task}
						/>
					);
				})}
			</div>
		</div>
	);
}

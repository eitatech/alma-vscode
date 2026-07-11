/**
 * Task card for a single task in a Kanban column.
 * Shows task ID, title, phase, and session detail.
 * Run buttons (local/cloud) only appear in the TO DO column.
 */

import type { MaestroTask, RunningCard } from "../types";
import { taskKey, taskPromptText } from "../board-projection";

interface TaskCardProps {
	task: MaestroTask;
	card: RunningCard | null;
	showRunButtons: boolean;
	onStartTask: (
		taskKey: string,
		prompt: string,
		target: "local" | "cloud"
	) => void;
	onOpenExternal: (url: string) => void;
}

export function TaskCard({
	task,
	card,
	showRunButtons,
	onStartTask,
	onOpenExternal,
}: TaskCardProps) {
	const key = taskKey(task.specId, task.id, task.title);
	const prompt = taskPromptText(task.spec, task.phase, task.id, task.title);

	const handleIdClick = () => {
		if (card?.externalUrl) {
			onOpenExternal(card.externalUrl);
		}
	};

	return (
		<div className="maestro-task-card">
			<div className="maestro-task-card__header">
				<button
					className="maestro-task-card__id"
					disabled={!card?.externalUrl}
					onClick={handleIdClick}
					title={card?.externalUrl ? "Open session" : undefined}
					type="button"
				>
					{task.id}
				</button>
				{task.phase && (
					<span className="maestro-task-card__phase">{task.phase}</span>
				)}
			</div>

			<div className="maestro-task-card__title">{task.title}</div>

			<div className="maestro-task-card__spec">{task.spec}</div>

			{card && (
				<div className="maestro-task-card__session">
					<span className="maestro-task-card__session-detail">
						{card.title} · {card.source} · {card.sessionId.slice(0, 8)} ·{" "}
						{card.status}
					</span>
				</div>
			)}

			{showRunButtons && (
				<div className="maestro-task-card__actions">
					<button
						className="maestro-run-button maestro-run-button--local"
						onClick={() => onStartTask(key, prompt, "local")}
						title="Run locally (ACP)"
						type="button"
					>
						<i className="codicon codicon-play" />
						<span>Local</span>
					</button>
					<button
						className="maestro-run-button maestro-run-button--cloud"
						onClick={() => onStartTask(key, prompt, "cloud")}
						title="Run in cloud"
						type="button"
					>
						<i className="codicon codicon-cloud" />
						<span>Cloud</span>
					</button>
				</div>
			)}
		</div>
	);
}

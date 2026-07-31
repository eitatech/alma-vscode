/**
 * Composer tab - start a free-form task with a text prompt.
 */

import { useState } from "react";

interface ComposerProps {
	onNewFreeformTask: (prompt: string, target: "local" | "cloud") => void;
}

export function Composer({ onNewFreeformTask }: ComposerProps) {
	const [prompt, setPrompt] = useState("");

	const handleStart = (target: "local" | "cloud") => {
		if (prompt.trim().length === 0) {
			return;
		}
		onNewFreeformTask(prompt.trim(), target);
		setPrompt("");
	};

	return (
		<div className="maestro-composer">
			<h2 className="maestro-composer__title">New Task</h2>
			<p className="maestro-composer__description">
				Enter a free-form prompt to start a new agent task.
			</p>
			<textarea
				className="maestro-composer__textarea"
				onChange={(e) => setPrompt(e.target.value)}
				placeholder="Describe the task you want the agent to work on..."
				rows={6}
				value={prompt}
			/>
			<div className="maestro-composer__actions">
				<button
					className="maestro-run-button maestro-run-button--local"
					disabled={prompt.trim().length === 0}
					onClick={() => handleStart("local")}
					type="button"
				>
					<i className="codicon codicon-play" />
					<span>Run Local</span>
				</button>
				<button
					className="maestro-run-button maestro-run-button--cloud"
					disabled={prompt.trim().length === 0}
					onClick={() => handleStart("cloud")}
					type="button"
				>
					<i className="codicon codicon-cloud" />
					<span>Run Cloud</span>
				</button>
			</div>
		</div>
	);
}

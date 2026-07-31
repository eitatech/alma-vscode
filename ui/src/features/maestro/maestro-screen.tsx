/**
 * Maestro Board Screen
 * Main entry point for the Maestro Board webview.
 * Mirrors the pattern from welcome-screen.tsx.
 */

import { useEffect, useRef } from "react";
import { useMaestroStore } from "./stores/maestro-store";
import { vscode } from "../../bridge/vscode";
import { TabButton } from "./components/tab-button";
import { FilterBar } from "./components/filter-bar";
import { KanbanBoard } from "./components/kanban-board";
import { Composer } from "./components/composer";
import { SessionList } from "./components/session-list";
import type { MaestroTab } from "./types";
import "./maestro.css";

export function MaestroScreen() {
	const { state, loading, error, setState, setError } = useMaestroStore();

	const initializedRef = useRef(false);

	useEffect(() => {
		if (initializedRef.current) {
			return;
		}
		initializedRef.current = true;

		if (!vscode) {
			return;
		}

		vscode.postMessage({ type: "maestro/ready" });

		const messageHandler = (event: MessageEvent) => {
			const message = event.data;
			switch (message.type) {
				case "maestro/state":
					setState({
						tasks: message.tasks,
						sessions: message.sessions,
						specs: message.specs,
						activeSpec: message.activeSpec,
						groupBySpec: message.groupBySpec,
						activeTab: message.activeTab,
					});
					break;
				case "maestro/error":
					setError(message.message);
					break;
				default:
					break;
			}
		};

		window.addEventListener("message", messageHandler);
		return () => window.removeEventListener("message", messageHandler);
	}, [setState, setError]);

	const handleRefresh = () => {
		vscode?.postMessage({ type: "maestro/refresh" });
	};

	const handleStartTask = (
		taskKey: string,
		prompt: string,
		target: "local" | "cloud"
	) => {
		vscode?.postMessage({
			type: "maestro/start-task",
			taskKey,
			prompt,
			target,
		});
	};

	const handleNewFreeformTask = (prompt: string, target: "local" | "cloud") => {
		vscode?.postMessage({
			type: "maestro/new-freeform-task",
			prompt,
			target,
		});
	};

	const handleFilterSpec = (specId: string | null) => {
		vscode?.postMessage({ type: "maestro/filter-spec", specId });
	};

	const handleToggleGroup = (groupBySpec: boolean) => {
		vscode?.postMessage({ type: "maestro/toggle-group", groupBySpec });
	};

	const handleSwitchTab = (tab: MaestroTab) => {
		vscode?.postMessage({ type: "maestro/switch-tab", tab });
	};

	const handleOpenExternal = (url: string) => {
		vscode?.postMessage({ type: "maestro/open-external", url });
	};

	if (loading) {
		return (
			<div className="maestro-screen maestro-screen--loading">
				<div className="maestro-loading">
					<i className="codicon codicon-loading codicon-spin" />
					<span>Loading Maestro Board...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="maestro-screen">
			<div className="maestro-screen__header">
				<div className="maestro-screen__tabs">
					<TabButton
						active={state.activeTab === "board"}
						icon="kanban"
						label="Board"
						onClick={handleSwitchTab}
						tab="board"
					/>
					<TabButton
						active={state.activeTab === "composer"}
						icon="edit"
						label="Composer"
						onClick={handleSwitchTab}
						tab="composer"
					/>
					<TabButton
						active={state.activeTab === "list"}
						icon="list-tree"
						label="List"
						onClick={handleSwitchTab}
						tab="list"
					/>
				</div>
				<FilterBar
					activeSpec={state.activeSpec}
					groupBySpec={state.groupBySpec}
					onFilterSpec={handleFilterSpec}
					onRefresh={handleRefresh}
					onToggleGroup={handleToggleGroup}
					specs={state.specs}
				/>
			</div>

			{error && (
				<div className="maestro-screen__error">
					<i className="codicon codicon-error" />
					<span>{error}</span>
				</div>
			)}

			<div className="maestro-screen__content">
				{state.activeTab === "board" && (
					<KanbanBoard
						activeSpec={state.activeSpec}
						groupBySpec={state.groupBySpec}
						onOpenExternal={handleOpenExternal}
						onStartTask={handleStartTask}
						sessions={state.sessions}
						tasks={state.tasks}
					/>
				)}
				{state.activeTab === "composer" && (
					<Composer onNewFreeformTask={handleNewFreeformTask} />
				)}
				{state.activeTab === "list" && (
					<SessionList
						groupBySpec={state.groupBySpec}
						onOpenExternal={handleOpenExternal}
						sessions={state.sessions}
					/>
				)}
			</div>
		</div>
	);
}

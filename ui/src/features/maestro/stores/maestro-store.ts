/**
 * Maestro Board state management.
 * Zustand store for webview state with VS Code message bridge integration.
 * Mirrors the pattern from welcome-store.ts.
 */

import { create } from "zustand";
import type { MaestroState, MaestroTab } from "../types";

const initialState: MaestroState = {
	tasks: [],
	sessions: [],
	specs: [],
	activeSpec: null,
	groupBySpec: false,
	activeTab: "board",
};

export interface MaestroStore {
	state: MaestroState;
	loading: boolean;
	error: string | null;

	setState: (state: Partial<MaestroState>) => void;
	setActiveSpec: (specId: string | null) => void;
	setGroupBySpec: (groupBySpec: boolean) => void;
	setActiveTab: (tab: MaestroTab) => void;
	setError: (error: string | null) => void;
	setLoading: (loading: boolean) => void;
	reset: () => void;
}

export const useMaestroStore = create<MaestroStore>((set) => ({
	state: initialState,
	loading: true,
	error: null,

	setState: (newState: Partial<MaestroState>) => {
		set((store) => ({
			state: { ...store.state, ...newState },
			loading: false,
		}));
	},

	setActiveSpec: (specId: string | null) => {
		set((store) => ({
			state: { ...store.state, activeSpec: specId },
		}));
	},

	setGroupBySpec: (groupBySpec: boolean) => {
		set((store) => ({
			state: { ...store.state, groupBySpec },
		}));
	},

	setActiveTab: (tab: MaestroTab) => {
		set((store) => ({
			state: { ...store.state, activeTab: tab },
		}));
	},

	setError: (error: string | null) => {
		set({ error, loading: false });
	},

	setLoading: (loading: boolean) => {
		set({ loading });
	},

	reset: () => {
		set({ state: initialState, loading: false, error: null });
	},
}));

"use client";

import { create } from "zustand";

type ThinkingSources = Record<string, boolean>;

interface BackgroundState {
  micLevel: number;
  outputLevel: number;
  thinkingSources: ThinkingSources;
  setMicLevel: (level: number) => void;
  setOutputLevel: (level: number) => void;
  setThinkingSource: (source: string, active: boolean) => void;
  reset: () => void;
}

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export const useBackgroundStore = create<BackgroundState>((set) => ({
  micLevel: 0,
  outputLevel: 0,
  thinkingSources: {},
  setMicLevel: (level) => set({ micLevel: clamp(level) }),
  setOutputLevel: (level) => set({ outputLevel: clamp(level) }),
  setThinkingSource: (source, active) =>
    set((state) => {
      const next: ThinkingSources = { ...state.thinkingSources };
      if (active) {
        next[source] = true;
      } else {
        delete next[source];
      }
      return { thinkingSources: next };
    }),
  reset: () => set({ micLevel: 0, outputLevel: 0, thinkingSources: {} }),
}));

"use client";

import { create } from "zustand";

type ConnectionStatus = "disconnected" | "connecting" | "connected";

export type TranscriptDirection = "doc-to-patient" | "patient-to-doc";

export type InterpreterActivityState = "idle" | "ready" | "listening" | "translating";

export interface TranscriptEntry {
  id: string;
  direction: TranscriptDirection;
  inputEnglish?: string;
  outputEnglish?: string;
  inputPending?: boolean;
  outputPending?: boolean;
  inputLanguage?: string;
  excludeFromSummary?: boolean;
  timestamp: number;
}

interface InterpreterState {
  status: ConnectionStatus;
  isPaused: boolean;
  isStarted: boolean;
  activityState: InterpreterActivityState;
  patientLanguage: string;
  doctorLanguage: string;
  lastError: string | null;
  transcript: TranscriptEntry[];
  sessionId: string;
  isAssistantSpeaking: boolean;
  isMicOn: boolean;
  setStatus: (status: ConnectionStatus) => void;
  setPaused: (paused: boolean) => void;
  setStarted: (started: boolean) => void;
  setActivityState: (state: InterpreterActivityState) => void;
  setPatientLanguage: (lang: string) => void;
  setDoctorLanguage: (lang: string) => void;
  setError: (err: string | null) => void;
  setIsAssistantSpeaking: (speaking: boolean) => void;
  setIsMicOn: (isOn: boolean) => void;
  addTranscriptEntry: (entry: TranscriptEntry) => void;
  updateTranscriptEntry: (id: string, partial: Partial<TranscriptEntry>) => void;
  resetTranscript: (sessionId?: string) => void;
  reset: () => void;
}

export const useInterpreterStore = create<InterpreterState>((set) => ({
  status: "disconnected",
  isPaused: false,
  isStarted: false,
  activityState: "idle",
  patientLanguage: "arabic",
  doctorLanguage: "english",
  lastError: null,
  transcript: [],
  sessionId: crypto.randomUUID(),
  isAssistantSpeaking: false,
  isMicOn: true,
  setStatus: (status) => set({ status }),
  setPaused: (isPaused) => set({ isPaused }),
  setStarted: (isStarted) => set({ isStarted }),
  setActivityState: (activityState) => set({ activityState }),
  setPatientLanguage: (patientLanguage) => set({ patientLanguage }),
  setDoctorLanguage: (doctorLanguage) => set({ doctorLanguage }),
  setError: (lastError) => set({ lastError }),
  setIsAssistantSpeaking: (isAssistantSpeaking) => {
    console.log("[Store] Setting isAssistantSpeaking:", isAssistantSpeaking);
    set({ isAssistantSpeaking });
  },
  setIsMicOn: (isMicOn) => {
    console.log("[Store] Setting isMicOn:", isMicOn);
    set({ isMicOn });
  },
  addTranscriptEntry: (entry) =>
    set((state) => ({
      transcript: [...state.transcript, entry],
    })),
  updateTranscriptEntry: (id, partial) =>
    set((state) => ({
      transcript: state.transcript.map((e) => (e.id === id ? { ...e, ...partial } : e)),
    })),
  resetTranscript: (sessionId) =>
    set({
      transcript: [],
      isStarted: false,
      activityState: "idle",
      sessionId: sessionId || crypto.randomUUID(),
      isAssistantSpeaking: false,
      isMicOn: true,
    }),
  reset: () =>
    set({
      status: "disconnected",
      isPaused: false,
      isStarted: false,
      activityState: "idle",
      patientLanguage: "arabic",
      doctorLanguage: "english",
      lastError: null,
      transcript: [],
      sessionId: crypto.randomUUID(),
      isAssistantSpeaking: false,
      isMicOn: true,
    }),
}));

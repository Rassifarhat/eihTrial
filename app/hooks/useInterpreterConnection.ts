"use client";

import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";

import { createRealtimeConnection } from "@/app/lib/realtimeConnection";
import {
  buildTranslatorInstructions,
  buildPerTurnReminder,
  buildPatientIntroScript,
} from "@/app/lib/translatorInstructions";
import { useBackgroundStore } from "@/app/store/useBackgroundStore";
import { TranscriptDirection, useInterpreterStore } from "@/app/store/useInterpreterStore";

type TurnDetectionConfig = {
  type: "server_vad";
  threshold: number;
  silence_duration_ms: number;
  interrupt_response?: boolean;
  prefix_padding_ms?: number;
};

const ACTIVE_VAD: TurnDetectionConfig = {
  type: "server_vad",
  threshold: 0.5,
  silence_duration_ms: 1000,
  interrupt_response: false,
  prefix_padding_ms: 300,
};

const LANGUAGE_CODE_MAP: Record<string, string> = {
  english: "en",
  arabic: "ar",
  hindi: "hi",
  urdu: "ur",
  bangali: "bn",
  bengali: "bn",
  nepali: "ne",
  malayalam: "ml",
  spanish: "es",
  tagalog: "tl",
  filipino: "tl",
  tamil: "ta",
};

const normalizeLanguage = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  const base = trimmed.split(/[-_]/)[0];
  const normalized = base.replace(/[^a-z]/g, "");
  if (normalized.length === 2) return normalized;
  return LANGUAGE_CODE_MAP[normalized] || normalized;
};

export function useInterpreterConnection(audioRef: RefObject<HTMLAudioElement | null>) {
  const {
    status,
    setStatus,
    isPaused,
    setPaused,
    isStarted,
    setStarted,
    activityState,
    setActivityState,
    patientLanguage,
    doctorLanguage,
    setError,
    addTranscriptEntry,
    updateTranscriptEntry,
    transcript,
    sessionId,
    resetTranscript,
    isAssistantSpeaking,
    setIsAssistantSpeaking,
    isMicOn,
    setIsMicOn,
  } = useInterpreterStore();

  const setThinkingSource = useBackgroundStore((state) => state.setThinkingSource);
  const setMicLevel = useBackgroundStore((state) => state.setMicLevel);
  const setOutputLevel = useBackgroundStore((state) => state.setOutputLevel);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const isConnectingRef = useRef(false);
  // const isAssistantSpeakingRef = useRef(false); // NOW USING STORE
  const lastDirectionRef = useRef<TranscriptDirection>("doc-to-patient");
  const responseTranscriptRef = useRef<Map<string, { text: string }>>(new Map());
  const awaitingOutputQueueRef = useRef<string[]>([]);
  const outputOnlyQueueRef = useRef<string[]>([]);
  const ignoredResponseIdsRef = useRef<Set<string>>(new Set());
  const connectPromiseRef = useRef<Promise<void> | null>(null);
  const connectResolveRef = useRef<(() => void) | null>(null);
  const connectRejectRef = useRef<((error: Error) => void) | null>(null);

  const turnDetection = useMemo(() => ACTIVE_VAD, []);

  // Web Audio API analyser to detect when audio is actually playing
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const audioPollingRef = useRef<number | null>(null);
  const micContextRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micPollingRef = useRef<number | null>(null);
  const lastOutputLogRef = useRef(0);
  const lastMicLogRef = useRef(0);
  const prevMicOnRef = useRef(isMicOn);

  const stopAudioPolling = useCallback(() => {
    console.log("[Interpreter] Stopping audio polling");
    if (audioPollingRef.current) {
      cancelAnimationFrame(audioPollingRef.current);
      audioPollingRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    remoteStreamRef.current = null;
    setOutputLevel(0);
  }, [setOutputLevel]);

  const stopMicPolling = useCallback(() => {
    if (micPollingRef.current) {
      cancelAnimationFrame(micPollingRef.current);
      micPollingRef.current = null;
    }
    if (micContextRef.current) {
      if (micContextRef.current.state !== "closed") {
        micContextRef.current.close().catch(() => {});
      }
      micContextRef.current = null;
    }
    micAnalyserRef.current = null;
    setMicLevel(0);
  }, [setMicLevel]);

  const startAudioPolling = useCallback((stream: MediaStream) => {
    console.log("[Interpreter] Starting audio polling for stream:", stream.id);

    stopAudioPolling();

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    remoteStreamRef.current = stream;

    const dataArray = new Uint8Array(analyser.fftSize);
    let wasPlaying = false;
    const SILENCE_THRESHOLD = 0.02; // RMS below this is considered silence

    const pollAudio = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (const value of dataArray) {
        const normalized = (value - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const isPlaying = rms > SILENCE_THRESHOLD;
      setOutputLevel(rms);

      if (isPlaying !== wasPlaying) {
        console.log(
          `[Interpreter] Audio playback ${isPlaying ? "DETECTED" : "STOPPED"}. Level: ${rms.toFixed(3)}`,
        );
        setIsAssistantSpeaking(isPlaying);
        wasPlaying = isPlaying;
      }

      const now = Date.now();
      if (now - lastOutputLogRef.current > 1200) {
        console.log(`[Interpreter] Output level: ${rms.toFixed(3)}`);
        lastOutputLogRef.current = now;
      }

      audioPollingRef.current = requestAnimationFrame(pollAudio);
    };

    pollAudio();
  }, [setIsAssistantSpeaking, setOutputLevel, stopAudioPolling]);

  const startMicPolling = useCallback(
    (stream: MediaStream) => {
      stopMicPolling();

      const micContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = micContext.createAnalyser();
      analyser.fftSize = 512;

      const source = micContext.createMediaStreamSource(stream);
      source.connect(analyser);

      micContextRef.current = micContext;
      micAnalyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.fftSize);

      const pollMic = () => {
        if (!micAnalyserRef.current) return;

        micAnalyserRef.current.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (const value of dataArray) {
          const normalized = (value - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        setMicLevel(rms);

        const now = Date.now();
        if (now - lastMicLogRef.current > 1200) {
          console.log(`[Interpreter] Mic level: ${rms.toFixed(3)}`);
          lastMicLogRef.current = now;
        }

        micPollingRef.current = requestAnimationFrame(pollMic);
      };

      pollMic();
    },
    [setMicLevel, stopMicPolling],
  );

  const fetchEphemeralKey = useCallback(async (): Promise<string> => {
    const res = await fetch("/api/session", { cache: "no-store" });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Session fetch failed: ${res.status} ${text}`);
    }
    const data = await res.json();
    const key = data?.client_secret?.value;
    if (!key) {
      throw new Error("No ephemeral key returned from /api/session");
    }
    return key;
  }, []);



  // Removed local isMicOn state in favor of store state
  // const [isMicOn, setIsMicOn] = useState(true);

  const cleanup = useCallback(() => {
    setStatus("disconnected");
    setPaused(false);

    if (dcRef.current) {
      dcRef.current.onopen = null;
      dcRef.current.onmessage = null;
      dcRef.current.onclose = null;
      dcRef.current.onerror = null;
      try {
        dcRef.current.close();
      } catch {
        // ignore
      }
      dcRef.current = null;
    }

    if (pcRef.current) {
      try {
        pcRef.current.getSenders().forEach((sender) => sender.track?.stop());
        pcRef.current.close();
      } catch {
        // ignore
      }
      pcRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }

    // Reset mic state
    setIsMicOn(false);
    setIsAssistantSpeaking(false);
    stopAudioPolling();
    stopMicPolling();
    setThinkingSource("interpreter", false);

    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }

    awaitingOutputQueueRef.current = [];
    outputOnlyQueueRef.current = [];
    responseTranscriptRef.current.clear();
    ignoredResponseIdsRef.current.clear();
    lastDirectionRef.current = "doc-to-patient";
    connectPromiseRef.current = null;
    connectResolveRef.current = null;
    connectRejectRef.current = null;
  }, [
    audioRef,
    setPaused,
    setStatus,
    setIsMicOn,
    setIsAssistantSpeaking,
    setThinkingSource,
    stopAudioPolling,
    stopMicPolling,
  ]);

  const updateMicState = useCallback(() => {
    console.log("[Interpreter] updateMicState called", {
      hasStream: !!micStreamRef.current,
      isPaused,
      isAssistantSpeaking
    });

    if (!micStreamRef.current) {
      console.log("[Interpreter] No mic stream, forcing isMicOn = false");
      setIsMicOn(false);
      return;
    }
    const shouldBeEnabled = !isPaused && !isAssistantSpeaking;
    console.log("[Interpreter] Calculated shouldBeEnabled:", shouldBeEnabled);

    let anyTrackEnabled = false;
    micStreamRef.current.getAudioTracks().forEach(track => {
      if (track.enabled !== shouldBeEnabled) {
        console.log(`[Interpreter] Toggling track ${track.id} from ${track.enabled} to ${shouldBeEnabled}`);
        track.enabled = shouldBeEnabled;
      } else {
        console.log(`[Interpreter] Track ${track.id} already ${track.enabled}`);
      }
      if (track.enabled) anyTrackEnabled = true;
    });

    console.log("[Interpreter] Final calculated anyTrackEnabled:", anyTrackEnabled);
    setIsMicOn(anyTrackEnabled);

    if (!shouldBeEnabled && activityState === "listening") {
      setActivityState("translating");
    } else if (shouldBeEnabled && activityState === "translating") {
      setActivityState("listening");
    }
  }, [isPaused, activityState, setActivityState, isAssistantSpeaking, setIsMicOn]);

  useEffect(() => {
    updateMicState();
  }, [isPaused, isAssistantSpeaking, updateMicState]);

  useEffect(() => {
    const hasPending = transcript.some((entry) => entry.inputPending || entry.outputPending);
    const active =
      status === "connecting" || activityState === "translating" || hasPending;
    setThinkingSource("interpreter", active);
  }, [activityState, setThinkingSource, status, transcript]);

  useEffect(() => {
    return () => setThinkingSource("interpreter", false);
  }, [setThinkingSource]);

  const sendPerTurnReminder = useCallback(() => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open" || !isStarted) return;

    const reminder = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "system",
        content: [
          {
            type: "input_text",
            text: buildPerTurnReminder(),
          },
        ],
      },
    };

    dc.send(JSON.stringify(reminder));
  }, [isStarted]);

  useEffect(() => {
    if (!isStarted) {
      prevMicOnRef.current = isMicOn;
      return;
    }

    if (!prevMicOnRef.current && isMicOn) {
      sendPerTurnReminder();
    }

    prevMicOnRef.current = isMicOn;
  }, [isMicOn, isStarted, sendPerTurnReminder]);

  const sendSessionUpdate = useCallback((overrideTurnDetection?: TurnDetectionConfig) => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open") return;

    const nextTurnDetection = overrideTurnDetection ?? turnDetection;

    const sessionUpdate = {
      type: "session.update",
      session: {
        instructions: buildTranslatorInstructions(doctorLanguage, patientLanguage),
        modalities: ["text", "audio"],
        voice: "alloy",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: { model: "whisper-1" },
        turn_detection: nextTurnDetection,
      },
    };

    dc.send(JSON.stringify(sessionUpdate));
  }, [doctorLanguage, patientLanguage, turnDetection]);

  const resolveDirection = useCallback(
    (detectedLanguage: string) => {
      const detectedCode = normalizeLanguage(detectedLanguage || "unknown");
      const patientCode = normalizeLanguage(patientLanguage);
      const doctorCode = normalizeLanguage(doctorLanguage);

      if (detectedCode && detectedCode === patientCode) {
        return "patient-to-doc" as const;
      }
      if (detectedCode && detectedCode === doctorCode) {
        return "doc-to-patient" as const;
      }
      return lastDirectionRef.current;
    },
    [doctorLanguage, patientLanguage]
  );

  const resolveDirectionFromOutput = useCallback(
    (detectedLanguage: string) => {
      const detectedCode = normalizeLanguage(detectedLanguage || "unknown");
      const patientCode = normalizeLanguage(patientLanguage);
      const doctorCode = normalizeLanguage(doctorLanguage);

      if (detectedCode && detectedCode === patientCode) {
        return "doc-to-patient" as const;
      }
      if (detectedCode && detectedCode === doctorCode) {
        return "patient-to-doc" as const;
      }
      return lastDirectionRef.current;
    },
    [doctorLanguage, patientLanguage]
  );

  const getDefaultNextDirection = useCallback(() => {
    return lastDirectionRef.current === "doc-to-patient" ? "patient-to-doc" : "doc-to-patient";
  }, []);

  const connect = useCallback(async () => {
    if (status === "connected") return;
    if (connectPromiseRef.current) return connectPromiseRef.current;
    if (isConnectingRef.current) return connectPromiseRef.current;

    isConnectingRef.current = true;
    setError(null);
    setStatus("connecting");

    connectPromiseRef.current = new Promise((resolve, reject) => {
      connectResolveRef.current = resolve;
      connectRejectRef.current = reject;
    });
    const connectPromise = connectPromiseRef.current;

    try {
      console.log("[Interpreter] Requesting microphone access...");
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("[Interpreter] Microphone acquired, stream ID:", micStream.id);
      micStreamRef.current = micStream;
      console.log("[Interpreter] Calling updateMicState after acquiring mic stream");
      updateMicState();
      startMicPolling(micStream);

      const key = await fetchEphemeralKey();
      const { pc, dc, remoteStream } = await createRealtimeConnection(key, audioRef, micStream);
      pcRef.current = pc;
      dcRef.current = dc;

      if (remoteStream) {
        startAudioPolling(remoteStream);
      }

      pc.ontrack = (e) => {
        console.log("[Interpreter] Received remote track, starting audio polling");
        if (e.streams[0]) {
          startAudioPolling(e.streams[0]);
        }
      };

      dc.onopen = () => {
        setStatus("connected");
        setActivityState("ready");
        connectResolveRef.current?.();
        connectPromiseRef.current = null;
        connectResolveRef.current = null;
        connectRejectRef.current = null;
      };

      dc.onclose = () => {
        connectRejectRef.current?.(new Error("Data channel closed"));
        connectPromiseRef.current = null;
        connectResolveRef.current = null;
        connectRejectRef.current = null;
        cleanup();
      };
      dc.onerror = (err) => {
        console.error("Data channel error", err);
        setError("Data channel error");
        connectRejectRef.current?.(new Error("Data channel error"));
        connectPromiseRef.current = null;
        connectResolveRef.current = null;
        connectRejectRef.current = null;
        cleanup();
      };
      dc.onmessage = (evt) => {
        try {
          const parsed = JSON.parse(evt.data);
          const eventType = parsed?.type;

          console.log("[realtime] event:", eventType);

          if (eventType === "response.created" || eventType === "response.done") {
            const response = parsed?.response;
            const responseId = response?.id;
            const purpose = response?.metadata?.purpose;
            if (responseId && purpose === "patient_intro") {
              ignoredResponseIdsRef.current.add(responseId);
            }
          }

          if (eventType === "input_audio_buffer.speech_started" && isStarted) {
            setActivityState("listening");
          }

          if (eventType === "input_audio_buffer.speech_stopped" && isStarted) {
            setActivityState("translating");
          }

          // Track assistant speaking state for local mic muting
          if (
            eventType === "response.audio.started" ||
            eventType === "response.output_audio.started" ||
            eventType === "conversation.item.output_audio.started"
          ) {
            // isAssistantSpeakingRef.current = true;
            // updateMicState();
            if (isStarted) setActivityState("translating");
          }

          if (
            eventType === "response.audio.done" ||
            eventType === "response.done" ||
            eventType === "response.output_audio.done" ||
            eventType === "conversation.item.output_audio.done"
          ) {
            // isAssistantSpeakingRef.current = false;
            // updateMicState();
            if (isStarted) setActivityState("listening");
          }

          if (parsed.type === "error") {
            setError(parsed?.error?.message || "Realtime error");
          }

          if (
            parsed.type === "conversation.item.input_audio_transcription.completed" &&
            isStarted
          ) {
            const transcriptText = String(parsed?.transcript || "").trim();
            if (!transcriptText) return;

            const outputOnlyEntryId = outputOnlyQueueRef.current.shift();
            const entryId = outputOnlyEntryId || crypto.randomUUID();
            const defaultDirection = getDefaultNextDirection();

            console.log("[Interpreter] Input transcription:", {
              entryId,
              transcriptText,
              defaultDirection,
              outputOnlyEntryId,
            });

            if (!outputOnlyEntryId) {
              addTranscriptEntry({
                id: entryId,
                direction: defaultDirection,
                inputPending: true,
                timestamp: Date.now(),
              });
              awaitingOutputQueueRef.current.push(entryId);
            } else {
              updateTranscriptEntry(entryId, {
                inputPending: true,
                direction: defaultDirection,
              });
            }

            fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: transcriptText,
                target: "english",
                includeDetection: true,
              }),
            })
              .then((r) => r.json())
              .then((res) => {
                console.log("[Interpreter] Input translation result:", res);
                const translated = res?.translated as string | undefined;
                const detectedLanguage = res?.detectedLanguage as string | undefined;
                const direction = resolveDirection(detectedLanguage || "");
                lastDirectionRef.current = direction;

                updateTranscriptEntry(entryId, {
                  inputEnglish: translated || "[Translation unavailable]",
                  inputPending: false,
                  direction,
                  inputLanguage: detectedLanguage || "unknown",
                });
              })
              .catch((err) => {
                console.error("[Interpreter] Input translation failed:", err);
                updateTranscriptEntry(entryId, {
                  inputEnglish: "[Translation failed]",
                  inputPending: false,
                });
              });
          }

          if (
            parsed.type === "response.audio_transcript.delta" ||
            parsed.type === "response.audio_transcript.done" ||
            parsed.type === "response.output_audio_transcript.delta" ||
            parsed.type === "response.output_audio_transcript.done"
          ) {
            console.log("[Interpreter] Transcript event:", parsed.type);
            const responseId =
              parsed.response_id || parsed.response?.id || parsed?.response?.response_id || "default";
            if (ignoredResponseIdsRef.current.has(responseId)) return;

            const existing = responseTranscriptRef.current.get(responseId) || { text: "" };
            if (
              parsed.type === "response.audio_transcript.delta" ||
              parsed.type === "response.output_audio_transcript.delta"
            ) {
              const delta = parsed?.delta || "";
              console.log("[Interpreter] Delta received:", delta);
              existing.text += delta;
              responseTranscriptRef.current.set(responseId, existing);
            } else {
              const finalText = existing.text.trim();
              console.log("[Interpreter] Final transcript:", { finalText });
              responseTranscriptRef.current.delete(responseId);

              if (finalText) {
                let entryId = awaitingOutputQueueRef.current.shift();
                const createdNew = !entryId;
                const defaultDirection = getDefaultNextDirection();
                if (!entryId) {
                  entryId = crypto.randomUUID();
                  addTranscriptEntry({
                    id: entryId,
                    direction: defaultDirection,
                    outputPending: true,
                    inputPending: defaultDirection === "patient-to-doc",
                    timestamp: Date.now(),
                  });
                  outputOnlyQueueRef.current.push(entryId);
                } else {
                  updateTranscriptEntry(entryId, {
                    outputPending: true,
                    direction: defaultDirection,
                  });
                }

                if (!createdNew) {
                  console.log("[Interpreter] Attaching output to entry:", entryId);
                }

                console.log("[Interpreter] Fetching back-translation for:", finalText);
                fetch("/api/translate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    text: finalText,
                    target: "english",
                    includeDetection: true,
                  }),
                })
                  .then((r) => r.json())
                  .then((res) => {
                    console.log("[Interpreter] Output translation result:", res);
                    const detectedLanguage = res?.detectedLanguage as string | undefined;
                    const directionFromOutput = resolveDirectionFromOutput(detectedLanguage || "");
                    lastDirectionRef.current = directionFromOutput;
                    const translatedText = res?.translated as string | undefined;
                    const outputText = translatedText || "[Translation unavailable]";
                    const outputUpdate = {
                      direction: directionFromOutput,
                      outputEnglish: outputText,
                      outputPending: false,
                    };

                    if (directionFromOutput === "patient-to-doc") {
                      updateTranscriptEntry(entryId, {
                        ...outputUpdate,
                        inputEnglish: translatedText || outputText,
                        inputPending: false,
                      });
                    } else {
                      updateTranscriptEntry(entryId, outputUpdate);
                    }
                  })
                  .catch((err) => {
                    console.error("[Interpreter] Back-translation failed:", err);
                    updateTranscriptEntry(entryId, {
                      outputEnglish: "[Translation failed]",
                      outputPending: false,
                    });
                  });
              }
            }
          }
        } catch (e) {
          console.warn("Non-JSON message", evt.data);
        }
      };
    } catch (err: any) {
      console.error("connect failed", err);
      setError(err?.message || "Unable to connect");
      connectRejectRef.current?.(err instanceof Error ? err : new Error("Unable to connect"));
      connectPromiseRef.current = null;
      connectResolveRef.current = null;
      connectRejectRef.current = null;
      cleanup();
    } finally {
      isConnectingRef.current = false;
    }
    return connectPromise;
  }, [
    addTranscriptEntry,
    audioRef,
    cleanup,
    fetchEphemeralKey,
    getDefaultNextDirection,
    isStarted,
    resolveDirection,
    resolveDirectionFromOutput,
    setActivityState,
    setError,
    setStatus,
    startAudioPolling,
    startMicPolling,
    status,
    updateMicState,
    updateTranscriptEntry,
  ]);

  // Start interpretation - connects (if needed), updates UI state, sends session config and intro message
  const startInterpretation = useCallback(async () => {
    if (isStarted) return;

    if (status !== "connected") {
      try {
        await connect();
      } catch {
        return;
      }
    }

    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open") return;

    setStarted(true);
    setActivityState("listening");

    sendSessionUpdate();

    const introScript = buildPatientIntroScript(patientLanguage, doctorLanguage);

    const introMessage = {
      type: "response.create",
      response: {
        modalities: ["text", "audio"],
        input: [
          {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Say in ${patientLanguage}: ${introScript}`,
              },
            ],
          },
        ],
        metadata: { purpose: "patient_intro" },
      },
    };
    dc.send(JSON.stringify(introMessage));
  }, [connect, doctorLanguage, isStarted, patientLanguage, sendSessionUpdate, setStarted, setActivityState, status]);

  const pause = useCallback(() => {
    setPaused(true);
  }, [setPaused]);

  const resume = useCallback(() => {
    setPaused(false);
  }, [setPaused]);

  const stop = useCallback(() => {
    if (transcript.length) {
      fetch("/api/save-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          doctorLanguage,
          patientLanguage,
          entries: transcript,
          generateSummary: true,
        }),
      }).catch((err) => console.error("save transcript failed", err));
    }
    setStarted(false);
    setActivityState("idle");
    cleanup();
    resetTranscript();
  }, [cleanup, doctorLanguage, patientLanguage, resetTranscript, sessionId, transcript, setStarted, setActivityState]);

  // Apply updated instructions when languages change while connected and started.
  useEffect(() => {
    if (status === "connected" && isStarted) {
      sendSessionUpdate();
    }
  }, [doctorLanguage, patientLanguage, sendSessionUpdate, status, isStarted]);

  // React immediately to language changes via store subscription to avoid stale instructions.
  // Note: The useEffect above handles language changes, this is an additional safety net
  // for any edge cases where the effect might not fire due to timing.

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    connect,
    startInterpretation,
    pause,
    resume,
    stop,
    // isMicOn is now in store, can be accessed directly or via this return.
    // Keeping it here for compatibility with existing usage in page.tsx if any
    isMicOn,
  };
}

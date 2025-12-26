"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useInterpreterStore } from "@/app/store/useInterpreterStore";
import { useInterpreterConnection } from "@/app/hooks/useInterpreterConnection";

const patientLanguages = [
  "arabic",
  "hindi",
  "urdu",
  "bangali",
  "nepali",
  "malayalam",
  "spanish",
  "tagalog",
  "tamil",
] as const;

const doctorLanguages = ["english", "hindi", "arabic"] as const;

function useAutoScroll(deps: Array<string | number | boolean | undefined>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
      stickToBottomRef.current = distance < 120;
    };

    onScroll();
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (stickToBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, deps);

  return { containerRef, bottomRef };
}

export default function InterpreterPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    status,
    isPaused,
    isStarted,
    activityState,
    patientLanguage,
    doctorLanguage,
    lastError,
    setPatientLanguage,
    setDoctorLanguage,
    transcript,
  } = useInterpreterStore();

  const { startInterpretation, pause, resume, stop, isMicOn } = useInterpreterConnection(audioRef);

  const visibleEntries = transcript.filter((entry) => !entry.excludeFromSummary);
  const transcriptScroll = useAutoScroll([
    visibleEntries.length,
    visibleEntries[visibleEntries.length - 1]?.inputEnglish,
    visibleEntries[visibleEntries.length - 1]?.outputEnglish,
    visibleEntries[visibleEntries.length - 1]?.inputPending,
    visibleEntries[visibleEntries.length - 1]?.outputPending,
  ]);

  // Activity state label and color
  const activityLabel = {
    idle: "Idle",
    ready: "Ready",
    listening: "Listening…",
    translating: "Translating…",
  }[activityState];

  const activityColor = {
    idle: "rgba(255,255,255,0.5)",
    ready: "#ffcc00",
    listening: "#34c759",
    translating: "#007aff",
  }[activityState];

  const statusLabel = {
    connecting: "Connecting…",
    connected: isStarted ? "Interpreting" : "Connected",
    disconnected: "Disconnected",
  }[status];

  const startButtonLabel =
    status === "connecting" ? "Connecting..." : isStarted ? "Interpreting..." : "Start Interpreting";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06), transparent 35%), radial-gradient(circle at 80% 0%, rgba(52,199,89,0.08), transparent 45%), linear-gradient(180deg, rgba(12,12,16,0.6) 0%, rgba(22,22,28,0.75) 100%)",
        color: "#f5f5f7",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 1.5rem 3rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              href="/"
              style={{
                color: "rgba(255,255,255,0.65)",
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              ← Back
            </Link>
            <div style={{ fontSize: "1.3rem", fontWeight: 500, letterSpacing: "0.04em" }}>
              Interpreter
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: status === "connected" ? (isStarted ? "rgba(52,199,89,0.18)" : "rgba(255,204,0,0.18)") : "rgba(255,255,255,0.06)",
                color: status === "connected" ? (isStarted ? "#34c759" : "#ffcc00") : "rgba(255,255,255,0.75)",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              {statusLabel}
            </span>
            {isStarted && (
              <span
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "999px",
                  border: `1px solid ${activityColor}30`,
                  background: `${activityColor}18`,
                  color: activityColor,
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
              >
                {activityLabel}
              </span>
            )}
            {lastError && (
              <span
                style={{
                  color: "#ff453a",
                  fontSize: "0.9rem",
                }}
              >
                {lastError}
              </span>
            )}
            {status === "connected" && (
              <span
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "999px",
                  border: isMicOn ? "1px solid rgba(52,199,89,0.35)" : "1px solid rgba(255,69,58,0.35)",
                  background: isMicOn ? "rgba(52,199,89,0.18)" : "rgba(255,69,58,0.18)",
                  color: isMicOn ? "#34c759" : "#ff453a",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
              >
                {isMicOn ? "Mic On" : "Mic Off"}
              </span>
            )}
          </div>
        </header>

        <div
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.25))",
            borderRadius: "22px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
            padding: "1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.25rem",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.7)" }}>
              Patient language
            </label>
            <select
              value={patientLanguage}
              onChange={(e) => setPatientLanguage(e.target.value)}
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "#f5f5f7",
                fontSize: "1rem",
                outline: "none",
              }}
            >
              {patientLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.7)" }}>
              Doctor language
            </label>
            <select
              value={doctorLanguage}
              onChange={(e) => setDoctorLanguage(e.target.value)}
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "#f5f5f7",
                fontSize: "1rem",
                outline: "none",
              }}
            >
              {doctorLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              justifyContent: "flex-end",
            }}
          >
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                onClick={startInterpretation}
                disabled={status === "connecting" || isStarted}
                style={{
                  padding: "0.85rem 1.2rem",
                  borderRadius: "14px",
                  border: "1px solid rgba(52,199,89,0.35)",
                  background: isStarted ? "rgba(52,199,89,0.25)" : "rgba(52,199,89,0.12)",
                  color: "#34c759",
                  fontSize: "0.95rem",
                  cursor: status !== "connecting" && !isStarted ? "pointer" : "not-allowed",
                  opacity: status !== "connecting" && !isStarted ? 1 : 0.6,
                  minWidth: "150px",
                  fontWeight: 600,
                }}
              >
                {startButtonLabel}
              </button>
              <button
                onClick={isPaused ? resume : pause}
                disabled={status !== "connected" || !isStarted}
                style={{
                  padding: "0.85rem 1.2rem",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#f5f5f7",
                  fontSize: "0.95rem",
                  cursor: status === "connected" && isStarted ? "pointer" : "not-allowed",
                  opacity: status === "connected" && isStarted ? 1 : 0.6,
                  minWidth: "100px",
                }}
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={stop}
                style={{
                  padding: "0.85rem 1.2rem",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,69,58,0.35)",
                  background: "rgba(255,69,58,0.12)",
                  color: "#ff453a",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  minWidth: "100px",
                }}
              >
                Stop
              </button>
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
              Click Start Interpreting to connect and begin. Pause raises the VAD threshold to minimize delay; Stop ends the session.
            </div>
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(0,0,0,0.3))",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "1.1rem",
            boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
          }}
        >
          <div
            ref={transcriptScroll.containerRef}
            style={{
              minHeight: "220px",
              maxHeight: "360px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {visibleEntries.length === 0 && (
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}>
                Conversation will appear here.
              </div>
            )}
            {visibleEntries.map((entry) => {
              const isPatient = entry.direction === "patient-to-doc";
              const displayText = isPatient
                ? entry.inputEnglish || entry.outputEnglish
                : entry.outputEnglish;
              const isPending = isPatient
                ? Boolean(entry.inputPending || (entry.outputPending && !entry.inputEnglish))
                : Boolean(entry.outputPending);

              return (
                <div
                  key={entry.id}
                  style={{
                    alignSelf: isPatient ? "flex-end" : "flex-start",
                    maxWidth: "78%",
                    padding: "0.85rem 0.95rem",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: isPatient ? "rgba(255,255,255,0.04)" : "rgba(52,199,89,0.08)",
                    color: "#f5f5f7",
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{isPatient ? "Patient" : "Doctor"}</div>
                  {!isPatient && (
                    <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.35rem" }}>
                      What the patient actually heard
                    </div>
                  )}
                  <div style={{ fontWeight: 600 }}>
                    {isPending ? (
                      <span style={{ color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
                        Translating to English...
                      </span>
                    ) : (
                      displayText || "…"
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={transcriptScroll.bottomRef} />
          </div>
        </div>

        <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }} />
      </div >
    </div >
  );
}

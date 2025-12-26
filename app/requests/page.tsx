"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBackgroundStore } from "@/app/store/useBackgroundStore";

type Step = 1 | 2 | 3 | 4;

const insurers = [
  { name: "Thiqa", accent: "#34c759" },
  { name: "Daman", accent: "#0a84ff" },
  { name: "Nas", accent: "#5e5ce6" },
  { name: "Adnic", accent: "#30b0c7" },
  { name: "Buhayra", accent: "#64d2ff" },
  { name: "Inaya", accent: "#bf5af2" },
  { name: "Sukoun", accent: "#ff6a5a" },
] as const;

const tests = [
  { name: "MRI", description: "Detailed soft tissue imaging" },
  { name: "CT Scan", description: "High-resolution body imaging" },
  { name: "Physiotherapy", description: "12 sessions mandated" },
  { name: "Admission", description: "Inpatient care request" },
  { name: "Medical Report", description: "Narrative summary only" },
] as const;

const stepCopy: Record<Step, string> = {
  1: "Choose the payer",
  2: "Pick the request type",
  3: "Dictate your clinical note",
  4: "Ready to send",
};

export default function RequestsPage() {
  const [step, setStep] = useState<Step>(1);
  const [insurer, setInsurer] = useState<string | null>(null);
  const [testType, setTestType] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultPath, setResultPath] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);

  const setThinkingSource = useBackgroundStore((state) => state.setThinkingSource);
  const setMicLevel = useBackgroundStore((state) => state.setMicLevel);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const micContextRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micPollingRef = useRef<number | null>(null);
  const lastMicLogRef = useRef(0);

  const nextEnabled = useMemo(() => insurer && testType && audioBlob, [audioBlob, insurer, testType]);

  const getSupportedMimeType = (): string => {
    const types = ["audio/webm", "audio/mp4", "audio/wav"];
    for (const type of types) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) return type;
    }
    return "audio/webm";
  };

  const stopMicMonitoring = useCallback(() => {
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

  const startMicMonitoring = useCallback(
    (stream: MediaStream) => {
      stopMicMonitoring();
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
          console.log(`[Requests] Mic level: ${rms.toFixed(3)}`);
          lastMicLogRef.current = now;
        }

        micPollingRef.current = requestAnimationFrame(pollMic);
      };

      pollMic();
    },
    [setMicLevel, stopMicMonitoring],
  );

  useEffect(() => {
    setThinkingSource("requests", processing || emailSending);
  }, [emailSending, processing, setThinkingSource]);

  useEffect(() => {
    return () => setThinkingSource("requests", false);
  }, [setThinkingSource]);

  useEffect(() => {
    return () => {
      stopMicMonitoring();
    };
  }, [stopMicMonitoring]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startMicMonitoring(stream);
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
        stopMicMonitoring();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopMicMonitoring();
    }
  };

  const submitRequest = async (shouldEmail: boolean) => {
    if (!audioBlob || !insurer || !testType) return;
    setProcessing(!shouldEmail);
    setEmailSending(shouldEmail);
    setError(null);
    setResultPath(null);
    setEmailSent(false);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("insurer", insurer);
      formData.append("testType", testType);
      if (shouldEmail) {
        formData.append("sendEmail", "yes");
      }

      const response = await fetch("/api/process-voice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to process request");
      }

      const data = await response.json();
      setResultPath(data.filePath);
      setEmailSent(Boolean(data.emailSent));
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setProcessing(false);
      setEmailSending(false);
    }
  };

  const reset = () => {
    setStep(1);
    setInsurer(null);
    setTestType(null);
    setAudioBlob(null);
    setResultPath(null);
    setEmailSent(false);
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06), transparent 30%), radial-gradient(circle at 80% 0%, rgba(52,199,89,0.08), transparent 32%), linear-gradient(145deg, rgba(11,11,15,0.65) 0%, rgba(20,22,29,0.7) 50%, rgba(13,17,24,0.75) 100%)",
        color: "#f5f5f7",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2.5rem 1.5rem 3rem",
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
                color: "rgba(255,255,255,0.75)",
                textDecoration: "none",
                fontSize: "0.95rem",
                padding: "0.45rem 0.8rem",
                borderRadius: "999px",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              ← Home
            </Link>
            <div style={{ fontSize: "1.4rem", fontWeight: 600, letterSpacing: "0.02em" }}>
              Requests filler
            </div>
          </div>
          <div
            style={{
              padding: "0.5rem 0.85rem",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.75)",
              fontSize: "0.95rem",
            }}
          >
            {stepCopy[step]}
          </div>
        </header>

        <div
          style={{
            background: "linear-gradient(160deg, rgba(255,255,255,0.08), rgba(0,0,0,0.25))",
            borderRadius: "28px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
            padding: "1.5rem",
            display: "grid",
            gridTemplateColumns: "minmax(260px, 320px) 1fr",
            gap: "1.2rem",
          }}
        >
          <div
            style={{
              borderRadius: "22px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 45%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{ color: "rgba(255,255,255,0.68)", fontSize: "0.95rem", marginBottom: "0.4rem" }}>
                Steps
              </p>
              <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {[1, 2, 3, 4].map((n) => (
                  <li
                    key={n}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.6rem 0.75rem",
                      borderRadius: "14px",
                      background: step === n ? "rgba(255,255,255,0.08)" : "transparent",
                      border: step === n ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                      color: step === n ? "#fff" : "rgba(255,255,255,0.7)",
                      fontWeight: step === n ? 600 : 500,
                      transition: "all 180ms ease",
                    }}
                  >
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.18)",
                        display: "grid",
                        placeItems: "center",
                        background: step === n ? "rgba(52,199,89,0.2)" : "rgba(255,255,255,0.04)",
                        color: step === n ? "#34c759" : "rgba(255,255,255,0.7)",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                      }}
                    >
                      {n}
                    </span>
                    <span style={{ fontSize: "0.95rem" }}>{stepCopy[n as Step]}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div style={{ position: "relative", zIndex: 1, marginTop: "0.5rem", color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", lineHeight: 1.4 }}>
              Dictate once. We transcribe, summarize, fill the insurer PDF, and optionally email it to Farhat.
            </div>
          </div>

          <div
            style={{
              borderRadius: "22px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(8,8,10,0.55)",
              padding: "1.5rem",
              minHeight: "480px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              display: "flex",
              flexDirection: "column",
              gap: "1.1rem",
            }}
          >
            {step === 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.9rem" }}>
                {insurers.map((ins) => {
                  const active = insurer === ins.name;
                  return (
                    <button
                      key={ins.name}
                      onClick={() => {
                        setInsurer(ins.name);
                        setStep(2);
                      }}
                      style={{
                        borderRadius: "16px",
                        border: active ? `1px solid ${ins.accent}` : "1px solid rgba(255,255,255,0.08)",
                        padding: "1rem",
                        textAlign: "left",
                        background: active ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                        color: "#fff",
                        boxShadow: active ? `0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)` : "0 10px 25px rgba(0,0,0,0.25)",
                        transition: "all 160ms ease",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          background: `${ins.accent}33`,
                          border: `1px solid ${ins.accent}55`,
                          display: "grid",
                          placeItems: "center",
                          color: ins.accent,
                          fontWeight: 700,
                          marginBottom: "0.6rem",
                        }}
                      >
                        {ins.name[0]}
                      </div>
                      <div style={{ fontWeight: 600 }}>{ins.name}</div>
                      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", marginTop: "0.15rem" }}>
                        Prior auth PDF template detected
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.9rem" }}>
                {tests.map((t) => {
                  const active = testType === t.name;
                  return (
                    <button
                      key={t.name}
                      onClick={() => {
                        setTestType(t.name);
                        setStep(3);
                      }}
                      style={{
                        borderRadius: "16px",
                        border: active ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.08)",
                        padding: "1rem",
                        textAlign: "left",
                        background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                        color: "#fff",
                        boxShadow: active ? "0 12px 32px rgba(0,0,0,0.28)" : "0 10px 25px rgba(0,0,0,0.22)",
                        transition: "all 160ms ease",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{t.name}</div>
                      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
                        {t.description}
                      </div>
                    </button>
                  );
                })}
                <div style={{ gridColumn: "1 / -1" }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      textDecoration: "none",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                    }}
                  >
                    ← Change insurer
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", textAlign: "center" }}>
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    startRecording();
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    stopRecording();
                  }}
                  disabled={processing}
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: isRecording
                      ? "linear-gradient(145deg, #ff3b30, #ff453a)"
                      : "linear-gradient(145deg, #ffffff0f, #ffffff22)",
                    color: "#fff",
                    boxShadow: isRecording
                      ? "0 25px 50px rgba(255,69,58,0.45), 0 0 0 12px rgba(255,69,58,0.18)"
                      : "0 20px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
                    transform: isRecording ? "scale(1.08)" : "scale(1)",
                    transition: "all 150ms ease",
                    display: "grid",
                    placeItems: "center",
                    cursor: processing ? "not-allowed" : "pointer",
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    style={{ opacity: 0.95 }}
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </button>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>
                    {processing ? "Generating..." : isRecording ? "Recording..." : audioBlob ? "Recording captured" : "Hold to record"}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.65)", maxWidth: "420px", lineHeight: 1.5 }}>
                    Dictate the complaint, brief history, and justification for the {testType}. Release to stop.
                  </div>
                </div>
                {error && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      background: "rgba(255,59,48,0.1)",
                      border: "1px solid rgba(255,59,48,0.4)",
                      color: "#ff453a",
                      fontSize: "0.95rem",
                    }}
                  >
                    {error}
                  </div>
                )}
                <div style={{ display: "flex", gap: "0.75rem", width: "100%", maxWidth: "520px" }}>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      flex: 1,
                      padding: "0.85rem 1rem",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.04)",
                      color: "#f5f5f7",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Back
                  </button>
                  {audioBlob && !isRecording && (
                    <button
                      onClick={() => submitRequest(false)}
                      disabled={processing}
                      style={{
                        flex: 1,
                        padding: "0.85rem 1rem",
                        borderRadius: "14px",
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: "linear-gradient(135deg, #ffffff, #f2f2f7)",
                        color: "#0f0f12",
                        fontWeight: 700,
                        cursor: processing ? "not-allowed" : "pointer",
                        boxShadow: "0 16px 32px rgba(0,0,0,0.25)",
                        opacity: processing ? 0.7 : 1,
                      }}
                    >
                      {processing ? "Generating..." : "Generate request"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === 4 && resultPath && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div
                  style={{
                    width: "86px",
                    height: "86px",
                    borderRadius: "24px",
                    background: "linear-gradient(145deg, #34c759, #2ec946)",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    fontSize: "2rem",
                    boxShadow: "0 20px 45px rgba(52,199,89,0.35)",
                  }}
                >
                  ✓
                </div>
                <div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                    Request saved
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.7)", maxWidth: "640px", lineHeight: 1.5 }}>
                    The {insurer} {testType} authorization form was generated. You can find it at:
                  </div>
                </div>
                <div
                  style={{
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                    padding: "0.95rem 1.1rem",
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: "ui-monospace, SFMono-Regular, SFMono, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {resultPath}
                </div>
                {emailSent && (
                  <div
                    style={{
                      borderRadius: "12px",
                      border: "1px solid rgba(52,199,89,0.32)",
                      background: "rgba(52,199,89,0.12)",
                      color: "#d1f7d6",
                      padding: "0.75rem 1rem",
                      fontWeight: 600,
                    }}
                  >
                    Email sent to farhat.rassi@eih.ae
                  </div>
                )}
                {error && (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      background: "rgba(255,59,48,0.1)",
                      border: "1px solid rgba(255,59,48,0.4)",
                      color: "#ff453a",
                    }}
                  >
                    {error}
                  </div>
                )}
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button
                    onClick={reset}
                    style={{
                      padding: "0.85rem 1.1rem",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.04)",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Create another
                  </button>
                  {!emailSent && (
                    <button
                      onClick={() => submitRequest(true)}
                      disabled={emailSending}
                      style={{
                        padding: "0.85rem 1.1rem",
                        borderRadius: "14px",
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: "linear-gradient(135deg, #0a84ff, #5e5ce6)",
                        color: "#fff",
                        fontWeight: 700,
                        cursor: emailSending ? "not-allowed" : "pointer",
                        boxShadow: "0 18px 36px rgba(14,122,254,0.35)",
                        opacity: emailSending ? 0.75 : 1,
                      }}
                    >
                      {emailSending ? "Sending..." : "Send to email"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {!resultPath && step !== 3 && (
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem" }}>
                {step === 1 && "Pick the insurer template you want to fill."}
                {step === 2 && "Select the type of authorization you need."}
              </div>
            )}

            {step === 3 && !audioBlob && (
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", textAlign: "center" }}>
                Hold the mic button to record. Release to stop; you can re-record before generating.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

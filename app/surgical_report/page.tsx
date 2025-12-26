"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBackgroundStore } from "@/app/store/useBackgroundStore";

type Step = 1 | 2 | 3;

const stepCopy: Record<Step, string> = {
  1: "Dictate patient & surgery info",
  2: "AI generates operative report",
  3: "Review and send",
};

export default function SurgicalReportPage() {
  const [step, setStep] = useState<Step>(1);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
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
          console.log(`[SurgicalReport] Mic level: ${rms.toFixed(3)}`);
          lastMicLogRef.current = now;
        }

        micPollingRef.current = requestAnimationFrame(pollMic);
      };

      pollMic();
    },
    [setMicLevel, stopMicMonitoring],
  );

  useEffect(() => {
    setThinkingSource("surgical-report", processing || emailSending);
  }, [emailSending, processing, setThinkingSource]);

  useEffect(() => {
    return () => setThinkingSource("surgical-report", false);
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

  const submitRequest = async () => {
    if (!audioBlob) return;
    setProcessing(true);
    setError(null);
    setReport(null);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/surgical-report", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to process request");
      }

      const data = await response.json();
      setReport(data.report);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  const sendEmail = async () => {
    if (!report) return;
    setEmailSending(true);
    setError(null);

    try {
      const response = await fetch("/api/surgical-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report, sendEmail: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to send email");
      }

      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setEmailSending(false);
    }
  };

  const reset = () => {
    setStep(1);
    setAudioBlob(null);
    setReport(null);
    setEmailSent(false);
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06), transparent 30%), radial-gradient(circle at 80% 0%, rgba(220,38,38,0.08), transparent 32%), linear-gradient(145deg, rgba(11,11,15,0.65) 0%, rgba(20,22,29,0.7) 50%, rgba(13,17,24,0.75) 100%)",
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
              &larr; Home
            </Link>
            <div style={{ fontSize: "1.4rem", fontWeight: 600, letterSpacing: "0.02em" }}>
              Surgical Report Generator
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
                background: "radial-gradient(circle at 20% 20%, rgba(220,38,38,0.08), transparent 45%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{ color: "rgba(255,255,255,0.68)", fontSize: "0.95rem", marginBottom: "0.4rem" }}>
                Steps
              </p>
              <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {[1, 2, 3].map((n) => (
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
                        background: step === n ? "rgba(220,38,38,0.2)" : "rgba(255,255,255,0.04)",
                        color: step === n ? "#dc2626" : "rgba(255,255,255,0.7)",
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
              Dictate patient data, surgery details, and findings. AI generates a comprehensive operative report with all required documentation.
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
              overflow: "auto",
            }}
          >
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", textAlign: "center" }}>
                <div style={{
                  padding: "1rem",
                  borderRadius: "16px",
                  background: "rgba(220,38,38,0.08)",
                  border: "1px solid rgba(220,38,38,0.2)",
                  maxWidth: "600px",
                  marginBottom: "0.5rem"
                }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#dc2626" }}>Required Information</div>
                  <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", lineHeight: 1.6, textAlign: "left" }}>
                    Please dictate: <strong>Patient gender, age, diagnosis, brief history, risk factors, surgery title</strong> with details like anesthesia used and tourniquet if applicable.
                  </div>
                </div>

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
                      ? "linear-gradient(145deg, #dc2626, #ef4444)"
                      : "linear-gradient(145deg, #ffffff0f, #ffffff22)",
                    color: "#fff",
                    boxShadow: isRecording
                      ? "0 25px 50px rgba(220,38,38,0.45), 0 0 0 12px rgba(220,38,38,0.18)"
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
                    {processing ? "Generating report..." : isRecording ? "Recording..." : audioBlob ? "Recording captured" : "Hold to record"}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.65)", maxWidth: "420px", lineHeight: 1.5 }}>
                    Dictate all patient and surgery information. The AI will ask follow-up questions if needed.
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
                {audioBlob && !isRecording && (
                  <div style={{ display: "flex", gap: "0.75rem", width: "100%", maxWidth: "520px" }}>
                    <button
                      onClick={() => setAudioBlob(null)}
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
                      Re-record
                    </button>
                    <button
                      onClick={submitRequest}
                      disabled={processing}
                      style={{
                        flex: 1,
                        padding: "0.85rem 1rem",
                        borderRadius: "14px",
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: "linear-gradient(135deg, #dc2626, #ef4444)",
                        color: "#fff",
                        fontWeight: 700,
                        cursor: processing ? "not-allowed" : "pointer",
                        boxShadow: "0 16px 32px rgba(220,38,38,0.25)",
                        opacity: processing ? 0.7 : 1,
                      }}
                    >
                      {processing ? "Generating..." : "Generate Report"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    border: "3px solid rgba(220,38,38,0.3)",
                    borderTopColor: "#dc2626",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 1rem"
                  }} />
                  <div style={{ fontWeight: 600 }}>Generating comprehensive operative report...</div>
                  <div style={{ color: "rgba(255,255,255,0.65)", marginTop: "0.5rem" }}>This may take a moment</div>
                </div>
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}

            {step === 3 && report && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "16px",
                      background: "linear-gradient(145deg, #dc2626, #ef4444)",
                      display: "grid",
                      placeItems: "center",
                      color: "#fff",
                      fontSize: "1.5rem",
                      boxShadow: "0 12px 30px rgba(220,38,38,0.35)",
                    }}
                  >
                    &#10003;
                  </div>
                  <div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>Report Generated</div>
                    <div style={{ color: "rgba(255,255,255,0.7)" }}>Review the comprehensive operative documentation below</div>
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                    padding: "1.25rem",
                    maxHeight: "400px",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    fontFamily: "ui-monospace, SFMono-Regular, SFMono, Menlo, Monaco, Consolas, monospace",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  {report}
                </div>

                {emailSent && (
                  <div
                    style={{
                      borderRadius: "12px",
                      border: "1px solid rgba(220,38,38,0.32)",
                      background: "rgba(220,38,38,0.12)",
                      color: "#fca5a5",
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
                      onClick={sendEmail}
                      disabled={emailSending}
                      style={{
                        padding: "0.85rem 1.1rem",
                        borderRadius: "14px",
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: "linear-gradient(135deg, #dc2626, #ef4444)",
                        color: "#fff",
                        fontWeight: 700,
                        cursor: emailSending ? "not-allowed" : "pointer",
                        boxShadow: "0 18px 36px rgba(220,38,38,0.35)",
                        opacity: emailSending ? 0.75 : 1,
                      }}
                    >
                      {emailSending ? "Sending..." : "Send to email"}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(report);
                    }}
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
                    Copy to clipboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

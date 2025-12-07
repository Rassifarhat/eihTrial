"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const getSupportedMimeType = (): string => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
      "audio/wav",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return "audio/webm";
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      setError("Microphone access denied. Please enable microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      setError("Please record audio first");
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/process-voice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process audio");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
      setAudioBlob(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  const handleClear = () => {
    setAudioBlob(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen p-8 flex items-center justify-center">
      <main className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Clinical PDF Filler</h1>
        <p className="text-gray-600 mb-8">
          Hold the microphone button and describe the clinical case. The form will be filled automatically.
        </p>

        <div className="flex flex-col items-center space-y-6">
          {/* Microphone Button */}
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
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isRecording
                ? "bg-red-500 scale-110 animate-pulse shadow-red-500/50"
                : "bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-blue-500/30"
            } disabled:bg-gray-400 disabled:shadow-none disabled:scale-100`}
          >
            <svg
              className="w-14 h-14 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>

          {/* Recording Status */}
          <p className="text-sm text-gray-500 h-5">
            {processing
              ? "Processing your request..."
              : isRecording
              ? "Recording... Release to stop"
              : audioBlob
              ? "Recording saved"
              : "Hold to record"}
          </p>

          {/* Submit Button */}
          {audioBlob && !isRecording && !processing && (
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Generate PDF
            </button>
          )}

          {/* Clear Button */}
          {(audioBlob || result) && !processing && (
            <button
              onClick={handleClear}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear and start over
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Download Result */}
        {result && (
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h2 className="text-lg font-medium mb-3 text-green-800">
              PDF Ready
            </h2>
            <a
              href={result}
              download="filled-thiqa-form.pdf"
              className="inline-block bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Download Filled PDF
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

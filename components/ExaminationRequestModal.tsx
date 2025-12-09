"use client";

import { useState, useRef } from "react";

interface ExaminationRequestModalProps {
    onClose: () => void;
}

export default function ExaminationRequestModal({ onClose }: ExaminationRequestModalProps) {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [insurer, setInsurer] = useState<string | null>(null);
    const [testType, setTestType] = useState<string | null>(null);

    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState<string>("");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    // --- Step 1: Insurer Selection ---
    const insurers = [
        { name: "Thiqa", color: "bg-emerald-500" },
        { name: "Daman", color: "bg-blue-500" },
        { name: "Nas", color: "bg-indigo-500" },
    ];

    const handleInsurerSelect = (name: string) => {
        setInsurer(name);
        setStep(2);
    };

    // --- Step 2: Test Selection ---
    const tests = [
        { name: "MRI", icon: "🧲" },
        { name: "CT Scan", icon: "☢️" },
        { name: "Physiotherapy", icon: "🤸" },
        { name: "Admission", icon: "🏥" },
    ];

    const handleTestSelect = (name: string) => {
        setTestType(name);
        setStep(3);
    };

    // --- Step 3: Recording Logic (Reused) ---
    const getSupportedMimeType = (): string => {
        const types = ["audio/webm", "audio/mp4", "audio/wav"];
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) return type;
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
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                setAudioBlob(blob);
                if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error(err);
            setError("Microphone access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!insurer || !testType || !audioBlob) {
            setError("Please complete all required steps: select insurer, test type, and record audio.");
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.webm");
            formData.append("insurer", insurer);
            formData.append("testType", testType);

            // Optional email
            if (email && email.includes("@")) {
                formData.append("email", email);
            }

            const response = await fetch("/api/process-voice", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setResult(url);
            setStep(4);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error processing");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">New Examination Request</h2>
                        <p className="text-sm text-gray-500">
                            {step === 1 && "Select Insurance Provider"}
                            {step === 2 && `Requesting for ${insurer}: Select Test`}
                            {step === 3 && `Dictate Clinical Notes for ${testType}`}
                            {step === 4 && "Request Generated"}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">

                    {/* STEP 1: Insurer */}
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {insurers.map((ins) => (
                                <button
                                    key={ins.name}
                                    onClick={() => handleInsurerSelect(ins.name)}
                                    className={`h-40 rounded-xl flex flex-col items-center justify-center p-4 transition-all hover:scale-105 hover:shadow-lg border border-gray-100 group`}
                                >
                                    <div className={`w-16 h-16 rounded-full ${ins.color} mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-md group-hover:shadow-lg`}>
                                        {ins.name[0]}
                                    </div>
                                    <span className="font-semibold text-gray-700">{ins.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* STEP 2: Test Type */}
                    {step === 2 && (
                        <div className="grid grid-cols-2 gap-4">
                            {tests.map((t) => (
                                <button
                                    key={t.name}
                                    onClick={() => handleTestSelect(t.name)}
                                    className="h-32 bg-gray-50 rounded-xl flex flex-col items-center justify-center hover:bg-violet-50 hover:border-violet-200 border border-transparent transition-all"
                                >
                                    <span className="text-4xl mb-2">{t.icon}</span>
                                    <span className="font-medium text-gray-700">{t.name}</span>
                                </button>
                            ))}
                            <button
                                onClick={() => setStep(1)}
                                className="col-span-2 mt-4 text-sm text-gray-400 hover:text-gray-600"
                            >
                                ← Back to Insurer Selection
                            </button>
                        </div>
                    )}

                    {/* STEP 3: Voice Input */}
                    {step === 3 && (
                        <div className="flex flex-col items-center space-y-6 py-4">
                            <button
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onMouseLeave={stopRecording}
                                onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                                onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                                disabled={processing}
                                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-xl ${isRecording
                                        ? "bg-red-500 scale-110 animate-pulse ring-4 ring-red-200"
                                        : "bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:scale-105 hover:shadow-2xl"
                                    } disabled:opacity-50 disabled:scale-100`}
                            >
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                </svg>
                            </button>

                            <div className="text-center space-y-2">
                                <p className="font-medium text-gray-700">
                                    {processing ? "Processing..." : isRecording ? "Recording..." : audioBlob ? "Recording Saved" : "Hold to Record"}
                                </p>
                                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                                    Describe the complaint, history, and justification for the {testType}.
                                </p>
                            </div>

                            {/* Optional Email Field */}
                            <div className="w-full space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Email PDF to: <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="doctor@example.com"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                />
                                <p className="text-xs text-gray-400">
                                    If provided, the PDF will also be sent to this email address
                                </p>
                            </div>

                            {error && <div className="text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm">{error}</div>}

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
                                >
                                    Back
                                </button>
                                {audioBlob && !isRecording && (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={processing}
                                        className="flex-1 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                                    >
                                        {processing ? "Generating..." : "Generate Request"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Success */}
                    {step === 4 && result && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Request Ready!</h3>
                            <p className="text-gray-500 mb-8">Your {insurer} authorization form for {testType} has been generated.</p>

                            <div className="flex gap-4 justify-center">
                                <button onClick={() => setStep(1)} className="px-6 py-3 text-gray-600 font-medium hover:text-gray-900">
                                    Create Another
                                </button>
                                <a
                                    href={result}
                                    download={`request-${insurer}-${testType}.pdf`}
                                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 hover:scale-105 transition-all"
                                >
                                    Download PDF
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

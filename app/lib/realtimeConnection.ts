import { RefObject } from "react";

const REALTIME_MODEL = "gpt-realtime-mini-2025-12-15";
const REALTIME_BASE_URL = "https://api.openai.com/v1/realtime";

export async function createRealtimeConnection(
  ephemeralKey: string,
  audioElement: RefObject<HTMLAudioElement | null>,
  micStream: MediaStream
): Promise<{ pc: RTCPeerConnection; dc: RTCDataChannel; remoteStream: MediaStream | null }> {
  const pc = new RTCPeerConnection();
  let remoteStream: MediaStream | null = null;

  pc.ontrack = (e) => {
    remoteStream = e.streams[0];
    if (audioElement.current) {
      audioElement.current.srcObject = remoteStream;
    }
  };

  const micTrack = micStream.getAudioTracks()[0];
  if (micTrack) {
    pc.addTrack(micTrack);
  }

  const dc = pc.createDataChannel("oai-events");

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const sdpResponse = await fetch(`${REALTIME_BASE_URL}?model=${REALTIME_MODEL}`, {
    method: "POST",
    body: offer.sdp,
    headers: {
      Authorization: `Bearer ${ephemeralKey}`,
      "Content-Type": "application/sdp",
    },
  });

  if (!sdpResponse.ok) {
    const text = await sdpResponse.text();
    throw new Error(`Realtime SDP exchange failed: ${sdpResponse.status} ${text}`);
  }

  const answerSdp = await sdpResponse.text();
  const answer: RTCSessionDescriptionInit = {
    type: "answer",
    sdp: answerSdp,
  };

  await pc.setRemoteDescription(answer);

  return { pc, dc, remoteStream };
}

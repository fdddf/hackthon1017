import { useEffect, useRef, useState } from 'react';

type Send = (msg: Record<string, unknown>) => void;
type OnSignal = (handler: ((payload: unknown) => void) | null) => void;

/**
 * The last rung of the help ladder is a person. This is that rung.
 *
 * Signalling rides the same WebSocket as app state; the peer connection carries
 * audio and video only. Both clients sit on one machine for the demo, so STUN is
 * plenty and no TURN server is involved. If any of it fails we surface the error
 * and the rest of the product keeps working — see PRD §9.
 */
export function useCall(role: 'watch' | 'parent', send: Send, onSignal: OnSignal) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localRef = useRef<MediaStream | null>(null);

  const makePeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    peer.onicecandidate = (event) => {
      if (event.candidate) send({ type: 'rtc', payload: { candidate: event.candidate } });
    };
    peer.ontrack = (event) => setStream(event.streams[0]);
    peerRef.current = peer;
    return peer;
  };

  const getLocal = async (mode: 'video' | 'audio' = 'video') => {
    if (localRef.current) return localRef.current;
    const media = await navigator.mediaDevices.getUserMedia({
      video: mode === 'video',
      audio: true,
    });
    localRef.current = media;
    return media;
  };

  /** Parent side: make the offer. Audio-only when she's on the tram. */
  const start = async (mode: 'video' | 'audio' = 'video') => {
    try {
      setError(null);
      const peer = peerRef.current ?? makePeer();
      const media = await getLocal(mode);
      media.getTracks().forEach((track) => peer.addTrack(track, media));
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      send({ type: 'rtc', payload: { sdp: offer } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'camera unavailable');
    }
  };

  const hangUp = () => {
    peerRef.current?.close();
    peerRef.current = null;
    localRef.current?.getTracks().forEach((t) => t.stop());
    localRef.current = null;
    setStream(null);
  };

  useEffect(() => {
    onSignal(async (payload) => {
      const msg = payload as { sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit };
      try {
        const peer = peerRef.current ?? makePeer();

        if (msg.sdp?.type === 'offer') {
          await peer.setRemoteDescription(msg.sdp);
          const media = await getLocal();
          media.getTracks().forEach((track) => peer.addTrack(track, media));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          send({ type: 'rtc', payload: { sdp: answer } });
        } else if (msg.sdp?.type === 'answer') {
          await peer.setRemoteDescription(msg.sdp);
        } else if (msg.candidate) {
          await peer.addIceCandidate(msg.candidate);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'call failed');
      }
    });
    return () => onSignal(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return { stream, error, start, hangUp };
}

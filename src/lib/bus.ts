import { useEffect, useRef, useState } from 'react';
import type { TempoState } from './types';

type Send = (msg: Record<string, unknown>) => void;

/**
 * One socket per client. The server owns the state so the watch and the phone
 * can never disagree in front of a judge.
 */
export function useRelay(role: 'watch' | 'parent') {
  const [state, setState] = useState<TempoState | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const rtcHandler = useRef<((payload: unknown) => void) | null>(null);

  useEffect(() => {
    let closed = false;
    let socket: WebSocket;
    let retry: ReturnType<typeof setTimeout>;

    const connect = () => {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      socket = new WebSocket(`${proto}://${location.host}/ws?role=${role}`);
      socketRef.current = socket;

      socket.onopen = () => setConnected(true);
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'state') setState(msg.state);
        if (msg.type === 'rtc') rtcHandler.current?.(msg.payload);
      };
      socket.onclose = () => {
        setConnected(false);
        if (!closed) retry = setTimeout(connect, 800); // survive a server restart mid-demo
      };
    };

    connect();
    return () => {
      closed = true;
      clearTimeout(retry);
      socket?.close();
    };
  }, [role]);

  const send: Send = (msg) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  };

  const onSignal = (handler: ((payload: unknown) => void) | null) => {
    rtcHandler.current = handler;
  };

  return { state, connected, send, onSignal };
}

/** Speak a hint aloud. A child reading a hint and hearing one are not the same child. */
export function speak(text: string) {
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  } catch {
    /* no voice on this machine — the text is still on screen */
  }
}

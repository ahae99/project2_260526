import { useCallback, useEffect, useRef, useState } from 'react';
import WS_ENDPOINT from '../config';
import { ConnectionStatus, ServerMessage } from '../types';

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 2000;
const MAX_DELAY_MS = 30000;

interface UseWebSocketReturn {
  status: ConnectionStatus;
  messages: ServerMessage[];
  sendMessage: (text: string) => void;
  disconnect: () => void;
}

export function useWebSocket(callsign: string): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const closedIntentionally = useRef(false);

  const connect = useCallback(() => {
    const ws = new WebSocket(`${WS_ENDPOINT}?callsign=${encodeURIComponent(callsign)}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      retriesRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data: ServerMessage = JSON.parse(event.data as string);
        setMessages((prev) => [...prev, data]);
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => {
      if (closedIntentionally.current) return;
      if (retriesRef.current >= MAX_RETRIES) {
        setStatus('disconnected');
        return;
      }
      setStatus('reconnecting');
      const delay = Math.min(BASE_DELAY_MS * Math.pow(2, retriesRef.current), MAX_DELAY_MS);
      retriesRef.current += 1;
      setTimeout(connect, delay);
    };
  }, [callsign]);

  useEffect(() => {
    closedIntentionally.current = false;
    connect();
    return () => {
      closedIntentionally.current = true;
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'sendMessage', text }));
    }
  }, []);

  const disconnect = useCallback(() => {
    closedIntentionally.current = true;
    wsRef.current?.close();
    setStatus('disconnected');
  }, []);

  return { status, messages, sendMessage, disconnect };
}

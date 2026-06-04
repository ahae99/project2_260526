import { useEffect, useRef } from 'react';
import { ServerMessage } from '../types';
import { MessageItem } from './MessageItem';

interface Props {
  messages: ServerMessage[];
  ownCallsign: string;
}

export function MessageList({ messages, ownCallsign }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.length === 0 && (
        <p className="message-list__empty">No messages yet. Say hello!</p>
      )}
      {messages.map((msg, i) => (
        <MessageItem key={i} message={msg} ownCallsign={ownCallsign} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

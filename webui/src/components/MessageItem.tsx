import { ServerMessage } from '../types';

interface Props {
  message: ServerMessage;
  ownCallsign: string;
}

export function MessageItem({ message, ownCallsign }: Props) {
  if (message.type === 'system') {
    const label = message.event === 'user_joined'
      ? `${message.callsign} joined`
      : `${message.callsign} left`;
    return <div className="message message--system">[system] {label}</div>;
  }

  const isOwn = message.callsign === ownCallsign;
  return (
    <div className={`message ${isOwn ? 'message--own' : 'message--other'}`}>
      {!isOwn && <span className="message__callsign">{message.callsign}</span>}
      <span className="message__text">{message.text}</span>
      <span className="message__time">
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}

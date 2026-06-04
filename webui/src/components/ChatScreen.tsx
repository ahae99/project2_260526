import { useWebSocket } from '../hooks/useWebSocket';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { StatusIndicator } from './StatusIndicator';

interface Props {
  callsign: string;
  onLeave: () => void;
}

export function ChatScreen({ callsign, onLeave }: Props) {
  const { status, messages, sendMessage, disconnect } = useWebSocket(callsign);

  const handleLeave = () => {
    disconnect();
    onLeave();
  };

  return (
    <div className="chat-screen">
      <header className="chat-header">
        <span className="chat-header__title">Anonymous Chat</span>
        <StatusIndicator status={status} />
        <button className="leave-btn" onClick={handleLeave}>Leave</button>
      </header>

      <MessageList messages={messages} ownCallsign={callsign} />

      <MessageInput onSend={sendMessage} disabled={status !== 'connected'} />
    </div>
  );
}

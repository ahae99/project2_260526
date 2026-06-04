import { useState } from 'react';
import { ChatScreen } from './components/ChatScreen';
import { JoinScreen } from './components/JoinScreen';

export default function App() {
  const [callsign, setCallsign] = useState<string | null>(null);

  return callsign
    ? <ChatScreen callsign={callsign} onLeave={() => setCallsign(null)} />
    : <JoinScreen onJoin={setCallsign} />;
}

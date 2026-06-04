import { KeyboardEvent, useState } from 'react';

const CALLSIGN_RE = /^[a-zA-Z0-9_]{1,20}$/;

interface Props {
  onJoin: (callsign: string) => void;
}

export function JoinScreen({ onJoin }: Props) {
  const [callsign, setCallsign] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    if (!CALLSIGN_RE.test(callsign)) {
      setError('1–20 characters: letters, numbers, and underscores only.');
      return;
    }
    setError('');
    onJoin(callsign);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleJoin();
  };

  return (
    <div className="join-screen">
      <h1 className="join-screen__title">Anonymous Chat</h1>
      <div className="join-form">
        <label htmlFor="callsign">Choose a callsign</label>
        <input
          id="callsign"
          type="text"
          value={callsign}
          onChange={(e) => setCallsign(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. CoolDog"
          maxLength={20}
          autoFocus
        />
        {error && <p className="error" role="alert">{error}</p>}
        <button onClick={handleJoin}>Join Chat</button>
      </div>
    </div>
  );
}

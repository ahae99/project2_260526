import { KeyboardEvent, useState } from 'react';

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 1000))}
        onKeyDown={handleKeyDown}
        placeholder="Type a message… (Enter to send)"
        disabled={disabled}
        aria-label="Message"
      />
      <button onClick={handleSend} disabled={disabled || !text.trim()}>
        Send
      </button>
    </div>
  );
}

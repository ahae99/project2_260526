import { ConnectionStatus } from '../types';

const labels: Record<ConnectionStatus, string> = {
  connecting: 'Connecting...',
  connected: 'Connected',
  disconnected: 'Disconnected',
  reconnecting: 'Reconnecting...',
};

export function StatusIndicator({ status }: { status: ConnectionStatus }) {
  return (
    <div className={`status status--${status}`} aria-live="polite">
      <span className="status__dot" />
      {labels[status]}
    </div>
  );
}

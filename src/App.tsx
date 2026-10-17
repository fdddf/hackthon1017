import { WatchApp } from './watch/WatchApp';
import { ParentApp } from './parent/ParentApp';

/**
 * Three ways in:
 *   /         the stage — both devices side by side. This is what we record.
 *   /watch    the child's watch alone, for a real device over the tunnel
 *   /parent   the parent's phone alone, same
 */
export function App() {
  const path = location.pathname.replace(/\/$/, '');

  if (path === '/watch') {
    return (
      <div className="stage">
        <WatchApp />
      </div>
    );
  }
  if (path === '/parent') {
    return (
      <div className="stage">
        <ParentApp />
      </div>
    );
  }

  return (
    <div className="stage">
      <div className="stage-head">
        <h1>Relay</h1>
        <p>AI doesn't answer. It passes the ball.</p>
      </div>
      <div className="devices">
        <div>
          <div className="device-label">Mert, 10 — watch</div>
          <WatchApp />
        </div>
        <div>
          <div className="device-label">Ayşe — phone</div>
          <ParentApp />
        </div>
      </div>
    </div>
  );
}

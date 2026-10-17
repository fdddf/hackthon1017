import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

// No StrictMode: its double-mount opens two sockets and two peer connections,
// which is exactly the kind of surprise we don't want on stage.
createRoot(document.getElementById('root')!).render(<App />);

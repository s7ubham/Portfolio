import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

// StrictMode disabled — it double-mounts effects and breaks Phaser input/overlays
ReactDOM.createRoot(document.getElementById('root')!).render(<App />)

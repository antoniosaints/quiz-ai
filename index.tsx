
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Shim para process.env em ambientes Vite/Browser/Preview
// Isso resolve o erro "process is not defined" e mantém a compatibilidade com o SDK Gemini
// Adicionamos flags para evitar que bibliotecas WASM (como sql.js) tentem usar o 'fs' do Node.
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: {
      API_KEY: (import.meta as any).env?.VITE_API_KEY || (import.meta as any).env?.API_KEY || '',
    },
    versions: {},
    nextTick: (cb: Function) => setTimeout(cb, 0),
    platform: 'browser'
  };
} else {
  // Se já existir (como no ambiente do preview), garantimos que versions.node não exista
  const proc = (window as any).process;
  if (!proc.env) proc.env = {};
  if (!proc.env.API_KEY) {
    proc.env.API_KEY = (import.meta as any).env?.VITE_API_KEY || (import.meta as any).env?.API_KEY || '';
  }
  proc.versions = proc.versions || {};
  proc.versions.node = undefined; // Desativa detecção de Node.js
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

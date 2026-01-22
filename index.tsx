
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Shim para process.env em ambientes Vite/Browser
// Isso resolve o erro "process is not defined" e mantém a compatibilidade com o SDK Gemini
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: {
      // Tenta capturar a chave de API de diversas fontes comuns em ambientes de desenvolvimento
      API_KEY: (import.meta as any).env?.VITE_API_KEY || (import.meta as any).env?.API_KEY || '',
    },
  };
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

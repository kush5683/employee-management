import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/base.css';

// -----------------------------------------------------------------------------
// Application Bootstrap
// -----------------------------------------------------------------------------
// `createRoot` is the modern entry point for a React application. Everything
// rendered under `<App />` inherits providers defined inside that component.
// Wrap the tree with `<React.StrictMode>` to surface accidental side effects
// during development; remove it only if you rely on legacy lifecycle quirks.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PortfolioProvider } from './context/PortfolioContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortfolioProvider>
      <App />
    </PortfolioProvider>
  </StrictMode>
);

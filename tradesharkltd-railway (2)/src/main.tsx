import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BrokerageProvider } from './context/BrokerageContext';
import { installLinkInterceptor } from './lib/router';
import './index.css';

installLinkInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrokerageProvider>
      <App />
    </BrokerageProvider>
  </StrictMode>,
);

import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import { AppKernelProvider } from './app/ApplicationKernelContext';
import { buildKernel } from './app/compositionRoot';

const kernel = buildKernel();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppKernelProvider kernel={kernel}>
      <App />
    </AppKernelProvider>
  </StrictMode>,
);

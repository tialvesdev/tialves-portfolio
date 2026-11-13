import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';

// O portfólio é o castelo; o catálogo de componentes do kit fica em /kit.
const isKit = window.location.pathname.replace(/\/+$/, '') === '/kit';
const Page = isKit ? lazy(() => import('./KitPage')) : lazy(() => import('./castle/CastlePage'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  </StrictMode>,
);

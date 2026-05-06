import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router/AppRoutes';
import { initDependencies } from './main';

function AppWrapper({ onRender }: { onRender: () => void }) {
  useEffect(() => {
    onRender();
  }, [onRender]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById('root')!);
root.render(
  // <React.StrictMode>
  <AppWrapper onRender={() => initDependencies()} />
  // </React.StrictMode>
);

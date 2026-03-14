import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './app/app';

/**
 * Renders the application for a requested URL on the server.
 */
export function render(_url: string): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

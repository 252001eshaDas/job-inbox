import { config } from './config.js';
import { createApp } from './app.js';

createApp().listen(config.port, () => {
  console.log(
    `job-inbox server on http://localhost:${config.port} ${config.mock ? '(MOCK mode)' : ''}`,
  );
});

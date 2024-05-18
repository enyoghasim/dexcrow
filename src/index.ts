import server from './server.js';

(() => {
  try {
    server();
  } catch (error) {
    process.exit(1);
  }
})();

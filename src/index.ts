import server from './server.js';

(() => {
  try {
    server();
    process.on('unhandledRejection', (reason, promise) => {
      console.log('Unhandled Rejection at:', promise, 'reason:', reason);
      // Application specific logging, throwing an error, or other logic here
    });
  } catch (error) {
    process.exit(1);
  }
})();

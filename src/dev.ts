import { startServer } from "./server/index.js";

const PORT = 3000;

console.log('Starting development server...');
await startServer(PORT);

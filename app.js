// Entry point for Hostinger Cloud's Node.js Application Manager (Passenger).
// Passenger expects a startup .js file, not an "npm start" command.
// This just launches the built Next.js production server on the port
// Passenger assigns via process.env.PORT.

const { createServer } = require('http');
const next = require('next');

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Server ready on port ${port}`);
  });
});

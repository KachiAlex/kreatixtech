// Shared Socket.io instance.
// server.js initialises this after creating the http server;
// routes import it to emit events.

let _io = null;
const connectedUsers = new Map();

export function setIo(io) {
  _io = io;
}

export function getIo() {
  return _io;
}

export { connectedUsers };

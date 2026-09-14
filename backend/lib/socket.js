// Shared Socket.io instance.
// server.js initialises this after creating the http server;
// routes import it to emit events.

let _io = null;

// Presence tracking: userId -> Set of socket ids.
// A user may be connected from several devices at once, so we keep a Set
// per user and only report "offline" once the last socket disconnects.
const connectedUsers = new Map();

export function setIo(io) {
  _io = io;
}

export function getIo() {
  return _io;
}

export function addUserConnection(userId, socketId) {
  const sockets = connectedUsers.get(userId) || new Set();
  sockets.add(socketId);
  connectedUsers.set(userId, sockets);
}

// Returns true when the user has no remaining connections (fully offline).
export function removeUserConnection(userId, socketId) {
  const sockets = connectedUsers.get(userId);
  if (!sockets) return true;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    connectedUsers.delete(userId);
    return true;
  }
  return false;
}

// Emits an event only to sockets in a room that belong to an admin/analyst.
// Used to keep INTERNAL_NOTE messages away from CLIENT sockets that share
// the same request/assessment room.
export async function emitToRoomAdmins(room, event, payload) {
  if (!_io) return;
  try {
    const sockets = await _io.in(room).fetchSockets();
    for (const s of sockets) {
      if (s.role === 'ADMIN' || s.role === 'ANALYST') {
        s.emit(event, payload);
      }
    }
  } catch (err) {
    // fetchSockets can fail if the room no longer exists — never throw to callers.
  }
}

export { connectedUsers };

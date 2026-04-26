/** Giữ instance Socket.io để controller/service emit sau khi server khởi tạo. */
let io = null;

// gọi DUY NHẤT 1 LẦN ở file server.js
function setIO(instance) {
  io = instance;
}

function getIO() {
  return io;
}

module.exports = { setIO, getIO };

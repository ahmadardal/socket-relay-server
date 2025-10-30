import { Server as Engine } from '@socket.io/bun-engine';
import { Server } from 'socket.io';

const engine = new Engine({
  path: '/socket.io/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const io = new Server();

io.bind(engine);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.onAny((event, data) => {
    console.log(`Relaying event: ${event}`, data);
    socket.broadcast.emit(event, data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// **Explicit start**
const port = parseInt(process.env.PORT || '3001', 10);
console.log(`Socket.IO server running on port ${port}`);
Bun.serve({
  port,
  ...engine.handler(),
});

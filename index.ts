import { Server as Engine } from '@socket.io/bun-engine';
import { Server } from 'socket.io';

const eventsToData = new Map<string, any[]>();

const name = process.env.NAME || 'default'
const path = `/${name}/`

const engine = new Engine({
  path,
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

    eventsToData.set(event, [
      ...(eventsToData.get(event)?.slice(0, 8) || []),
      data,
    ]);

    socket.broadcast.emit(event, data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// **Explicit start**
const port = parseInt(process.env.PORT || '3006', 10);

Bun.serve({
  port,
  routes: {
    '/events_by': (req) => {
      const { event_name }: any = req.params;

      if (!event_name) {
        return new Response(
          JSON.stringify({ error: 'Event name is required' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      return new Response(JSON.stringify(eventsToData.get(event_name) || []), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
  },
  ...engine.handler(),
});

console.log(`Socket.IO server running on port ${port} at path ${path}`);

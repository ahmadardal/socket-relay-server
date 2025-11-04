import { Server as Engine } from '@socket.io/bun-engine';
import type { BunRequest } from 'bun';
import { Server } from 'socket.io';
import { addToBuffer, bufferToArray, getOrCreateBuffer } from './buffer';

const eventsToData = new Map<string, any[]>();

const name = process.env.NAME || 'default';
const path = `/${name}/`;

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

    // Mutate the existing data, by popping

    addToBuffer(getOrCreateBuffer<any>(event), data);

    socket.broadcast.emit(event, data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// **Explicit start**
const port = parseInt(process.env.PORT || '3006', 10);

const routeName = `${path}events_by`;

Bun.serve({
  port,
  routes: {
    [routeName]: {
      GET: (req: BunRequest) => {
        const url = new URL(req.url);

        const name = url.searchParams.get('name');

        if (!name) {
          return new Response(
            JSON.stringify({ error: 'Missing name query parameter!' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        }

        const buffer = getOrCreateBuffer<any>(name);

        const data = buffer ? bufferToArray(buffer) : [];

        return new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      },
    },
  },
  ...engine.handler(),
});

console.log(`Socket.IO server running on port ${port} at path ${path}`);

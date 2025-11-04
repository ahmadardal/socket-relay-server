type CircularBuffer<T> = {
  buffer: T[];
  startIndex: number;
  length: number;
  capacity: number;
};

const BUFFER_CAPACITY = 10;
const eventBuffers = new Map<string, CircularBuffer<any>>();

export function getOrCreateBuffer<T>(eventKey: string): CircularBuffer<T> {
  let buffer = eventBuffers.get(eventKey) as CircularBuffer<T> | undefined;

  if (!buffer) {
    buffer = {
      buffer: new Array<T>(BUFFER_CAPACITY),
      startIndex: 0,
      length: 0,
      capacity: BUFFER_CAPACITY,
    };
    eventBuffers.set(eventKey, buffer);
  }

  return buffer;
}

export function addToBuffer<T>(buffer: CircularBuffer<T>, value: T): void {
  if (buffer.length < buffer.capacity) {
    // Buffer not full yet - add to next available slot
    const insertIndex = (buffer.startIndex + buffer.length) % buffer.capacity;
    buffer.buffer[insertIndex] = value;
    buffer.length++;
  } else {
    // Buffer is full - overwrite oldest item
    buffer.buffer[buffer.startIndex] = value;
    buffer.startIndex = (buffer.startIndex + 1) % buffer.capacity;
  }
}

export function bufferToArray<T>(buffer: CircularBuffer<T>): T[] {
  const result = new Array<T>(buffer.length);

  for (let i = 0; i < buffer.length; i++) {
    const index = (buffer.startIndex + i) % buffer.capacity;
    result[i] = buffer.buffer[index] as T;
  }

  return result;
}

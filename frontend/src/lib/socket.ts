import { useEffect, useRef } from "react";

// Safe lightweight event emitter mock for socket events in browser
class MockSocket {
  private listeners: { [key: string]: Function[] } = {};
  public connected: boolean = false;

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return this;
  }

  off(event: string, callback?: Function) {
    if (!this.listeners[event]) return this;
    if (!callback) {
      delete this.listeners[event];
    } else {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
    return this;
  }

  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => {
        try {
          cb(...args);
        } catch {
          // Ignore listener execution failure in mock socket
        }
      });
    }
    return this;
  }

  disconnect() {
    this.connected = false;
    return this;
  }
}

let globalSocket: any = null;

export function getSocket(): any {
  if (!globalSocket) {
    globalSocket = new MockSocket();
  }
  return globalSocket;
}

export function io(url?: string, options?: any) {
  return getSocket();
}

/**
 * React hook to listen for a real-time event.
 */
export function useRealtimeEvent<T = any>(
  eventName: string,
  handler: (data: T) => void
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const socket = getSocket();

    const listener = (data: T) => {
      if (handlerRef.current) {
        handlerRef.current(data);
      }
    };

    socket.on(eventName, listener);

    return () => {
      socket.off(eventName, listener);
    };
  }, [eventName]);
}

/**
 * Emit a real-time event through the global socket.
 */
export function emitRealtimeEvent(eventName: string, payload: any) {
  const socket = getSocket();
  if (socket) {
    socket.emit(eventName, payload);
  }
}

import { useEffect } from 'react';
import io from 'socket.io-client';

interface SocketConfig {
  eventName: string;
  initialEmitEvent?: string;
  onDataReceived: (data: any) => void;
}

export const useSocketNotification = ({
  eventName,
  initialEmitEvent,
  onDataReceived,
}: SocketConfig) => {
  useEffect(() => {
    const SOCKET_URL = process.env.UMI_APP_SOCKET_URL || 'http://localhost:5006';
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log(`Socket connected successfully for ${eventName}`);
      if (initialEmitEvent) {
        socket.emit(initialEmitEvent);
      }
    });

    socket.on(eventName, onDataReceived);

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected for ${eventName}, reason:`, reason);
    });

    return () => {
      console.log('Cleaning up socket connection');
      socket.disconnect();
    };
  }, [eventName, initialEmitEvent, onDataReceived]);
};

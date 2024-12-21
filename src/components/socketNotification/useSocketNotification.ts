import { useEffect, useRef } from 'react';
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
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!socketRef.current) {
      const SOCKET_URL = process.env.UMI_APP_SOCKET_URL || 'http://localhost:5006';
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: Infinity,
        withCredentials: true,
      });

      socketRef.current.on('connect', () => {
        console.log(`Socket connected successfully for ${eventName}`);
        if (initialEmitEvent) {
          socketRef.current.emit(initialEmitEvent);
        }
      });

      socketRef.current.on(eventName, (data: any) => {
        console.log(`Received data for ${eventName}:`, data);
        onDataReceived(data);
      });

      socketRef.current.on('disconnect', (reason: string) => {
        console.log(`Socket disconnected for ${eventName}, reason:`, reason);
      });
    }

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [eventName, initialEmitEvent, onDataReceived]);
};

export const useNewCustomerNotification = (onNewCustomer: (data: any) => void) => {
  useSocketNotification({
    eventName: 'newCustomerAdded',
    onDataReceived: onNewCustomer,
  });
};

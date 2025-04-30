import { refreshToken } from '@/services/ant-design-pro/api';
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface SocketConfig {
  eventName: string;
  initialEmitEvent?: string;
  onDataReceived: (data: any) => void;
}

// 创建socket连接的工具函数
// socket实例缓存
let socketInstance: Socket | null = null;

export const createSocketConnection = (): Socket => {
  const SOCKET_URL = process.env.UMI_APP_SOCKET_URL || 'http://localhost:5003';
  return io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    withCredentials: true,
  });
};

// 获取socket实例的方法
export const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = createSocketConnection();
  }
  return socketInstance;
};

export const useSocketNotification = (configs: SocketConfig[]) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const response = await refreshToken({
        refreshToken: localStorage.getItem('refreshToken')!,
      });
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        setToken(response.token);
      }
    }, 60 * 60 * 1000); // 每小时刷新一次

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();

    // 在连接时设置 auth token
    if (token) {
      socket.auth = { token: `Bearer ${token}` };
    }

    socket.on('connect', () => {
      console.log('Socket connected successfully');
      configs.forEach((config) => {
        if (config.initialEmitEvent) {
          socket.emit(config.initialEmitEvent);
          console.log(`Emitted initial event: ${config.initialEmitEvent} for ${config.eventName}`);
        }
      });
    });

    configs.forEach((config) => {
      socket.on(config.eventName, config.onDataReceived);
      console.log(`Listening to event: ${config.eventName}`);
    });

    socket.on('ping', (timestamp: number) => {
      socket.emit('pong', timestamp);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected, reason:', reason);
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        socket.connect();
        console.log('Attempting to reconnect after disconnect');
      }
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket.IO connection error:', error);
    });

    socket.on('reconnect_attempt', (attempt: number) => {
      console.log(`Socket.IO reconnection attempt ${attempt}`);
    });

    socket.on('reconnect', (attemptNumber: number) => {
      console.log(`Socket.IO reconnected after ${attemptNumber} attempts`);
      configs.forEach((config) => {
        if (config.initialEmitEvent) {
          socket.emit(config.initialEmitEvent);
          console.log(`Re-emitted initial event after reconnection: ${config.initialEmitEvent}`);
        }
      });
    });

    socket.on('reconnect_failed', () => {
      console.log('Socket.IO reconnection failed');
      setTimeout(() => {
        console.log('Manual reconnection attempt after reconnection failure');
        socket.connect();
      }, 5000);
    });

    socket.on('message', (data: any) => {
      console.log("Received 'message' event:", data);
    });

    return () => {
      console.log('Cleaning up socket connection');
      configs.forEach((config) => {
        socket.off(config.eventName, config.onDataReceived);
        console.log(`Stopped listening to event: ${config.eventName}`);
      });
      socket.disconnect();
    };
  }, [token]);
};

import React from 'react';
import { useModel } from '@umijs/max';
import { useSocketNotification } from './useSocketNotification';
import { notification } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { ChatMessage } from '@/models/chatMessageModel';

// 预加载声音
const soundSrc = '/sounds/newCustomerBeep.mp3';

export const playSound = () => {
  const sound = new Audio(soundSrc);
  sound.preload = 'auto';
  sound.play();
};

const openNotification = (message: string, description: string, playSoundEnabled: boolean) => {
  if (playSoundEnabled) {
    playSound();
  }

  notification.success({
    message: message,
    description: description,
    duration: 3,
  });
};

const NotificationBadge: React.FC = () => {
  const { handleCustomerNew } = useModel('notificationModel');
  const { handleCustomerStatusChange } = useModel('customerStatusModel');
  const { handleChatMessageChange } = useModel('chatMessageModel');

  useSocketNotification([
    {
      eventName: 'newCustomerAdded',
      onDataReceived: (data: { title: string; message: string }) => {
        handleCustomerNew(data);
        openNotification(data.title, data.message, true);
      },
    },
    {
      eventName: 'customer_status',
      onDataReceived: (data: { customerId: string; isOn: boolean; lastOnline: Date }) => {
        handleCustomerStatusChange(data);
      },
    },
    {
      eventName: 'chatMessage',
      onDataReceived: (data: ChatMessage) => {
        handleChatMessageChange(data);
      },
    },
  ]);

  return (
    <BellOutlined
      onClick={playSound}
      style={{ fontSize: '12px', padding: '5px 10px', border: 'none' }}
    />
  );
};

export default NotificationBadge;

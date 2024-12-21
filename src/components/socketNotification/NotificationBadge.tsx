import React from 'react';
import { useModel } from '@umijs/max';
import { useSocketNotification } from './useSocketNotification';
import { notification } from 'antd';
import { BellOutlined } from '@ant-design/icons';

// 预加载声音
const soundSrc = '/sounds/newCustomerBeep.mp3';

const playSound = () => {
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

  useSocketNotification([
    {
      eventName: 'customerNew',
      onDataReceived: (data) => {
        handleCustomerNew(data);
        openNotification('New Customer', 'A new customer has been added.', true);
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

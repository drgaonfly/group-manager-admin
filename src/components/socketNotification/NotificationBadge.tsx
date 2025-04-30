import React from 'react';
import { useModel } from '@umijs/max';
import { useSocketNotification } from './useSocketNotification';
import { Badge, notification } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { ChatMessage } from '@/models/chatMessageModel';
import { ChatMessageReadStatus } from '@/models/chatMessageReadModel';
import { history } from '@umijs/max';
import { UnreadCountData } from '@/models/unreadMessageCountModel';

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
  const { handleMessageReadStatusChange } = useModel('chatMessageReadModel');
  const { handleUnreadCountUpdate } = useModel('unreadMessageCountModel');

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
    {
      eventName: 'chatMessageRead',
      onDataReceived: (data: ChatMessageReadStatus) => {
        handleMessageReadStatusChange(data);
      },
    },
    {
      eventName: 'unreadMessageCountUpdated',
      initialEmitEvent: 'getUnreadMessageCount',
      onDataReceived: (data: UnreadCountData) => {
        // 更新未读消息数量
        handleUnreadCountUpdate(data);
      },
    },
  ]);

  return (
    <Badge count={5} size="small">
      <BellOutlined onClick={() => history.push(`/customer-service?t=${Date.now()}`)} />
    </Badge>
  );
};

export default NotificationBadge;

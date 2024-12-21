import React from 'react';
import { useModel } from '@umijs/max';
import { useSocketNotification } from './useSocketNotification';

const NotificationBadge: React.FC = () => {
  const { handleOrderCountUpdate, handleTodoListCountUpdate } = useModel('notificationModel');

  useSocketNotification([
    {
      eventName: 'inactiveOrdersCountUpdated',
      initialEmitEvent: 'inactiveOrdersUpdatedInit',
      onDataReceived: handleOrderCountUpdate,
    },
    {
      eventName: 'todoListCountUpdated',
      initialEmitEvent: 'todoListUpdatedInit',
      onDataReceived: handleTodoListCountUpdate,
    },
  ]);
  return <></>;
};

export default NotificationBadge;

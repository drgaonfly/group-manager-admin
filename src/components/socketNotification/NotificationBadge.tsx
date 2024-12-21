import React from 'react';
import { useModel } from '@umijs/max';
import { useSocketNotification } from './useSocketNotification';

const NotificationBadge: React.FC = () => {
  const { handleCustomerNew } = useModel('notificationModel');

  useSocketNotification([
    {
      eventName: 'customerNew',
      onDataReceived: handleCustomerNew,
    },
  ]);
  return <></>;
};

export default NotificationBadge;

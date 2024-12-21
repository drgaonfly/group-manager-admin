import { useState } from 'react';
import { useNewCustomerNotification } from '@/components/socketNotification/useSocketNotification';

const NotificationHandler = () => {
  const [customerCount, setCustomerCount] = useState(0);

  useNewCustomerNotification((data) => {
    console.log('New customer added:', data);
    const audio = new Audio('/sounds/newCustomerBeep.mp3');
    audio.play();
    setCustomerCount(data.count);
  });

  return <>{customerCount}</>;
};

export default NotificationHandler;

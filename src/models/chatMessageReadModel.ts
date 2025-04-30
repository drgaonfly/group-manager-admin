import { useCallback, useState } from 'react';

export interface ChatMessageReadStatus {
  customerId: string;
  userId: string;
  sender: string;
}

export default function ChatMessageReadModel() {
  const [messageReadStatus, setMessageReadStatus] = useState<ChatMessageReadStatus>({
    customerId: '',
    userId: '',
    sender: '',
  });

  const handleMessageReadStatusChange = useCallback((data: ChatMessageReadStatus) => {
    console.log('Message read status changed:', {
      customerId: data.customerId,
      userId: data.userId,
      sender: data.sender,
    });
    setMessageReadStatus({
      customerId: data.customerId,
      userId: data.userId,
      sender: data.sender,
    });
  }, []);

  return { handleMessageReadStatusChange, messageReadStatus };
}

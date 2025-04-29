import { useCallback, useState } from 'react';

export interface ChatMessage {
  customer: any;
  user: any;
  message: string;
  sender: 'customer' | 'user';
  isRead: boolean;
  isSoftDeleted: boolean;
  deletedAt: Date | null;
  unreadCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function Page() {
  const [chatMessage, setChatMessage] = useState<ChatMessage>({
    customer: '',
    user: '',
    message: '',
    sender: 'user',
    isRead: false,
    isSoftDeleted: false,
    deletedAt: null,
  });

  const handleChatMessageChange = useCallback((data: Partial<ChatMessage>) => {
    console.log('Chat message changed:', data);
    setChatMessage((prevState) => ({
      ...prevState,
      ...data,
    }));
  }, []);

  return { handleChatMessageChange, chatMessage };
}

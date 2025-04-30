import { useState, useCallback } from 'react';

export interface UnreadCountData {
  count: number;
}

export default function Page() {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const handleUnreadCountUpdate = useCallback((data: UnreadCountData) => {
    console.log('收到未读消息数量更新:', data);
    setUnreadCount(data.count);
  }, []);

  return {
    unreadCount,
    handleUnreadCountUpdate,
  };
}

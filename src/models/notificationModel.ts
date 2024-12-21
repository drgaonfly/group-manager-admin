import { useState, useCallback } from 'react';

export default function Page() {
  const [orderCount, setOrderCount] = useState<number>(0);

  const handleOrderCountUpdate = useCallback((data: { count: number }) => {
    console.log('Received inactiveOrdersUpdated event:', data);
    setOrderCount(data.count);
  }, []);

  const [todoListcount, setTodoListCount] = useState<number>(0);

  const handleTodoListCountUpdate = useCallback((data: { type: string; count: number }) => {
    if (data.type === 'unprocessed') {
      console.log('Setting new unprocessed count:', data);
      setTodoListCount(data.count);
    }
  }, []);

  return { orderCount, handleOrderCountUpdate, todoListcount, handleTodoListCountUpdate };
}

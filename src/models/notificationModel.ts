import { useCallback } from 'react';

export default function Page() {
  const handleCustomerNew = useCallback((data: { customer: any }) => {
    console.log('Received inactiveOrdersUpdated event:', data);
  }, []);

  return { handleCustomerNew };
}

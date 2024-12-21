import { useCallback } from 'react';

export default function Page() {
  const handleCustomerNew = useCallback((data: { title: string; message: string }) => {
    console.log('Received newCustomerAdded event:', data);
  }, []);

  return { handleCustomerNew };
}

import { useCallback, useState } from 'react';

export default function Page() {
  const [customerNewStatus, setCustomerNewStatus] = useState<string>('loading');

  const handleCustomerNew = useCallback((data: any) => {
    setCustomerNewStatus('completed');
    console.log('Received inactiveOrdersUpdated event:', data);
  }, []);

  return { handleCustomerNew, customerNewStatus };
}

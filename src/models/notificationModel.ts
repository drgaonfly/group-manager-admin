import { useCallback, useState } from 'react';

export default function Page() {
  const [customerNewTimeFlag, setCustomerNewTimeFlag] = useState<string>(
    new Date().toLocaleString(),
  );

  const handleCustomerNew = useCallback((data: { title: string; message: string }) => {
    console.log('Received newCustomerAdded event:', data);
    setCustomerNewTimeFlag(new Date().toLocaleString());
  }, []);

  return { handleCustomerNew, customerNewTimeFlag };
}

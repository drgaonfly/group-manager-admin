import { useCallback, useState } from 'react';

interface CustomerStatus {
  customerId: string;
  isOnline: boolean;
  lastOnline: Date;
}

export default function Page() {
  const [customerStatus, setCustomerStatus] = useState<CustomerStatus>({
    customerId: '',
    isOnline: false,
    lastOnline: new Date(),
  });

  const handleCustomerStatusChange = useCallback(
    (data: { customerId: string; isOn: boolean; lastOnline: Date }) => {
      console.log('Customer status changed:', {
        customerId: data.customerId,
        isOnline: data.isOn,
        lastOnline: data.lastOnline,
      });
      setCustomerStatus({
        customerId: data.customerId,
        isOnline: data.isOn,
        lastOnline: data.lastOnline,
      });
    },
    [],
  );

  return { handleCustomerStatusChange, customerStatus };
}

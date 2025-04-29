import { useEffect, useState } from 'react';
import { queryList } from '@/services/ant-design-pro/api';

const useQueryList = (url: string, hasPermission = true) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const query = async () => {
    setLoading(true);
    // Only proceed with the API call if the user has permission
    if (hasPermission) {
      const response = (await queryList(url, { pageSize: 10000 })) as any;
      if (response.success) {
        setItems(response.data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    query().catch(console.error);
  }, [hasPermission]); // Adding `hasPermission` to the dependency array to re-run the effect if it changes

  return { items, setItems, loading, setLoading, query };
};

export default useQueryList;

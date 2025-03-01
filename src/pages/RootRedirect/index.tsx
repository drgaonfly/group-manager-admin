import { useAccess, Navigate } from '@umijs/max';
import { useEffect } from 'react';

const RootRedirect: React.FC = () => {
  const access = useAccess();

  useEffect(() => {
    window.location.reload();
  }, []);

  return access.canSuperAdmin ? (
    <Navigate to="/welcome" replace />
  ) : (
    <Navigate to="/welcome" replace />
  );
};

export default RootRedirect;

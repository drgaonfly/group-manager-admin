import { useIntl } from '@umijs/max';

const StatusEnum = () => {
  const intl = useIntl();

  return {
    pending: { text: intl.formatMessage({ id: 'pending' }), status: 'default' },
    completed: { text: intl.formatMessage({ id: 'completed' }), status: 'success' },
    failed: { text: intl.formatMessage({ id: 'failed' }), status: 'error' },
    expired: { text: intl.formatMessage({ id: 'expired' }), status: 'warning' },
  };
};

export default StatusEnum;

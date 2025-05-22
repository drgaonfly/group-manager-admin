import { useIntl } from '@umijs/max';

const StatusEnum = () => {
  const intl = useIntl();

  return {
    pending: { text: intl.formatMessage({ id: 'pending' }), status: 'default' },
    paid: { text: intl.formatMessage({ id: 'paid' }), status: 'success' },
    expires: { text: intl.formatMessage({ id: 'expires' }), status: 'error' },
  };
};

export default StatusEnum;

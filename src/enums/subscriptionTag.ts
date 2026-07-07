import { useIntl } from '@umijs/max';

const SubscriptionTag = () => {
  const intl = useIntl();

  return {
    pending: {
      color: 'processing',
      text: intl.formatMessage({ id: 'pending', defaultMessage: '待付款' }),
    },
    paid: { color: 'success', text: intl.formatMessage({ id: 'paid', defaultMessage: '已付款' }) },
    expired: {
      color: 'default',
      text: intl.formatMessage({ id: 'expired', defaultMessage: '已到期' }),
    },
    timeout: {
      color: 'error',
      text: intl.formatMessage({ id: 'timeout', defaultMessage: '订单超时' }),
    },
  } as Record<string, { color: string; text: string }>;
};

export default SubscriptionTag;

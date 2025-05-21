import { useIntl } from '@umijs/max';
// 订阅状态枚举
const SubscriptionStatus = () => {
  const intl = useIntl();

  return {
    active: { text: intl.formatMessage({ id: 'subscription_active' }), value: 'active' },
    expired: { text: intl.formatMessage({ id: 'subscription_expired' }), value: 'expired' },
    canceled: { text: intl.formatMessage({ id: 'subscription_canceled' }), value: 'canceled' },
  };
};

export default SubscriptionStatus;

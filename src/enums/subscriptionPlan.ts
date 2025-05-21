import { useIntl } from '@umijs/max';
const SubscriptionPlanEnum = () => {
  const intl = useIntl();

  return {
    // Half Month
    weekly: { text: intl.formatMessage({ id: 'subscription_weekly' }), value: 'weekly' },
    biweekly: { text: intl.formatMessage({ id: 'subscription_biweekly' }), value: 'biweekly' },
    monthly: { text: intl.formatMessage({ id: 'subscription_monthly' }), value: 'monthly' },
    quarter: { text: intl.formatMessage({ id: 'subscription_quarter' }), value: 'quarter' },
  };
};

export default SubscriptionPlanEnum;

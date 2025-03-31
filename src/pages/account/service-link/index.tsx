import { Card } from 'antd';
import React from 'react';
import { useIntl } from '@umijs/max';

const ServiceLink: React.FC = () => {
  const intl = useIntl();

  return (
    <div style={{ padding: 20 }}>
      <Card
        title={intl.formatMessage({ id: 'menu.account.serviceLink', defaultMessage: '服务链接' })}
      >
        {/* Add your service link content here */}
        <p>Service link content will be displayed here.</p>
      </Card>
    </div>
  );
};

export default ServiceLink;

import { platformNames } from '@/utils/constants';
import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';

const PlatformSelect: React.FC = () => {
  const intl = useIntl();
  return (
    <ProFormSelect
      name="platform"
      label={intl.formatMessage({ id: 'platform' })}
      width="md"
      rules={[{ required: true, message: intl.formatMessage({ id: 'select_platform' }) }]}
      valueEnum={platformNames}
      placeholder={intl.formatMessage({ id: 'select_platform' })}
      initialValue="Shopee"
    />
  );
};

export default PlatformSelect;

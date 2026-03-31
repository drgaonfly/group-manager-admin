import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onChange?: (value: string) => void;
}

const ProxysSelect: React.FC<Props> = ({ newRecord = true, onChange }) => {
  const intl = useIntl();
  const { items: proxys, loading } = useQueryList('/proxies');

  return (
    <ProFormSelect
      rules={[{ required: false }]}
      options={proxys.map((proxy: any) => ({
        label: proxy.name,
        value: proxy._id,
      }))}
      width="md"
      name="proxy"
      label={intl.formatMessage({ id: 'agent' })}
      showSearch
      fieldProps={{
        loading,
        onChange: (value: string) => {
          if (onChange) {
            onChange(value);
          }
        },
      }}
      disabled={!newRecord}
    />
  );
};

export default ProxysSelect;

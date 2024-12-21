import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onChange?: (value: string) => void;
}

const ProxySelect: React.FC<Props> = ({ newRecord = true, onChange }) => {
  const intl = useIntl();
  const { items: user, loading } = useQueryList('/users');

  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={user.map((user: any) => ({
        label: user.name,
        value: user._id,
      }))}
      width="md"
      name="user"
      label={intl.formatMessage({ id: 'user' })}
      showSearch
      fieldProps={{
        loading,
        onChange: (value: string) => {
          console.log('Selected user value:', value);
          if (onChange) {
            onChange(value);
          }
        },
      }}
      disabled={!newRecord}
    />
  );
};

export default ProxySelect;

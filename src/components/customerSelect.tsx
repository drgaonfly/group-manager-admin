import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onChange?: (value: string) => void;
}

const CustomerSelect: React.FC<Props> = ({ newRecord = true, onChange }) => {
  const intl = useIntl();
  const { items: customers, loading } = useQueryList('/customers');

  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={customers.map((customer: any) => ({
        label: `${customer.address} - ${customer.network} - 客户ID:${customer.id}`,
        value: customer._id,
      }))}
      width="xl"
      name="customer"
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

export default CustomerSelect;

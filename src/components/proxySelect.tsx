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
  const { items: proxys, loading } = useQueryList('/proxys');

  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={proxys.map((proxys: any) => ({
        label: proxys.name,
        value: proxys._id,
      }))}
      width="md"
      name="proxys"
      label={intl.formatMessage({ id: 'pages.comment.proxy' })}
      showSearch
      fieldProps={{
        loading,
        onChange: (value: string) => {
          console.log('Selected proxy value:', value);
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

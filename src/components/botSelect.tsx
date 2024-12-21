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
  const { items: bot, loading } = useQueryList('/two-telegrams');

  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={bot.map((bot: any) => ({
        label: bot.name,
        value: bot._id,
      }))}
      width="md"
      name="bot"
      label={intl.formatMessage({ id: 'bot_name' })}
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

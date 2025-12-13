import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onChange?: (value: string) => void;
  width?: string | number;
  name?: string;
  label?: string;
  rules?: any[];
  placeholder?: string;
}

const BotSelect: React.FC<Props> = ({
  newRecord = true,
  onChange,
  name = 'bot',
  label,
  rules,
  placeholder,
}) => {
  const intl = useIntl();
  const { items: bots, loading } = useQueryList('/bots');

  return (
    <ProFormSelect
      rules={rules || [{ required: true, message: '请选择机器人' }]}
      width="md"
      label={label || intl.formatMessage({ id: 'bot', defaultMessage: '机器人' })}
      name={name}
      placeholder={placeholder || '请选择机器人'}
      showSearch
      options={bots.map((bot: any) => ({
        label: `${bot.botName || bot.userName || bot._id}${
          bot.userName ? ` (@${bot.userName})` : ''
        }`,
        value: bot._id,
      }))}
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

export default BotSelect;

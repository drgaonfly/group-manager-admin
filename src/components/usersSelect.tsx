import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onChange?: (value: string) => void;
}

const UserSelect: React.FC<Props> = ({ newRecord = true, onChange }) => {
  const intl = useIntl();
  const { items: user, loading } = useQueryList('/users');

  // 去除重复的用户，假设用户的唯一标识是 user._id
  const uniqueUsers = user.reduce((acc: any[], current: any) => {
    const existingUser = acc.find((item) => item._id === current._id);
    if (!existingUser) {
      acc.push(current);
    }
    return acc;
  }, []);

  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={uniqueUsers.map((user: any) => ({
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

export default UserSelect;

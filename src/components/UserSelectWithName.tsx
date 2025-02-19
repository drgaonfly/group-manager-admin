import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

interface UserSelectProps {
  name: string;
  labelId: string;
}

const UserSelect: React.FC<UserSelectProps> = ({ name, labelId }) => {
  const intl = useIntl();
  const { items: users, loading } = useQueryList('/users');

  const filteredUsers = users.filter(
    (user: any) =>
      user.role !== 'ADMIN' && user.role !== 'ORDER_PLACER' && user.role !== 'REVIEWER',
  );

  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={filteredUsers.map((user: any) => ({
        label: user.name,
        value: user._id,
      }))}
      width="md"
      name={name}
      label={intl.formatMessage({ id: labelId })}
      showSearch
      fieldProps={{ loading }}
    />
  );
};

export default UserSelect;

import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

const MemberSelect: React.FC = () => {
  const intl = useIntl();
  const { items: users, loading } = useQueryList('/members');

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
      name="user"
      label={intl.formatMessage({ id: 'user' })}
      showSearch
      fieldProps={{ loading }}
    />
  );
};

export default MemberSelect;

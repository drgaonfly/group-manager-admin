import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useAccess, useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

const UserSelect: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const { items: users } = useQueryList('/users', access.canAdmin);
  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={users.map((user: any) => ({
        label: user.name,
        value: user._id,
      }))}
      width="md"
      name="user"
      label={intl.formatMessage({ id: 'user' })}
      showSearch
    />
  );
};

export default UserSelect;

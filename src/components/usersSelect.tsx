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
  const { items: users, loading } = useQueryList('/users');

  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={users.map((users: any) => ({
        label: users.name,
        value: users._id,
      }))}
      width="md"
      name="users"
      label={intl.formatMessage({ id: 'pages.comment.user' })}
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

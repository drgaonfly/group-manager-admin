import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onChange?: (value: string) => void;
}

const GroupSelect: React.FC<Props> = ({ newRecord = true, onChange }) => {
  const intl = useIntl();
  const { items: groups, loading } = useQueryList('/groups');

  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={groups.map((group: any) => ({
        label: group.title, //群组名称
        value: group._id,
      }))}
      width="md"
      name="group"
      label={intl.formatMessage({ id: 'group.title', defaultMessage: '群组' })}
      showSearch
      fieldProps={{
        loading,
        onChange: (value: string) => {
          console.log('Selected group value:', value);
          if (onChange) {
            onChange(value);
          }
        },
      }}
      disabled={!newRecord}
    />
  );
};

export default GroupSelect;

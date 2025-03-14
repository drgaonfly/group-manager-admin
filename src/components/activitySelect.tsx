import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

interface ActivitySelectProps {
  disabled?: boolean;
}

const ActivitySelect: React.FC<ActivitySelectProps> = ({ disabled }) => {
  const intl = useIntl();
  const { items: activities, loading } = useQueryList('/activities');

  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={activities.map((activity: any) => ({
        label: activity.id,
        value: activity._id,
      }))}
      width="md"
      name="activity"
      label={intl.formatMessage({ id: 'activity' })}
      showSearch
      fieldProps={{ loading }}
      disabled={disabled}
    />
  );
};

export default ActivitySelect;

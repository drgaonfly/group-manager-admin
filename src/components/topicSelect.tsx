import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onChange?: (value: string) => void;
}

const TopicSelect: React.FC<Props> = ({ newRecord = true, onChange }) => {
  const intl = useIntl();
  const { items: topics, loading } = useQueryList('/topics');

  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={topics.map((topics: any) => ({
        label: topics.name,
        value: topics._id,
      }))}
      width="md"
      name="topics"
      label={intl.formatMessage({ id: 'pages.comment.topic' })}
      showSearch
      fieldProps={{
        loading,
        onChange: (value: string) => {
          console.log('Selected topic value:', value);
          if (onChange) {
            onChange(value);
          }
        },
      }}
      disabled={!newRecord}
    />
  );
};

export default TopicSelect;

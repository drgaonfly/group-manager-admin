import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onChange?: (value: string) => void;
}

const AnswerSelect: React.FC<Props> = ({ newRecord = true, onChange }) => {
  const intl = useIntl();
  const { items: answer, loading } = useQueryList('/answers');

  return (
    <ProFormSelect
      rules={[{ required: true }]}
      options={answer.map((answer: any) => ({
        label: answer.skuName,
        value: answer._id,
      }))}
      width="md"
      name="answer"
      label={intl.formatMessage({ id: 'pages.comment.answer' })}
      showSearch
      fieldProps={{
        loading,
        onChange: (value: string) => {
          console.log('Selected answer value:', value);
          if (onChange) {
            onChange(value);
          }
        },
      }}
      disabled={!newRecord}
    />
  );
};

export default AnswerSelect;

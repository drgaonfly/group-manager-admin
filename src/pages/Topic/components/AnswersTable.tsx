import React from 'react';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { useIntl } from '@umijs/max';

export interface AnswerItem {
  _id: string;
  image: string;
  brandName: string;
  createdAt: string;
  id: string;
  rowNumber: number;
  skuName: string;
  sn: string;
  spec: string;
  topic: string;
  updatedAt: string;
}

interface AnswersTableProps {
  answers: AnswerItem[];
  loading: boolean;
  pagination: { current: number; pageSize: number };
  setPagination: (pagination: { current: number; pageSize: number }) => void;
}

const AnswersTable: React.FC<AnswersTableProps> = ({
  answers,
  loading,
  pagination,
  setPagination,
}) => {
  const intl = useIntl();
  const tableColumns: ProColumns<AnswerItem>[] = [
    {
      title: intl.formatMessage({ id: 'brandName' }),
      dataIndex: 'brandName',
    },
    {
      title: intl.formatMessage({ id: 'skuName' }),
      dataIndex: 'skuName',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'spec' }),
      dataIndex: 'spec',
    },
    {
      title: intl.formatMessage({ id: 'sn' }),
      dataIndex: 'sn',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'image' }),
      dataIndex: 'image',
      valueType: 'image',
    },
    {
      title: intl.formatMessage({ id: 'createdAt' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
    },
  ];

  return (
    <EditableProTable<AnswerItem>
      rowKey="_id"
      headerTitle={<FormattedMessage id="show.answers" defaultMessage="答案" />}
      columns={tableColumns}
      value={answers}
      loading={loading}
      recordCreatorProps={false}
      style={{ marginTop: '20px' }}
      pagination={{
        ...pagination,
        total: answers.length,
        onChange: (page, pageSize) => {
          setPagination({ current: page, pageSize });
        },
      }}
    />
  );
};

export default AnswersTable;

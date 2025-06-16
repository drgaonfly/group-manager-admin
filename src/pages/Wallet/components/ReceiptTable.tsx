import React from 'react';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import moment from 'moment';

interface ReceiptTableProps {
  receipts: any[];
  pagination: { current: number; pageSize: number };
  setPagination: (pagination: { current: number; pageSize: number }) => void;
}

const ReceiptTable: React.FC<ReceiptTableProps> = ({ receipts, pagination, setPagination }) => {
  const intl = useIntl();

  const tableColumns: ProColumns<any>[] = [
    {
      title: intl.formatMessage({ id: 'id' }),
      dataIndex: 'id',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'amount' }),
      dataIndex: 'amount',
    },
    {
      title: intl.formatMessage({ id: 'hash' }),
      dataIndex: 'hash',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'botUser' }),
      dataIndex: 'botUser',
      renderText: (botUser) => botUser?.userName || botUser?.displayName,
    },
    {
      title: intl.formatMessage({ id: 'bot' }),
      dataIndex: 'bot',
      renderText: (bot) => bot?.botName,
    },
    {
      title: intl.formatMessage({ id: 'time' }),
      dataIndex: 'time',
      valueType: 'dateTime',
      render: (_, record) => moment(record.time * 1000).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <EditableProTable<any>
      rowKey="id"
      headerTitle={<FormattedMessage id="show_receipts" defaultMessage="收据记录" />}
      columns={tableColumns}
      value={receipts}
      recordCreatorProps={false}
      style={{ marginTop: 20 }}
      pagination={{
        ...pagination,
        total: receipts?.length,
        onChange: (page, pageSize) => {
          setPagination({ current: page, pageSize });
        },
      }}
    />
  );
};

export default ReceiptTable;

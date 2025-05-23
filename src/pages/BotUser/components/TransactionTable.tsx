import React from 'react';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';

interface TransactionTableProps {
  transactions: any[];
  loading: boolean;
  pagination: { current: number; pageSize: number };
  setPagination: (pagination: { current: number; pageSize: number }) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  pagination,
  setPagination,
  loading,
}) => {
  const intl = useIntl();

  const tableColumns: ProColumns<any>[] = [
    {
      title: intl.formatMessage({ id: 'id', defaultMessage: 'ID' }),
      dataIndex: 'id',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'type', defaultMessage: '类型' }),
      dataIndex: 'type',
      valueEnum: {
        withdraw: intl.formatMessage({ id: 'withdraw' }),
        deposit: intl.formatMessage({ id: 'deposit' }),
      },
    },
    {
      title: intl.formatMessage({ id: 'amount', defaultMessage: '金额' }),
      dataIndex: 'amount',
    },
    {
      title: intl.formatMessage({ id: 'exchange_rate', defaultMessage: '汇率' }),
      dataIndex: 'exchange_rate',
    },
    {
      title: intl.formatMessage({ id: 'fee_rate', defaultMessage: '费率' }),
      dataIndex: 'fee_rate',
    },
    {
      title: intl.formatMessage({ id: 'usdt_amount', defaultMessage: 'USDT 金额' }),
      dataIndex: 'usdt_amount',
    },
    {
      title: intl.formatMessage({ id: 'botUser', defaultMessage: '用户 ID' }),
      dataIndex: ['botUser', 'userName'], // 或直接 'botUser'，视后端数据结构而定
    },
  ];

  return (
    <EditableProTable<any>
      rowKey="id"
      headerTitle={<FormattedMessage id="show_transactions" defaultMessage="交易记录" />}
      columns={tableColumns}
      value={transactions}
      recordCreatorProps={false}
      style={{ marginTop: 20 }}
      loading={loading}
      pagination={{
        ...pagination,
        total: transactions.length,
        onChange: (page, pageSize) => {
          setPagination({ current: page, pageSize });
        },
      }}
    />
  );
};

export default TransactionTable;

import React from 'react';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import StatusEnum from '@/enums/paymentStatus';

interface PaymentTableProps {
  payments: any[];
  loading: boolean;
  pagination: { current: number; pageSize: number };
  setPagination: (pagination: { current: number; pageSize: number }) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
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
      title: intl.formatMessage({ id: 'orderNumber', defaultMessage: '订单号' }),
      dataIndex: 'orderNumber',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'type', defaultMessage: '类型' }),
      dataIndex: 'type',
      render: (_, record) => {
        return intl.formatMessage({ id: `${record.type}` });
      },
    },
    {
      title: intl.formatMessage({ id: 'status', defaultMessage: '状态' }),
      dataIndex: 'status',
      valueEnum: StatusEnum,
    },
    {
      title: intl.formatMessage({ id: 'amount', defaultMessage: '金额' }),
      dataIndex: 'amount',
    },
    {
      title: intl.formatMessage({ id: 'sendAddress', defaultMessage: '发送地址' }),
      dataIndex: 'sendAddress',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'receiveAddress', defaultMessage: '接收地址' }),
      dataIndex: 'receiveAddress',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'txHash', defaultMessage: '交易哈希' }),
      dataIndex: 'txHash',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'createdAt', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
    },
    {
      title: intl.formatMessage({ id: 'expiresAt', defaultMessage: '过期时间' }),
      dataIndex: 'expiresAt',
      valueType: 'dateTime',
    },
  ];

  return (
    <EditableProTable<any>
      rowKey="id"
      headerTitle={<FormattedMessage id="show_payments" defaultMessage="支付记录" />}
      columns={tableColumns}
      value={payments}
      recordCreatorProps={false}
      style={{ marginTop: 20 }}
      loading={loading}
      pagination={{
        ...pagination,
        total: payments?.length,
        onChange: (page, pageSize) => {
          setPagination({ current: page, pageSize });
        },
      }}
    />
  );
};

export default PaymentTable;

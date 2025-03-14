import React from 'react';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { useIntl } from '@umijs/max';

interface CustomerTableProps {
  customers: API.ItemData[];
  loading: boolean;
  pagination: { current: number; pageSize: number };
  setPagination: (pagination: { current: number; pageSize: number }) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  loading,
  pagination,
  setPagination,
}) => {
  const intl = useIntl();
  const tableColumns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'network' }),
      dataIndex: 'network',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'address' }),
      dataIndex: 'address',
      copyable: true,
    },
  ];

  return (
    <EditableProTable<API.ItemData>
      rowKey="_id"
      headerTitle={<FormattedMessage id="show.wallets" defaultMessage="钱包" />}
      columns={tableColumns}
      value={customers}
      loading={loading}
      recordCreatorProps={false}
      style={{ marginTop: '20px' }}
      pagination={{
        ...pagination,
        total: customers.length,
        onChange: (page, pageSize) => {
          setPagination({ current: page, pageSize });
        },
      }}
    />
  );
};

export default CustomerTable;

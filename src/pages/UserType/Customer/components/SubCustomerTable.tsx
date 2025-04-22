import React from 'react';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { useIntl } from '@umijs/max';

interface ICustomer {
  id: string;
  network: 'TRX' | 'BSC' | 'ETH';
  address: string;
  parent: string | ICustomer;
  children: ICustomer[];
}

interface SubCustomerTableProps {
  customers: ICustomer[];
  loading: boolean;
  pagination: { current: number; pageSize: number };
  setPagination: (pagination: { current: number; pageSize: number }) => void;
}

const SubCustomerTable: React.FC<SubCustomerTableProps> = ({
  customers,
  loading,
  pagination,
  setPagination,
}) => {
  const intl = useIntl();

  // 递归展开所有客户数据
  const expandCustomers = (customerList: ICustomer[]): ICustomer[] => {
    let result: ICustomer[] = [];
    customerList.forEach((customer) => {
      result.push(customer);
      if (customer.children && customer.children.length > 0 && (customer.children as any).parent) {
        result = result.concat(expandCustomers(customer.children));
      }
    });
    return result;
  };

  const tableColumns: ProColumns<ICustomer>[] = [
    {
      title: intl.formatMessage({ id: 'id' }),
      dataIndex: 'id',
    },
    {
      title: intl.formatMessage({ id: 'network' }),
      dataIndex: 'network',
      valueEnum: {
        TRX: 'TRX',
        BSC: 'BSC',
        ETH: 'ETH',
      },
    },
    {
      title: intl.formatMessage({ id: 'address' }),
      dataIndex: 'address',
      ellipsis: true,
    },
  ];

  const expandedCustomers = expandCustomers(customers);

  return (
    <EditableProTable<ICustomer>
      rowKey="id"
      headerTitle={<FormattedMessage id="show.invitedCustomers" defaultMessage="邀请的客户列表" />}
      columns={tableColumns}
      value={expandedCustomers}
      loading={loading}
      recordCreatorProps={false}
      style={{ marginTop: '20px' }}
      pagination={{
        ...pagination,
        total: expandedCustomers.length,
        onChange: (page, pageSize) => {
          setPagination({ current: page, pageSize });
        },
      }}
    />
  );
};

export default SubCustomerTable;

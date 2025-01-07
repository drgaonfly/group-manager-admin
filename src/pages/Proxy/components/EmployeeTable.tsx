import React from 'react';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { useIntl } from '@umijs/max';

interface EmployeeTableProps {
  employees: API.ItemData[];
  loading: boolean;
  pagination: { current: number; pageSize: number };
  setPagination: (pagination: { current: number; pageSize: number }) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  loading,
  pagination,
  setPagination,
}) => {
  const intl = useIntl();
  const tableColumns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'name' }),
      dataIndex: 'name',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'email' }),
      dataIndex: 'email',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'role' }),
      dataIndex: 'roles',
      hideInSearch: true,
      render: (roles: any) => roles.map((role: any) => role.name).join(', '), // 新增：显示角色名称
    },
  ];

  return (
    <EditableProTable<API.ItemData>
      rowKey="_id"
      headerTitle={<FormattedMessage id="show.employees" defaultMessage="员工" />}
      columns={tableColumns}
      value={employees}
      loading={loading}
      recordCreatorProps={false}
      style={{ marginTop: '20px' }}
      pagination={{
        ...pagination,
        total: employees.length,
        onChange: (page, pageSize) => {
          setPagination({ current: page, pageSize });
        },
      }}
    />
  );
};

export default EmployeeTable;

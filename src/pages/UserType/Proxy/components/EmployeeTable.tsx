import React from 'react';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { useIntl } from '@umijs/max';
import { Typography } from 'antd';

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
      title: intl.formatMessage({ id: 'inviteCode' }),
      dataIndex: 'roles',
      hideInSearch: true,
      render: (inviteCode, record) => {
        if (!inviteCode) return '-';
        const fullUrl = `${process.env.UMI_APP_FRONTEND_URL}?code=${record.inviteCode}`;
        return <Typography.Text copyable>{fullUrl}</Typography.Text>;
      },
    },
  ];

  return (
    <EditableProTable<API.ItemData>
      rowKey="_id"
      headerTitle={<FormattedMessage id="show.employees" defaultMessage="渠道" />}
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

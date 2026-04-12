import React from 'react';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { useIntl } from '@umijs/max';

interface ProxyTableProps {
  proxies: API.ItemData[];
  loading: boolean;
  pagination: { current: number; pageSize: number };
  setPagination: (pagination: { current: number; pageSize: number }) => void;
}

const ProxyTable: React.FC<ProxyTableProps> = ({ proxies, loading, pagination, setPagination }) => {
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
      render: (roles: any) =>
        Array.isArray(roles)
          ? roles
              .map((role: any) => role?.name)
              .filter(Boolean)
              .join(', ') || '—'
          : '—',
    },
  ];

  return (
    <EditableProTable<API.ItemData>
      rowKey="_id"
      headerTitle={<FormattedMessage id="show.proxies" defaultMessage="代理" />}
      columns={tableColumns}
      value={proxies}
      loading={loading}
      recordCreatorProps={false}
      style={{ marginTop: '20px' }}
      pagination={{
        ...pagination,
        total: proxies.length,
        onChange: (page, pageSize) => {
          setPagination({ current: page, pageSize });
        },
      }}
    />
  );
};

export default ProxyTable;

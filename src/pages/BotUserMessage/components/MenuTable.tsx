import React from 'react';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { useIntl } from '@umijs/max';

interface MenuTableProps {
  menus: any[];
  loading?: boolean;
  pagination: { current: number; pageSize: number };
  setPagination: (pagination: { current: number; pageSize: number }) => void;
}

const MenuTable: React.FC<MenuTableProps> = ({ menus, pagination, setPagination }) => {
  const intl = useIntl();
  const tableColumns: ProColumns<any>[] = [
    {
      title: intl.formatMessage({ id: 'name', defaultMessage: '按钮' }),
      dataIndex: 'name',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'url', defaultMessage: '菜单链接' }),
      dataIndex: 'url',
      copyable: true,
    },
  ];

  return (
    <EditableProTable<any>
      rowKey="name"
      headerTitle={<FormattedMessage id="show.menus" defaultMessage="菜单配置" />}
      columns={tableColumns}
      value={menus}
      recordCreatorProps={false}
      style={{ marginTop: '20px' }}
      pagination={{
        ...pagination,
        total: menus.length,
        onChange: (page, pageSize) => {
          setPagination({ current: page, pageSize });
        },
      }}
    />
  );
};

export default MenuTable;

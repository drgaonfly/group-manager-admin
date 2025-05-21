import React from 'react';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { useIntl } from '@umijs/max';

interface BotUserTableProps {
  botUsers: any[];
  loading?: boolean;
  pagination: { current: number; pageSize: number };
  setPagination: (pagination: { current: number; pageSize: number }) => void;
}

const BotUserTable: React.FC<BotUserTableProps> = ({ botUsers, pagination, setPagination }) => {
  const intl = useIntl();
  const tableColumns: ProColumns<any>[] = [
    // id
    {
      title: intl.formatMessage({ id: 'id' }),
      dataIndex: 'id',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'userName' }),
      dataIndex: 'userName',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'first_name_user_telegram' }),
      dataIndex: 'firstName',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'last_name_user_telegram' }),
      dataIndex: 'lastName',
      copyable: true,
    },
  ];

  return (
    <EditableProTable<any>
      rowKey="id"
      headerTitle={<FormattedMessage id="show.botUsers" defaultMessage="机器人用户" />}
      columns={tableColumns}
      value={botUsers}
      recordCreatorProps={false}
      style={{ marginTop: '20px' }}
      pagination={{
        ...pagination,
        total: botUsers.length,
        onChange: (page, pageSize) => {
          setPagination({ current: page, pageSize });
        },
      }}
    />
  );
};

export default BotUserTable;

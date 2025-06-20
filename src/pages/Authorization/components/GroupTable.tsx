import React from 'react';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { useIntl } from '@umijs/max';

const GroupTable: React.FC<any> = ({ groups, pagination, setPagination }) => {
  const intl = useIntl();

  const tableColumns: ProColumns<any>[] = [
    {
      title: intl.formatMessage({ id: 'id', defaultMessage: 'ID' }),
      dataIndex: 'id',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'title', defaultMessage: '群名' }),
      dataIndex: 'title',
    },
    {
      title: intl.formatMessage({ id: 'type', defaultMessage: '类型' }),
      dataIndex: 'type',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'exchange_rate', defaultMessage: 'Exchange Rate' }),
      dataIndex: 'exchange_rate',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'fee_rate', defaultMessage: 'Fee Rate' }),
      dataIndex: 'fee_rate',
      hideInSearch: true,
      valueType: 'percent',
    },
    // isOnline
    {
      title: intl.formatMessage({ id: 'isOnline', defaultMessage: '状态' }),
      dataIndex: 'isOnline',
      hideInSearch: true,
      renderText: (record) =>
        record?.isOnline
          ? intl.formatMessage({ id: 'online', defaultMessage: '在线' })
          : intl.formatMessage({ id: 'offline', defaultMessage: '离线' }),
    },
    {
      title: intl.formatMessage({ id: 'createdAt' }),
      dataIndex: 'createdAt',
      hideInSearch: true,
    },
  ];

  return (
    <EditableProTable<any>
      rowKey="id"
      headerTitle={<FormattedMessage id="show.groups" defaultMessage="群组列表" />}
      columns={tableColumns}
      value={groups}
      recordCreatorProps={false}
      style={{ marginTop: '20px' }}
      pagination={{
        ...pagination,
        total: groups.length,
        onChange: (page, pageSize) => {
          setPagination({ current: page, pageSize });
        },
      }}
    />
  );
};

export default GroupTable;

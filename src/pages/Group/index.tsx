import { useIntl } from '@umijs/max';
import { queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message, Switch } from 'antd';
import React, { useRef, useState } from 'react';
import Update from './components/Update';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';

const handleUpdate = async (fields: any) => {
  const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);
  try {
    await updateItem(`/groups/${fields._id}`, fields);
    hide();
    message.success(<FormattedMessage id="update_successful" defaultMessage="Update successful" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Failed to update group');
    return false;
  }
};

const handleRemove = async (ids: any) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  try {
    await removeItem('/groups', { ids });
    hide();
    message.success(
      <FormattedMessage id="delete_successful" defaultMessage="Deleted successfully" />,
    );
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Failed to delete group');
    return false;
  }
};

const GroupTableList: React.FC = () => {
  const intl = useIntl();
  const [updateModalOpen, handleUpdateModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const [activeKey, setActiveKey] = useState<string | undefined>('');
  const access = useAccess();

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'agent' }),
      dataIndex: 'agent',
      copyable: true,
      hideInTable: !access.canSuperAdmin,
      hideInSearch: true,
      renderText: (_, record) => {
        return record?.proxy?.name;
      },
    },
    // id
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
      hideInTable: false,
    },
    {
      title: intl.formatMessage({ id: 'fee_rate', defaultMessage: 'Fee Rate' }),
      dataIndex: 'fee_rate',
      hideInSearch: true,
      valueType: 'percent',
      hideInTable: false,
    },
    {
      title: intl.formatMessage({ id: 'bot', defaultMessage: '机器人' }),
      dataIndex: 'bot',
      copyable: true,
      renderText: (bot) => bot?.botName,
    },
    // message
    {
      title: intl.formatMessage({ id: 'content_of_act', defaultMessage: '活动内容' }),
      dataIndex: 'message',
      hideInSearch: true,
      hideInTable: false,
    },
    // intervalTime
    {
      title: intl.formatMessage({ id: 'intervalTime', defaultMessage: 'Interval Time' }),
      dataIndex: 'intervalTime',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'operators', defaultMessage: '操作员' }),
      dataIndex: 'operators',
      hideInSearch: true,
      render: (text) =>
        Array.isArray(text)
          ? text.map((op: any) => op.userName || op.firstName || op.lastName).join(', ')
          : '',
    },
    // isOnline
    {
      title: intl.formatMessage({ id: 'isOnline', defaultMessage: 'Is Online' }),
      dataIndex: 'isOnline',
      hideInSearch: true,
      render: (_, record: any) => (
        <Switch
          checkedChildren={intl.formatMessage({ id: 'online' })}
          unCheckedChildren={intl.formatMessage({ id: 'offline' })}
          checked={record.isOnline}
          onChange={async () => {
            await handleUpdate({ _id: record._id, isOnline: !record.isOnline });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'creator', defaultMessage: 'Creator' }),
      dataIndex: ['creator', 'userName'],
      copyable: true,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'createdAt' }),
      dataIndex: 'createdAt',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Actions" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="detail"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <FormattedMessage id="platforms.detail" defaultMessage="Detail" />
        </a>,
        access.canUpdateGroup && (
          <a
            key="edit"
            onClick={() => {
              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            {intl.formatMessage({ id: 'edit' })}
          </a>
        ),
        access.canDeleteGroup && (
          <DeleteLink
            onOk={async () => {
              await handleRemove([record._id!]);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ItemData, API.PageParams>
        headerTitle={intl.formatMessage({ id: 'group_list', defaultMessage: '群组列表' })}
        actionRef={actionRef}
        rowKey="_id"
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeKey,
            items: [
              {
                label: <FormattedMessage id="all" defaultMessage="all" />,
                key: '',
              },
              {
                label: <FormattedMessage id="online" defaultMessage="online" />,
                key: 'true',
              },
              {
                label: <FormattedMessage id="offline" defaultMessage="offline" />,
                key: 'false',
              },
            ],
            onChange: (key: any) => {
              setActiveKey(key);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            },
          },
        }}
        request={async (params, sort, filter) => {
          // 处理isOnline参数
          let isOnline;
          if (activeKey === '') {
            isOnline = undefined; // 全部
          } else if (activeKey === 'true') {
            isOnline = true; // 在线
          } else if (activeKey === 'false') {
            isOnline = false; // 离线
          }

          return queryList('/groups', { ...params, isOnline }, sort, filter);
        }}
        columns={columns}
        rowSelection={
          access.canSuperAdmin && {
            onChange: (_, selectedRows) => setSelectedRows(selectedRows),
          }
        }
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="items" />
            </div>
          }
        >
          <DeleteButton
            onOk={async () => {
              await handleRemove(selectedRowsState.map((item) => item._id!));
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
        </FooterToolbar>
      )}
      {access.canUpdateGroup && (
        <Update
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalOpen(false);
              setCurrentRow(undefined);
              actionRef.current?.reload();
            }
          }}
          onCancel={handleUpdateModalOpen}
          updateModalOpen={updateModalOpen}
          values={currentRow || {}}
        />
      )}
      <Show
        open={showDetail}
        currentRow={currentRow}
        columns={columns as ProDescriptionsItemProps<any>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default GroupTableList;

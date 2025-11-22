// index.tsx or BotUserMessageTableList.tsx
import { useIntl, useModel } from '@umijs/max';
import { queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message, Switch, Image } from 'antd';
import React, { useRef, useState } from 'react';
import Update from './components/Update';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import ActionButton from '@/components/ActionButton';

const handleUpdate = async (fields: any) => {
  const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);
  try {
    await updateItem(`/bot-user-messages/${fields._id}`, fields); // updated endpoint
    hide();
    message.success(<FormattedMessage id="update_successful" defaultMessage="Update successful" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Failed to update');
    return false;
  }
};

const handleRemove = async (ids: any) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  try {
    await removeItem('/bot-user-messages', { ids }); // updated endpoint
    hide();
    message.success(
      <FormattedMessage id="delete_successful" defaultMessage="Deleted successfully" />,
    );
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Failed to delete');
    return false;
  }
};

const BotUserMessageTableList: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [updateModalOpen, handleUpdateModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const [activeKey, setActiveKey] = useState<string | undefined>('');

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'agent' }),
      dataIndex: 'agent',
      copyable: true,
      hideInTable: !currentUser?.isAdmin,
      hideInSearch: true,
      renderText: (_, record) => {
        return record?.proxy?.name;
      },
    },
    {
      title: intl.formatMessage({ id: 'bot', defaultMessage: 'Bot' }),
      dataIndex: 'bot',
      renderText: (_, record) => record.bot?.botName,
      copyable: true,
    },
    // botUsers
    {
      title: intl.formatMessage({ id: 'botUsers', defaultMessage: 'Bot Users' }),
      dataIndex: 'botUsers',
      hideInSearch: true,
      renderText: (_, record) =>
        record?.botUsers.map((botUser: any) => botUser?.displayName).join(', '),
    },

    {
      title: intl.formatMessage({ id: 'weight', defaultMessage: '权重' }),
      dataIndex: 'weight',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'isOnline' }),
      dataIndex: 'isOnline',
      hideInSearch: false,
      render: (_, record: any) => (
        <Switch
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
      title: intl.formatMessage({ id: 'content', defaultMessage: 'Content' }),
      dataIndex: 'content',
      ellipsis: true,
      width: 200,
      hideInSearch: true,
    },
    // image
    {
      title: intl.formatMessage({ id: 'image', defaultMessage: '图片' }),
      dataIndex: 'images',
      hideInSearch: true,
      render: (_, record) => {
        if (!record.images || !Array.isArray(record.images) || record.images.length === 0) {
          return null;
        }
        return (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {record.images.map((img: string, idx: number) => (
              <Image
                key={img || idx}
                src={img}
                alt={`message-${idx}`}
                style={{ maxWidth: '100px', maxHeight: '100px' }}
                preview
              />
            ))}
          </div>
        );
      },
    },
    // intervalTime
    // {
    //   title: intl.formatMessage({ id: 'interval_time_hour' }),
    //   dataIndex: 'bot',
    //   hideInSearch: true,
    //   renderText: (_, record) => {
    //     return record.bot.intervalTime;
    //   },
    // },
    {
      title: intl.formatMessage({ id: 'createdAt', defaultMessage: 'Created At' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Actions" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <ActionButton
          key="detail"
          type="detail"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <FormattedMessage id="detail" defaultMessage="Detail" />
        </ActionButton>,
        access.canUpdateSubscription && (
          <ActionButton
            key="edit"
            type="edit"
            onClick={() => {
              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            {intl.formatMessage({ id: 'edit' })}
          </ActionButton>
        ),
        access.canDeleteSubscription && (
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
        headerTitle={intl.formatMessage({
          id: 'list',
        })}
        scroll={{ x: 1000 }}
        search={{
          labelWidth: 120,
          collapsed: false,
        }}
        actionRef={actionRef}
        rowKey="_id"
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeKey,
            items: [
              {
                label: <FormattedMessage id="platform.all" defaultMessage="所有" />,
                key: '',
              },
              {
                label: <FormattedMessage id="platform.online" defaultMessage="Online" />,
                key: 'true',
              },
              {
                label: <FormattedMessage id="platform.offline" defaultMessage="Offline" />,
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
        request={(params, sort, filter) =>
          queryList(
            '/bot-user-messages',
            {
              ...params,
              isOnline: activeKey, // 添加这个行
            },
            sort,
            filter,
          )
        }
        columns={columns}
        rowSelection={
          access.canUpdateSubscription && {
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
      {access.canUpdateSubscription && (
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

export default BotUserMessageTableList;

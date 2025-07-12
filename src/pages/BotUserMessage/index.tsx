// index.tsx or BotUserMessageTableList.tsx
import { useIntl } from '@umijs/max';
import { queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message } from 'antd';
import React, { useRef, useState } from 'react';
import Update from './components/Update';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';

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
  const [updateModalOpen, handleUpdateModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  // const [activeKey, setActiveKey] = useState<string | undefined>('');
  const access = useAccess();

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'bot', defaultMessage: 'Bot' }),
      dataIndex: 'bot',
      renderText: (_, record) => record.bot.botName,
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
      title: intl.formatMessage({ id: 'content', defaultMessage: 'Content' }),
      dataIndex: 'content',
      ellipsis: true,
    },
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
        <a
          key="detail"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <FormattedMessage id="detail" defaultMessage="Detail" />
        </a>,
        access.canUpdateSubscription && (
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
        actionRef={actionRef}
        rowKey="_id"
        // toolbar={{
        //   menu: {
        //     type: 'tab',
        //     activeKey,
        //     items: [
        //       { label: <FormattedMessage id="platform.all" defaultMessage="All" />, key: '' },
        //       { label: <FormattedMessage id="sent" defaultMessage="Sent" />, key: 'sent' },
        //       { label: <FormattedMessage id="received" defaultMessage="Received" />, key: 'received' },
        //       { label: <FormattedMessage id="error" defaultMessage="Error" />, key: 'error' },
        //     ],
        //     onChange: (key : any) => {
        //       setActiveKey(key);
        //       actionRef.current?.reload();
        //     },
        //   },
        // }}
        request={(params, sort, filter) =>
          queryList('/bot-user-messages', { ...params }, sort, filter)
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

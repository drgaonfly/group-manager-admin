import { useIntl, useModel } from '@umijs/max';
import { queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import ActionButton from '@/components/ActionButton';
import SendMessageModal from './components/SendMessageModal';
import CopyToClipboard from '@/components/CopyToClipboard';

const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);
  try {
    await updateItem(`/bot-user-configs/${fields._id}`, fields);
    hide();
    message.success(<FormattedMessage id="update_successful" defaultMessage="Update successful" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ?? (
        <FormattedMessage id="update_failed" defaultMessage="Update failed, please try again!" />
      ),
    );
    return false;
  }
};

const handleRemove = async (ids: string[]) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  if (!ids) return true;
  try {
    await removeItem('/bot-user-configs', { ids });
    hide();
    message.success(<FormattedMessage id="delete_successful" defaultMessage="Delete successful" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ?? (
        <FormattedMessage id="delete_failed" defaultMessage="Delete failed, please try again" />
      ),
    );
    return false;
  }
};

const TableList: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const [messageModalOpen, setMessageModalOpen] = useState<boolean>(false);

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
    // id
    {
      title: intl.formatMessage({ id: 'id' }),
      dataIndex: 'id',
      hideInSearch: true,
      renderText: (_, record) => record?.botUser?.id,
    },
    {
      title: intl.formatMessage({ id: 'user' }),
      dataIndex: 'botUser',
      copyable: true,
      renderText: (botUser) => botUser?.userName || botUser?.displayName,
    },
    {
      title: intl.formatMessage({ id: 'promotion_link', defaultMessage: '推广链接' }),
      dataIndex: 'promotionLink',
      hideInSearch: true,
      render: (_, record: any) => {
        const promotionLink = record.promotionLink;
        if (!promotionLink) {
          return '-';
        }
        return (
          <div>
            <div>
              <strong>{promotionLink.title || '-'}</strong>
            </div>
            {promotionLink.link && (
              <div>
                <a href={promotionLink.link} target="_blank" rel="noopener noreferrer">
                  {promotionLink.link}
                </a>
                <CopyToClipboard text={promotionLink.link} />
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'bot', defaultMessage: '机器人' }),
      dataIndex: 'bot',
      copyable: true,
      renderText: (bot) => bot?.botName,
    },
    {
      title: intl.formatMessage({ id: 'first_name_user_telegram' }),
      dataIndex: 'firstName',
      hideInSearch: true,
      copyable: true,
      renderText: (firstName, record) => record.botUser?.firstName,
    },
    // last_name
    {
      title: intl.formatMessage({ id: 'last_name_user_telegram' }),
      dataIndex: 'lastName',
      hideInSearch: true,
      copyable: true,
      renderText: (lastName, record) => record.botUser?.lastName,
    },
    {
      title: intl.formatMessage({ id: 'balance' }),
      dataIndex: 'usdt_balance',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'createdAt' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => [
        <ActionButton
          key="detail"
          type="detail"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <FormattedMessage id="detail" defaultMessage="详情" />
        </ActionButton>,
        access.canUpdateBotUserConfig && (
          <ActionButton
            key="sendMessage"
            type="send_message"
            onClick={() => {
              setCurrentRow(record);
              setMessageModalOpen(true);
            }}
          >
            <FormattedMessage id="send_message" />
          </ActionButton>
        ),
        access.canUpdateBotUserConfig && (
          <ActionButton
            key="edit"
            type="edit"
            onClick={() => {
              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            <FormattedMessage id="edit" defaultMessage="编辑" />
          </ActionButton>
        ),
        access.canDeleteBotUserConfig && (
          <DeleteLink
            key="delete"
            onOk={async () => {
              await handleRemove([record._id!]);
              actionRef.current?.reload();
            }}
          />
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ItemData, API.PageParams>
        headerTitle={intl.formatMessage({ id: 'list' })}
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
        search={{ labelWidth: 120 }}
        request={(params, sort, filter) => queryList('/bot-user-configs', params, sort, filter)}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" />
            </div>
          }
        >
          {access.canDeleteBotUserConfig && (
            <DeleteButton
              onOk={async () => {
                await handleRemove(selectedRowsState.map((item) => item._id!));
                setSelectedRows([]);
                actionRef.current?.reloadAndRest?.();
              }}
            />
          )}
        </FooterToolbar>
      )}

      {access.canUpdateBotUserConfig && (
        <Update
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalOpen(false);
              setCurrentRow(undefined);
              actionRef.current?.reload();
            }
          }}
          onCancel={() => {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
          }}
          updateModalOpen={updateModalOpen}
          values={currentRow || {}}
        />
      )}

      <Show
        open={showDetail}
        currentRow={currentRow || ({} as API.ItemData)}
        columns={columns as ProDescriptionsItemProps<API.ItemData>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
      <SendMessageModal
        open={messageModalOpen}
        onClose={() => {
          setMessageModalOpen(false);
          setCurrentRow(undefined);
        }}
        currentRow={currentRow}
      />
    </PageContainer>
  );
};

export default TableList;

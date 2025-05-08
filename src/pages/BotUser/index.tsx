import { useIntl } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';

// import { Input } from 'antd';
import SendMessageModal from './components/SendMessageModal';
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: any) => {
  const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);

  try {
    await addItem('/bot-users', { ...fields });
    hide();
    message.success(<FormattedMessage id="add_successful" defaultMessage="Added successfully" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ?? (
        <FormattedMessage id="upload_failed" defaultMessage="Upload failed, please try again!" />
      ),
    );
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);
  try {
    await updateItem(`/bot-users/${fields._id}`, fields);
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

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (ids: string[]) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  if (!ids) return true;
  try {
    await removeItem('/bot-users', {
      ids,
    });
    hide();
    message.success(
      <FormattedMessage
        id="delete_successful"
        defaultMessage="Deleted successfully and will refresh soon"
      />,
    );
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error.response.data.message ?? (
        <FormattedMessage id="delete_failed" defaultMessage="Delete failed, please try again" />
      ),
    );
    return false;
  }
};

const handleSendMessage = async (botUserId: string, messageContent: string) => {
  const hide = message.loading({
    content: <FormattedMessage id="sending" defaultMessage="发送中..." />,
    key: 'sendMessage',
  });

  try {
    await addItem(`/bot-users/${botUserId}/send-message`, {
      message: messageContent, // 移除了多余的 botUserId
    });

    hide();
    message.success({
      content: <FormattedMessage id="send_successful" defaultMessage="发送成功" />,
      key: 'sendMessage',
    });
    return true;
  } catch (error: any) {
    hide();
    message.error({
      content: error?.response?.data?.message ?? (
        <FormattedMessage id="send_failed" defaultMessage="发送失败，请重试！" />
      ),
      key: 'sendMessage',
    });
    return false;
  }
};

const TableList: React.FC = () => {
  const intl = useIntl();
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**2024fc.xyz
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  // const [batchUploadPriceModalOpen, setBatchUploadPriceModalOpen] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRowsState, setSelectedRows] = useState<any[]>([]);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const access = useAccess();
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  // Define roles object with index signature

  const columns: ProColumns<any>[] = [
    {
      title: intl.formatMessage({ id: 'id' }),
      dataIndex: 'id',
      hideInSearch: true,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'user' }),
      dataIndex: ['user', 'name'],
      hideInSearch: true,
      copyable: true,
    },
    // frist_name
    {
      title: intl.formatMessage({ id: 'first_name_user_telegram' }),
      dataIndex: 'firstName',
      hideInSearch: false,
      copyable: true,
    },
    // last_name
    {
      title: intl.formatMessage({ id: 'last_name_user_telegram' }),
      dataIndex: 'lastName',
      hideInSearch: false,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'owner_bot' }),
      dataIndex: ['bot', 'botName'],
      hideInSearch: false,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'fee_rate' }),
      dataIndex: 'fee_rate',
      hideInSearch: false,
    },
    {
      title: intl.formatMessage({ id: 'exchange_rate' }),
      dataIndex: 'exchange_rate',
      hideInSearch: false,
    },
    {
      title: intl.formatMessage({ id: 'createdAt', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
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
          <FormattedMessage id="platforms.detail" defaultMessage="platforms.detail" />
        </a>,
        access.canDeleteBotUser && (
          <DeleteLink
            onOk={async () => {
              await handleRemove([record._id!]);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
        ),
        access.canUpdateBotUser && (
          <a
            key="sendMessage"
            onClick={() => {
              setCurrentRow(record);
              setMessageModalOpen(true);
            }}
          >
            <FormattedMessage id="send_message" defaultMessage="发送消息" />
          </a>
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<any, any>
        headerTitle={intl.formatMessage({ id: 'list' })}
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
        search={{
          labelWidth: 120,
          collapsed: false,
          span: {
            xs: 24, // 手机端占满
            sm: 24, // 平板端占满
            md: 6, // 电脑端
            lg: 6, // 大屏幕
            xl: 6, // 超大屏幕
            xxl: 6, // 超超大屏幕
          },
        }}
        toolBarRender={() => []}
        request={async (params, sort, filter) => queryList('/bot-users', params, sort, filter)}
        columns={columns}
        rowSelection={
          access.canSuperAdmin && {
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows);
            },
          }
        }
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
            </div>
          }
        >
          {(access.canSuperAdmin || access.canDeleteBotUser) && (
            <DeleteButton
              onOk={async () => {
                await handleRemove(selectedRowsState?.map((item: any) => item._id!));
                setSelectedRows([]);
                actionRef.current?.reloadAndRest?.();
              }}
            />
          )}
        </FooterToolbar>
      )}
      {(access.canSuperAdmin || access.canCreateBotUser) && (
        <Create
          open={createModalOpen}
          onOpenChange={handleModalOpen}
          onFinish={async (value) => {
            const success = await handleAdd({
              ...value,
            });
            if (success) {
              handleModalOpen(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
        />
      )}
      {(access.canSuperAdmin || access.canUpdateBotUser) && (
        <Update
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalOpen(false);
              setCurrentRow(undefined);
              if (actionRef.current) {
                actionRef.current.reload();
              }
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
      <Modal
        title={intl.formatMessage({ id: 'video_player', defaultMessage: '视频播放' })}
        open={videoModalOpen}
        onCancel={() => setVideoModalOpen(false)}
        footer={null}
        width={800}
      ></Modal>

      <SendMessageModal
        open={messageModalOpen}
        onClose={() => {
          setMessageModalOpen(false);
          setMessageText('');
        }}
        currentRow={currentRow}
        onSendMessage={handleSendMessage}
        messageText={messageText}
        setMessageText={setMessageText}
      />
    </PageContainer>
  );
};

export default TableList;

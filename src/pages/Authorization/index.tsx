import { useIntl, useModel } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { Button, message, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import ActionButton from '@/components/ActionButton';
import ConfigureForm from './components/ConfigureForm';
import CopyToClipboard from '@/components/CopyToClipboard';
import AddOwnerForm from './components/AddOwnerForm';
import DeleteOwnerForm from './components/DeleteOwnerForm';
import AddAuthorizerForm from './components/AddAuthorizerForm';
import DeleteAuthorizerForm from './components/DeleteAuthorizerForm';
import StringArrayWithActions from './components/StringArrayWithAction';
import GroupMessageForm from './components/GroupMessageForm';
import FreeKeyboardForm from './components/FreeKeyboardForm';
import SpeechStatisticsModal from './components/SpeechStatisticsModal';
import ChannelPostCreateForm from './components/ChannelPostCreateForm';
import GroupWelcomeForm from './components/GroupWelcomeForm';
import GroupVerifyForm from './components/GroupVerifyForm';
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: any) => {
  const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);

  try {
    await addItem('/bots', { ...fields });
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
    await updateItem(`/bots/${fields._id}`, fields);
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
    await removeItem('/bots', {
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

const TableList: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const { initialState, refresh } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRowsState, setSelectedRows] = useState<any[]>([]);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [configureModalVisible, setConfigureModalVisible] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | undefined>('');
  const [addOwnerModalVisible, setAddOwnerModalVisible] = useState<boolean>(false);
  const [deleteOwnerModalVisible, setDeleteOwnerModalVisible] = useState<boolean>(false);
  const [addAuthorizerModalVisible, setAddAuthorizerModalVisible] = useState<boolean>(false);
  const [deleteAuthorizerModalVisible, setDeleteAuthorizerModalVisible] = useState<boolean>(false);
  const [groupMessageModalOpen, setGroupMessageModalOpen] = useState<boolean>(false);
  const [keyboardModalOpen, setKeyboardModalOpen] = useState<boolean>(false);
  const [speechStatisticsModalOpen, setSpeechStatisticsModalOpen] = useState<boolean>(false);
  const [channelPostModalOpen, setChannelPostModalOpen] = useState<boolean>(false);
  const [groupWelcomeModalOpen, setGroupWelcomeModalOpen] = useState<boolean>(false);
  const [groupVerifyModalOpen, setGroupVerifyModalOpen] = useState<boolean>(false);

  const columns: ProColumns<any>[] = [
    {
      title: intl.formatMessage({ id: 'agent' }),
      dataIndex: 'agent',
      copyable: true,
      hideInTable: !currentUser?.isAdmin,
      hideInSearch: true,
      renderText: (_, record) => {
        return record?.user?.name;
      },
    },
    {
      title: intl.formatMessage({ id: 'ID', defaultMessage: 'ID' }),
      dataIndex: 'id',
      width: 120,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'owner_bot_display_name' }),
      dataIndex: 'botName',
      width: 150,
      fixed: 'left',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'owner_bot_identifier_name' }),
      dataIndex: 'userName',
      width: 150,
      render: (_, record) => {
        const link = `@${record.userName}`;
        if (record.userName) {
          return (
            <span>
              @{record.userName}
              <CopyToClipboard text={link} />
            </span>
          );
        }
      },
    },
    {
      title: intl.formatMessage({ id: 'user_count', defaultMessage: '用户数量' }),
      dataIndex: 'botUserConfigs',
      hideInSearch: true,
      renderText: (botUserConfigs) => {
        return botUserConfigs.length;
      },
    },
    {
      title: intl.formatMessage({ id: 'group', defaultMessage: '群组' }),
      dataIndex: 'groups',
      hideInSearch: true,
      renderText: (groups) => {
        return groups.length;
      },
    },
    // add owners
    {
      title: intl.formatMessage({ id: 'owners', defaultMessage: '拥有者' }),
      dataIndex: 'owners',
      hideInSearch: true,
      hideInTable: false,
      align: 'center',
      width: 150,
      render: (_, record) => (
        <StringArrayWithActions
          values={record.owners || []}
          onAdd={() => {
            setCurrentRow(record);
            setAddOwnerModalVisible(true);
          }}
          onDelete={() => {
            setCurrentRow(record);
            setDeleteOwnerModalVisible(true);
          }}
          labelAdd={intl.formatMessage({ id: 'add_owner' })}
          labelDelete={intl.formatMessage({ id: 'delete_owner' })}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'creator', defaultMessage: 'Creator' }),
      width: 120,
      dataIndex: 'creator',
      renderText: (text: any) => {
        return text?.botName || text?.userName;
      },
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'token', defaultMessage: 'Bot Token' }),
      dataIndex: 'token',
      valueType: 'password',
      hideInSearch: true,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'isOnline', defaultMessage: '是否在线' }),
      dataIndex: 'isOnline',
      width: 120,
      hideInSearch: true,
      valueEnum: {
        true: { text: intl.formatMessage({ id: 'platform.online' }), status: 'Success' },
        false: { text: intl.formatMessage({ id: 'platform.offline' }), status: 'Error' },
      },
      render: (_, record: any) => (
        <Switch
          checkedChildren={intl.formatMessage({ id: 'platform.online' })}
          unCheckedChildren={intl.formatMessage({ id: 'platform.offline' })}
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
      title: intl.formatMessage({ id: 'canBidirectional', defaultMessage: '双向通信' }),
      dataIndex: 'canBidirectional',
      hideInTable: !currentUser?.bidirectional,
      hideInSearch: true,
      render: (_, record: any) => (
        <Switch
          checked={record.canBidirectional}
          onChange={async () => {
            await handleUpdate({ _id: record._id, canBidirectional: !record.canBidirectional });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({
        id: 'canReportMemberNameUpdated',
        defaultMessage: '报道群成员名称变更',
      }),
      dataIndex: 'canReportMemberNameUpdated',
      hideInTable: !currentUser?.reportGroupMemberNameUpdated,
      hideInSearch: true,
      render: (_, record: any) => (
        <Switch
          checked={record.canReportMemberNameUpdated}
          onChange={async () => {
            await handleUpdate({
              _id: record._id,
              canReportMemberNameUpdated: !record.canReportMemberNameUpdated,
            });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    // 欢迎入群
    {
      title: intl.formatMessage({ id: 'welcomeGroup', defaultMessage: '欢迎入群' }),
      dataIndex: 'canGroupWelcome',
      hideInTable: !currentUser?.groupWelcome,
      hideInSearch: true,
      render: (_, record: any) => (
        <Switch
          checked={record.canGroupWelcome}
          onChange={async () => {
            await handleUpdate({ _id: record._id, canGroupWelcome: !record.canGroupWelcome });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'speechStatic', defaultMessage: '发言统计' }),
      dataIndex: 'canSpeechStatic',
      hideInTable: !currentUser?.speech_static,
      hideInSearch: true,
      render: (_, record: any) => (
        <Switch
          checked={record.canSpeechStatic}
          onChange={async () => {
            await handleUpdate({ _id: record._id, canSpeechStatic: !record.canSpeechStatic });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'keyboardConfig', defaultMessage: '键盘配置' }),
      dataIndex: 'canFreeKeyboard',
      hideInTable: !currentUser?.keyboardConfig,
      hideInSearch: true,
      render: (_, record: any) => (
        <Switch
          checked={record.canFreeKeyboard}
          onChange={async () => {
            await handleUpdate({ _id: record._id, canFreeKeyboard: !record.canFreeKeyboard });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'groupMessage', defaultMessage: '群发消息' }),
      dataIndex: 'canGroupMessaging',
      hideInTable: !currentUser?.groupMessage,
      hideInSearch: true,
      render: (_, record: any) => (
        <Switch
          checked={record.canGroupMessaging}
          onChange={async () => {
            await handleUpdate({ _id: record._id, canGroupMessaging: !record.canGroupMessaging });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'groupVerify', defaultMessage: '群组验证' }),
      dataIndex: 'canGroupVerify',
      hideInTable: !currentUser?.groupVerify,
      hideInSearch: true,
      render: (_, record: any) => (
        <Switch
          checked={record.canGroupVerify}
          onChange={async () => {
            await handleUpdate({ _id: record._id, canGroupVerify: !record.canGroupVerify });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'channelPost', defaultMessage: '频道推广' }),
      dataIndex: 'canOpenChannelPost',
      hideInTable: !currentUser?.channelPost,
      hideInSearch: true,
      render: (_, record: any) => (
        <Switch
          checked={record.canOpenChannelPost}
          onChange={async () => {
            await handleUpdate({ _id: record._id, canOpenChannelPost: !record.canOpenChannelPost });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'remark', defaultMessage: 'Remark' }),
      dataIndex: 'remark',
      hideInSearch: true,
      valueType: 'text',
      ellipsis: true,
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
      fixed: 'right',
      render: (_, record) => [
        access.canUpdateBot && (
          <ActionButton
            key="configure"
            type="configure"
            onClick={() => {
              setConfigureModalVisible(true);
              setCurrentRow(record);
            }}
          >
            {intl.formatMessage({
              id: 'configure',
              defaultMessage: 'Configure',
            })}
          </ActionButton>
        ),
        record.canGroupMessaging && currentUser?.groupMessage && (
          <ActionButton
            key="sendGroupMessage"
            type="sendGroupMessage"
            onClick={() => {
              setGroupMessageModalOpen(true);
              setCurrentRow(record);
            }}
          >
            {intl.formatMessage({
              id: 'sendGroupMessage',
              defaultMessage: 'Send Message',
            })}
          </ActionButton>
        ),
        record.canFreeKeyboard && currentUser?.keyboardConfig && (
          <ActionButton
            key="keyboardConfig"
            type="keyboard"
            onClick={() => {
              setCurrentRow(record);
              setKeyboardModalOpen(true);
            }}
          >
            {intl.formatMessage({
              id: 'keyboard_config',
              defaultMessage: '键盘配置',
            })}
          </ActionButton>
        ),
        record.canSpeechStatic && currentUser?.speech_static && (
          <ActionButton
            key="speechStatistics"
            type="statistics"
            onClick={() => {
              setCurrentRow(record);
              setSpeechStatisticsModalOpen(true);
            }}
          >
            {intl.formatMessage({
              id: 'speech_statistics',
              defaultMessage: '发言统计',
            })}
          </ActionButton>
        ),
        record.canOpenChannelPost && currentUser?.channelPost && (
          <ActionButton
            key="channelPost"
            type="channel"
            onClick={() => {
              setCurrentRow(record);
              setChannelPostModalOpen(true);
            }}
          >
            {intl.formatMessage({
              id: 'channel_post',
              defaultMessage: '频道推广',
            })}
          </ActionButton>
        ),
        record.canGroupWelcome && currentUser?.groupWelcome && (
          <ActionButton
            key="groupWelcome"
            type="group_welcome"
            onClick={() => {
              setCurrentRow(record);
              setGroupWelcomeModalOpen(true);
            }}
          >
            {intl.formatMessage({
              id: 'group_welcome',
              defaultMessage: '欢迎入群',
            })}
          </ActionButton>
        ),
        record.canGroupVerify && currentUser?.groupVerify && (
          <ActionButton
            key="groupVerify"
            type="group_verify"
            onClick={() => {
              setCurrentRow(record);
              setGroupVerifyModalOpen(true);
            }}
          >
            {intl.formatMessage({
              id: 'group_verify',
              defaultMessage: '群组验证',
            })}
          </ActionButton>
        ),
        <ActionButton
          key="detail"
          type="detail"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <FormattedMessage id="platforms.detail" defaultMessage="platforms.detail" />
        </ActionButton>,
        access.canUpdateBot && (
          <ActionButton
            key="edit"
            type="edit"
            onClick={() => {
              console.log();

              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            {intl.formatMessage({ id: 'edit' })}
          </ActionButton>
        ),
        access.canDeleteBot && (
          <DeleteLink
            onOk={async () => {
              await handleRemove([record._id!]);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
              // 刷新用户信息（更新 botCount）
              await refresh();
            }}
          />
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
          collapsed: false,
        }}
        toolBarRender={() => [
          (access.canSuperAdmin ||
            (access.canCreateBot &&
              (currentUser?.availableBotCount ?? 0) > (currentUser?.botCount ?? 0))) && (
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                handleModalOpen(true);
              }}
            >
              <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
            </Button>
          ),
        ]}
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
        request={async (params, sort, filter) => {
          // 将 activeKey 添加到请求参数中
          const response = await queryList(
            '/bots',
            {
              ...params,
              isOnline: activeKey, // 添加这个行
            },
            sort,
            filter,
          );
          return response;
        }}
        columns={columns}
        rowSelection={
          (access.canSuperAdmin || access.canCreateBot) && {
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
          {access.canDeleteBot && (
            <DeleteButton
              onOk={async () => {
                await handleRemove(selectedRowsState?.map((item: any) => item._id!));
                setSelectedRows([]);
                actionRef.current?.reloadAndRest?.();
                // 刷新用户信息（更新 botCount）
                await refresh();
              }}
            />
          )}
        </FooterToolbar>
      )}
      {access.canCreateBot && (
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
              // 刷新用户信息（更新 botCount）
              await refresh();
            }
          }}
        />
      )}
      {access.canUpdateBot && (
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
      <ConfigureForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            setConfigureModalVisible(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={setConfigureModalVisible}
        updateModalOpen={configureModalVisible}
        values={currentRow || {}}
      />
      <AddOwnerForm
        open={addOwnerModalVisible}
        onCancel={setAddOwnerModalVisible}
        values={currentRow || {}}
        onSuccess={() => {
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />
      <DeleteOwnerForm
        open={deleteOwnerModalVisible}
        onCancel={setDeleteOwnerModalVisible}
        values={currentRow || {}}
        onSuccess={() => {
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />
      <AddAuthorizerForm
        open={addAuthorizerModalVisible}
        onCancel={setAddAuthorizerModalVisible}
        values={currentRow || {}}
        onSuccess={() => {
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />
      <DeleteAuthorizerForm
        open={deleteAuthorizerModalVisible}
        onCancel={setDeleteAuthorizerModalVisible}
        values={currentRow || {}}
        onSuccess={() => {
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />

      <GroupMessageForm
        open={groupMessageModalOpen}
        onCancel={setGroupMessageModalOpen}
        currentRow={currentRow}
      />

      <FreeKeyboardForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            setKeyboardModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={setKeyboardModalOpen}
        updateModalOpen={keyboardModalOpen}
        values={currentRow || {}}
      />

      <SpeechStatisticsModal
        open={speechStatisticsModalOpen}
        onOpenChange={setSpeechStatisticsModalOpen}
        currentRow={currentRow}
        onSave={async (values) => {
          await handleUpdate(values);
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />

      <ChannelPostCreateForm
        open={channelPostModalOpen}
        onOpenChange={setChannelPostModalOpen}
        currentRow={currentRow}
        onSuccess={() => {
          setChannelPostModalOpen(false);
          message.success('频道推广添加成功');
        }}
      />

      <GroupWelcomeForm
        open={groupWelcomeModalOpen}
        onCancel={setGroupWelcomeModalOpen}
        currentRow={currentRow}
        onSuccess={() => {
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />

      <GroupVerifyForm
        open={groupVerifyModalOpen}
        onCancel={setGroupVerifyModalOpen}
        currentRow={currentRow}
        onSuccess={() => {
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />
    </PageContainer>
  );
};

export default TableList;

import { useIntl, useModel, history } from '@umijs/max';
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
import BotConfigManager from './components/BotConfigManager';

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
    const response: any = await updateItem(`/bots/${fields._id}`, fields);
    hide();

    message.success(<FormattedMessage id="update_successful" defaultMessage="Update successful" />);
    return response?.data || true;
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
  const actionRef = useRef<ActionType>();
  const { initialState, refresh } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRowsState, setSelectedRows] = useState<any[]>([]);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [configureModalVisible, setConfigureModalVisible] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | undefined>('');
  const [addOwnerModalVisible, setAddOwnerModalVisible] = useState<boolean>(false);
  const [deleteOwnerModalVisible, setDeleteOwnerModalVisible] = useState<boolean>(false);
  const [botConfigManagerOpen, setBotConfigManagerOpen] = useState<boolean>(false);

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
      title: '类型',
      dataIndex: 'type',
      hideInSearch: true,
      valueEnum: {
        public: { text: '公共', status: 'Success' },
        private: { text: '专属', status: 'Default' },
      },
    },
    {
      title: intl.formatMessage({ id: 'user_count', defaultMessage: '用户数量' }),
      dataIndex: 'botUserConfigsCount',
      hideInSearch: true,
      renderText: (botUserConfigsCount) => {
        return botUserConfigsCount || 0;
      },
    },
    {
      title: intl.formatMessage({ id: 'group', defaultMessage: '群组' }),
      dataIndex: 'groupsCount',
      hideInSearch: true,
      renderText: (groupsCount) => {
        return groupsCount || 0;
      },
    },
    // owner
    {
      title: intl.formatMessage({ id: 'owner', defaultMessage: 'Owner' }),
      dataIndex: 'owner',
      hideInSearch: true,
      hideInTable: false,
      align: 'center',
      width: 160,
      render: (_, record) => {
        const owner = record.owner;
        return (
          <span>
            {owner ? (
              <span style={{ marginRight: 4 }}>
                {owner.userName ? `@${owner.userName}` : owner.firstName || '-'}
              </span>
            ) : (
              <span style={{ color: '#ccc', marginRight: 4 }}>未设置</span>
            )}
            {access.canSuperAdmin && (
              <ActionButton
                key="setOwner"
                type="edit"
                onClick={() => {
                  setCurrentRow(record);
                  setAddOwnerModalVisible(true);
                }}
              >
                {intl.formatMessage({ id: 'set_owner', defaultMessage: '设置' })}
              </ActionButton>
            )}
            {owner && access.canSuperAdmin && (
              <ActionButton
                key="removeOwner"
                type="delete"
                onClick={() => {
                  setCurrentRow(record);
                  setDeleteOwnerModalVisible(true);
                }}
              >
                {intl.formatMessage({ id: 'remove', defaultMessage: '移除' })}
              </ActionButton>
            )}
          </span>
        );
      },
    },
    // {
    //   title: intl.formatMessage({ id: 'creator', defaultMessage: 'Creator' }),
    //   width: 120,
    //   dataIndex: 'creator',
    //   renderText: (text: any) => {
    //     return text?.botName || text?.userName;
    //   },
    //   hideInSearch: true,
    // },
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
        (access.canSuperAdmin || (access.canUpdateBot && record.type !== 'public')) && (
          <ActionButton
            key="configure"
            type="configure"
            onClick={() => {
              setConfigureModalVisible(true);
              setCurrentRow(record);
            }}
          >
            {intl.formatMessage({
              id: 'base_configure',
              defaultMessage: '基本配置',
            })}
          </ActionButton>
        ),

        <ActionButton
          key="botConfig"
          type="configure"
          onClick={() => {
            setCurrentRow(record);
            setBotConfigManagerOpen(true);
          }}
        >
          {intl.formatMessage({
            id: 'feature_config',
            defaultMessage: '功能配置',
          })}
        </ActionButton>,
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
        <ActionButton
          key="botDetail"
          type="detail"
          onClick={() => {
            history.push(`/bots/${record._id}`);
          }}
        >
          <FormattedMessage id="single_pannel" defaultMessage="single_pannel" />
        </ActionButton>,
        (access.canSuperAdmin || (access.canUpdateBot && record.type !== 'public')) && (
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
        (access.canSuperAdmin || (access.canDeleteBot && record.type !== 'public')) && (
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
          (access.canSuperAdmin || access.canCreateBot) && (
            <Button
              type="primary"
              key="primary"
              disabled={
                !access.canSuperAdmin &&
                (currentUser?.availableBotCount ?? 0) <= (currentUser?.botCount ?? 0)
              }
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
      <BotConfigManager
        open={botConfigManagerOpen}
        onCancel={setBotConfigManagerOpen}
        currentRow={currentRow}
        currentUser={currentUser}
        onBotUpdate={async (values) => {
          if (values?.groupWelcome !== null && values?.groupWelcome !== undefined && values?._id) {
            // 来自 group-welcome 等接口的完整 bot 数据，直接更新 currentRow
            setCurrentRow((prev: any) =>
              prev?._id === values._id ? { ...prev, ...values } : prev,
            );
          } else if (values?._id) {
            const updatedBot = await handleUpdate(values);
            if (updatedBot && typeof updatedBot === 'object') {
              setCurrentRow(updatedBot);
            }
          }
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />
    </PageContainer>
  );
};

export default TableList;

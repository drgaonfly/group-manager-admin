import { useIntl } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { Button, message, Modal, Switch, Form, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import ConfigureForm from './components/ConfigureForm';
import CopyToClipboard from '@/components/CopyToClipboard';
import GroupForm from './components/GroupForm';
import AddOwnerForm from './components/AddOwnerForm';
import DeleteOwnerForm from './components/DeleteOwnerForm';
import AddAuthorizerForm from './components/AddAuthorizerForm';
import DeleteAuthorizerForm from './components/DeleteAuthorizerForm';
// import StringArrayWithActions from './components/StringArrayWithAction';
import MessageForm from './components/MessageForm';
import GroupMessageForm from './components/GroupMessageForm';

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
  const [groupModalVisible, setGroupModalVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRowsState, setSelectedRows] = useState<any[]>([]);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const access = useAccess();
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [configureModalVisible, setConfigureModalVisible] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | undefined>('');
  const [addOwnerModalVisible, setAddOwnerModalVisible] = useState<boolean>(false);
  const [deleteOwnerModalVisible, setDeleteOwnerModalVisible] = useState<boolean>(false);
  const [addAuthorizerModalVisible, setAddAuthorizerModalVisible] = useState<boolean>(false);
  const [deleteAuthorizerModalVisible, setDeleteAuthorizerModalVisible] = useState<boolean>(false);
  const [messageModalOpen, setMessageModalOpen] = useState<boolean>(false);
  const [groupMessageModalOpen, setGroupMessageModalOpen] = useState<boolean>(false);
  const [privateKeyModalOpen, setPrivateKeyModalOpen] = useState<boolean>(false);
  const [privateKeyForm] = Form.useForm();

  // 保存Private Key的方法
  const handleSavePrivateKey = async () => {
    try {
      const values = await privateKeyForm.validateFields();
      const hide = message.loading(<FormattedMessage id="saving" defaultMessage="Saving..." />);

      try {
        await updateItem(`/bots/${currentRow?._id}`, {
          private_key: values.private_key,
        });

        hide();
        message.success(
          <FormattedMessage id="save_successful" defaultMessage="Saved successfully" />,
        );
        setPrivateKeyModalOpen(false);

        if (actionRef.current) {
          actionRef.current.reload();
        }
      } catch (error: any) {
        hide();
        message.error(
          error?.response?.data?.message ?? (
            <FormattedMessage id="save_failed" defaultMessage="Save failed, please try again" />
          ),
        );
      }
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const columns: ProColumns<any>[] = [
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
    // canBeCloned
    {
      title: intl.formatMessage({ id: 'is_canBeCloned' }),
      dataIndex: 'canBeCloned',
      width: 120,
      hideInSearch: true,
      render: (_, record: any) => (
        <Switch
          checked={record.canBeCloned}
          onChange={async () => {
            await handleUpdate({ _id: record._id, canBeCloned: !record.canBeCloned });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'clonedFrom', defaultMessage: '复制机器人' }),
      dataIndex: 'clonedFrom',
      width: 120,
      renderText: (text: any) => {
        return text?.botName || text?.userName;
      },
      hideInSearch: true,
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
    // intervalTime
    {
      title: intl.formatMessage({ id: 'intervalTime', defaultMessage: 'Interval Time' }),
      dataIndex: 'intervalTime',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'token', defaultMessage: 'Bot Token' }),
      dataIndex: 'token',
      width: 400,
      hideInSearch: true,
      copyable: true,
    },
    // groups
    {
      title: intl.formatMessage({ id: 'group', defaultMessage: '群组' }),
      dataIndex: 'groups',
      width: 120,
      hideInSearch: true,
      align: 'center',
      render: (_, record) => (
        <a
          key="group"
          onClick={() => {
            setCurrentRow(record);
            setGroupModalVisible(true);
          }}
        >
          {intl.formatMessage({ id: 'display' })}
        </a>
      ),
    },
    {
      title: intl.formatMessage({ id: 'BotStartMessage', defaultMessage: 'BotStartMessage' }),
      dataIndex: 'message',
      hideInSearch: true,
      hideInTable: true,
      valueType: 'text',
      ellipsis: true,
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
    // private_key
    // // 如果record.private_key不为空，则显示修改，如果为空，则添加
    // {
    //   title: intl.formatMessage({ id: 'private_key', defaultMessage: 'Private Key' }),
    //   dataIndex: 'private_key',
    //   hideInSearch: true,
    //   valueType: 'text',
    //   ellipsis: true,
    //   render: (_, record) => [
    //     <a
    //       key="editPrivateKey"
    //       onClick={() => {
    //         setCurrentRow(record);
    //         privateKeyForm.setFieldsValue({ private_key: record.private_key || '' });
    //         setPrivateKeyModalOpen(true);
    //       }}
    //     >
    //       {record.private_key
    //         ? intl.formatMessage({ id: 'modify', defaultMessage: '修改' })
    //         : intl.formatMessage({ id: 'add', defaultMessage: '添加' })}
    //     </a>,
    //   ],
    // },
    {
      title: intl.formatMessage({ id: 'createdAt', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      width: 150,
      hideInSearch: true,
      valueType: 'dateTime',
    },

    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      width: 300,
      render: (_, record) => [
        <a
          key="sendMessage"
          onClick={() => {
            setMessageModalOpen(true);
            setCurrentRow(record);
          }}
        >
          {intl.formatMessage({
            id: 'sendMessage',
            defaultMessage: intl.formatMessage({ id: 'sendMessage' }),
          })}
        </a>,
        <a
          key="sendGroupMessage"
          onClick={() => {
            setGroupMessageModalOpen(true);
            setCurrentRow(record);
          }}
        >
          {intl.formatMessage({
            id: 'sendGroupMessage',
            defaultMessage: intl.formatMessage({
              id: 'sendGroupMessage',
              defaultMessage: 'Group Message',
            }),
          })}
        </a>,
        access.canUpdateBot && (
          <a
            key="configure"
            onClick={() => {
              setConfigureModalVisible(true);
              setCurrentRow(record);
            }}
          >
            {intl.formatMessage({
              id: 'configure',
              defaultMessage: intl.formatMessage({ id: 'configure' }),
            })}
          </a>
        ),
        <a
          key="detail"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          <FormattedMessage id="platforms.detail" defaultMessage="platforms.detail" />
        </a>,
        access.canUpdateBot && (
          <a
            key="edit"
            onClick={() => {
              console.log();

              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            {intl.formatMessage({ id: 'edit' })}
          </a>
        ),
        access.canDeleteBot && (
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
      <ProTable<any, any>
        headerTitle={intl.formatMessage({ id: 'list' })}
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 2100 }}
        search={{
          collapsed: false,
        }}
        toolBarRender={() => [
          (access.canSuperAdmin || access.canCreateBot) && (
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
          {(access.canSuperAdmin || access.canDeleteBot) && (
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
      {(access.canSuperAdmin || access.canCreateBot) && (
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
      {(access.canSuperAdmin || access.canUpdateBot) && (
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
      <GroupForm
        open={groupModalVisible}
        onCancel={setGroupModalVisible}
        values={currentRow || {}}
      />
      <Modal
        title={intl.formatMessage({ id: 'video_player', defaultMessage: '视频播放' })}
        open={videoModalOpen}
        onCancel={() => setVideoModalOpen(false)}
        footer={null}
        width={800}
      ></Modal>
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
      <MessageForm open={messageModalOpen} onCancel={setMessageModalOpen} currentRow={currentRow} />
      <GroupMessageForm
        open={groupMessageModalOpen}
        onCancel={setGroupMessageModalOpen}
        currentRow={currentRow}
      />

      {/* Private Key 编辑 Modal */}
      <Modal
        title={
          currentRow?.private_key
            ? intl.formatMessage({ id: 'modify_private_key', defaultMessage: '修改私钥' })
            : intl.formatMessage({ id: 'add_private_key', defaultMessage: '添加私钥' })
        }
        open={privateKeyModalOpen}
        onOk={handleSavePrivateKey}
        onCancel={() => setPrivateKeyModalOpen(false)}
        destroyOnClose
      >
        <Form
          form={privateKeyForm}
          layout="vertical"
          initialValues={{ private_key: currentRow?.private_key || '' }}
        >
          <Form.Item
            name="private_key"
            label={intl.formatMessage({ id: 'private_key', defaultMessage: 'Private Key' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'please_input_private_key',
                  defaultMessage: 'Please input private key',
                }),
              },
            ]}
          >
            <Input.TextArea
              rows={6}
              placeholder={intl.formatMessage({
                id: 'please_input_private_key',
                defaultMessage: 'Please input private key',
              })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default TableList;

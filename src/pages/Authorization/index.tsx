import { useIntl } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { Button, message, Modal, Switch } from 'antd';
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
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  // Define roles object with index signature

  const columns: ProColumns<any>[] = [
    {
      title: intl.formatMessage({ id: 'ID', defaultMessage: 'ID' }),
      dataIndex: 'id',
      hideInSearch: true,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'owner_bot_display_name' }),
      dataIndex: 'botName',
      hideInSearch: false,
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'owner_bot_identifier_name' }),
      dataIndex: 'userName',
      hideInSearch: true,
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
      title: intl.formatMessage({ id: 'user', defaultMessage: '用户' }),
      dataIndex: ['user', 'name'],
      hideInSearch: false,
    },
    {
      title: intl.formatMessage({ id: 'token', defaultMessage: 'Bot Token' }),
      dataIndex: 'token',
      hideInSearch: true,
      copyable: true,
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
      render: (_, record) => [
        access.canCreateBot && (
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
        // 查看群组
        <a
          key="group"
          onClick={() => {
            setCurrentRow(record);
            setGroupModalVisible(true);
          }}
        >
          {intl.formatMessage({ id: 'group' })}
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<any, any>
        headerTitle={intl.formatMessage({ id: 'list' })}
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 2000 }}
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
    </PageContainer>
  );
};

export default TableList;

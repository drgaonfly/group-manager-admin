import { useIntl } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { Button, message, Switch } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import { Role } from '@/apiDataStructures/ApiDataStructure';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.ItemData) => {
  const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);

  try {
    await addItem('/members', { ...fields });
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
    await updateItem(`/members/${fields._id}`, fields);
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
    await removeItem('/members', {
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

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const [activeKey, setActiveKey] = useState<string | undefined>('');
  const access = useAccess();

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  // Define roles object with index signature

  const columns: ProColumns<API.ItemData>[] = [
    {
      // add id column
      title: intl.formatMessage({ id: 'id' }),
      dataIndex: 'id',
    },
    {
      title: intl.formatMessage({ id: 'channelId' }),
      dataIndex: 'wallets',
      key: 'wallets',
      render: (wallets) => {
        if (Array.isArray(wallets)) {
          return wallets.length > 0
            ? wallets.map((wallet) => (
                <div key={wallet.channel.id}>{wallet.channel.id}</div> // 每个地址占一行
              ))
            : null;
        }
        return null;
      },
    },
    {
      title: intl.formatMessage({ id: 'email' }),
      dataIndex: 'email',
      copyable: true,

      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'name' }),
      dataIndex: 'name',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'network' }),
      dataIndex: 'wallets',
      key: 'wallets',
      render: (wallets) => {
        if (Array.isArray(wallets)) {
          return wallets.length > 0
            ? wallets.map((wallet) => (
                <div key={wallet.network}>{wallet.network}</div> // 每个地址占一行
              ))
            : null;
        }
        return null;
      },
    },
    {
      title: intl.formatMessage({ id: 'walletAddress' }),
      dataIndex: 'wallets',
      key: 'wallets',
      render: (wallets) => {
        if (Array.isArray(wallets)) {
          return wallets.length > 0
            ? wallets.map((wallet) => (
                <div key={wallet.address}>{wallet.address}</div> // 每个地址占一行
              ))
            : null;
        }
        return null;
      },
    },
    {
      title: intl.formatMessage({ id: 'liquidRate' }), // 投资倍率
      dataIndex: 'liquidRate',
    },
    {
      title: intl.formatMessage({ id: 'stakeRate' }), // 投资倍率
      dataIndex: 'stakeRate',
    },
    {
      title: intl.formatMessage({ id: 'accountType' }),
      dataIndex: 'roles',
      hideInSearch: true,
      renderText: (_, record: any) => {
        return record.roles?.map((role: Role) => role.name)?.join(', ');
      },
    },
    {
      title: intl.formatMessage({ id: 'isSpied' }),
      dataIndex: 'isSpied',
      hideInSearch: true,
      render: (text) => (
        <span>{text ? intl.formatMessage({ id: 'yes' }) : intl.formatMessage({ id: 'no' })}</span>
      ),
    },
    {
      title: intl.formatMessage({ id: 'isAuthorized' }),
      dataIndex: 'isAuthorized',
      hideInSearch: true,
      render: (text) => (
        <span>{text ? intl.formatMessage({ id: 'yes' }) : intl.formatMessage({ id: 'no' })}</span>
      ),
    },
    {
      title: intl.formatMessage({ id: 'inviteCode' }),
      dataIndex: 'inviteCode',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'proxy.employee' }),
      dataIndex: ['proxy', 'name'],
    },
    {
      title: intl.formatMessage({ id: 'isOnline', defaultMessage: '是否在线' }),
      dataIndex: 'isOnline',
      hideInSearch: false,
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
    // add createAt
    {
      title: intl.formatMessage({ id: 'customerOverview' }),
      dataIndex: 'overview', // 只是占位符，不需要真正的数据库字段
      render: (_, record) => (
        <div>
          <div>
            <strong>{intl.formatMessage({ id: 'registeredAt' })} :</strong>{' '}
            {record.createdAt || '-'}
          </div>
          <div>
            <strong>{intl.formatMessage({ id: 'logedinAt' })} :</strong> {record.logedinAt || '-'}
          </div>
          <div>
            <strong>{intl.formatMessage({ id: 'registeredIP' })} :</strong>{' '}
            {record.createdIP || '-'}
          </div>
          <div>
            <strong>{intl.formatMessage({ id: 'LogedinIP' })} :</strong> {record.LogedinIP || '-'}
          </div>
        </div>
      ),
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
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
        access.canUpdateEmployee && (
          <a
            key="edit"
            onClick={() => {
              // Replace `handleUpdateModalOpen` and `setCurrentRow` with your actual functions
              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            {intl.formatMessage({ id: 'edit' })}
          </a>
        ),
        access.canDeleteEmployee && (
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
        headerTitle={intl.formatMessage({ id: 'list' })}
        actionRef={actionRef}
        scroll={{ x: 2500 }}
        rowKey="_id"
        search={{
          labelWidth: 120,
          collapsed: false,
        }}
        toolBarRender={() => [
          (access.canSuperAdmin || access.canCreateEmployee) && (
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
                label: <FormattedMessage id="platform.all" defaultMessage="all" />,
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
        request={async (params, sort, filter) =>
          queryList('/members', { ...params, isOnline: activeKey }, sort, filter)
        }
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
          {(access.canSuperAdmin || access.canDeleteEmployee) && (
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
      {(access.canSuperAdmin || access.canCreateEmployee) && (
        <Create
          open={createModalOpen}
          onOpenChange={handleModalOpen}
          onFinish={async (value) => {
            const success = await handleAdd(value as API.ItemData);
            if (success) {
              handleModalOpen(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
        />
      )}
      {(access.canSuperAdmin || access.canUpdateEmployee) && (
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
        currentRow={currentRow as API.ItemData}
        columns={columns as ProDescriptionsItemProps<API.ItemData>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default TableList;

import { useIntl } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import useQueryList from '@/hooks/useQueryList';
import { Switch } from 'antd';
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */

const handleAdd = async (fields: API.ItemData) => {
  const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);

  try {
    await addItem('/customers', { ...fields });
    hide();
    message.success(<FormattedMessage id="add_successful" defaultMessage="Added successfully" />);
    setTimeout(() => {
      window.location.reload(); // 直接刷新页面
    }, 3000); // 延时 2 秒（3000 毫秒）
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
    await updateItem(`/customers/${fields._id}`, fields);
    hide();

    message.success(<FormattedMessage id="update_successful" defaultMessage="Update successful" />);
    setTimeout(() => {
      window.location.reload(); // 直接刷新页面
    }, 3000); // 延时 2 秒（3000 毫秒）
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
    await removeItem('/customers', {
      ids,
    });
    hide();
    message.success(
      <FormattedMessage
        id="delete_successful"
        defaultMessage="Deleted successfully and will refresh soon"
      />,
    );
    setTimeout(() => {
      window.location.reload(); // 直接刷新页面
    }, 3000); // 延时 2 秒（3000 毫秒）
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

const processData = (users: any[]) => {
  return users.flatMap((user) => {
    // 如果用户没有钱包，则直接返回一个条目
    if (!user.wallets || user.wallets.length === 0) {
      return [{ ...user, wallet: null }];
    }

    // 如果有钱包，则为每个钱包创建一行数据
    return user.wallets.map((wallet: any) => ({
      ...user, // 保留用户的基本信息
      wallet, // 只保留当前钱包信息
    }));
  });
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
  // const [activeKey, setActiveKey] = useState<string | undefined>('');
  const access = useAccess();

  const { items: users, loading } = useQueryList('/customers');
  const [dataSource, setDataSource] = useState<any[]>([]);

  useEffect(() => {
    const flattenedData = processData(users);
    setDataSource(flattenedData);
  }, [users, loading]);

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
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'channelId' }),
      dataIndex: ['channel', 'id'],
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'network' }),
      dataIndex: 'network',
    },
    {
      title: intl.formatMessage({ id: 'walletAddress' }),
      dataIndex: 'address',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'estateOverview' }),
      hideInSearch: true,
      render: (_, record) => (
        <React.Fragment>
          <p>
            {intl.formatMessage({ id: 'liquidRate', defaultMessage: '流动倍率' })} :{' '}
            {record?.liquidRate}
          </p>
          <p>
            {intl.formatMessage({ id: 'stakeRate', defaultMessage: '质押倍率' })} :{' '}
            {record?.stakeRate}
          </p>
        </React.Fragment>
      ),
    },
    {
      title: intl.formatMessage({ id: 'estateOverview' }),
      hideInSearch: true,
      render: (_, record) => (
        <React.Fragment>
          <p>
            {intl.formatMessage({ id: 'usdtOfwallet' })} : {record?.usdtBalance}
          </p>
          <p>
            {intl.formatMessage({ id: 'usdtOfstake' })} : {record?.usdtStaking}
          </p>
          <p>
            {intl.formatMessage({ id: 'usdtOfplatform' })} : {record?.usdtPlatform}
          </p>
          <p>
            {intl.formatMessage({ id: 'ethOfplatform' })} : {record?.ethPlatform}
          </p>
        </React.Fragment>
      ),
    },
    {
      title: intl.formatMessage({ id: 'inviter', defaultMessage: '邀请人' }),
      dataIndex: ['inviter', 'email'],
      hideInSearch: true,
      render: (_, record) => {
        if (record.inviter) {
          return `${record.inviter.email}`;
        }
        return '-';
      },
    },
    {
      title: intl.formatMessage({ id: 'customerOverview' }),
      dataIndex: 'overview',
      render: (_, record) => (
        <div>
          <div>
            <strong>{intl.formatMessage({ id: 'registeredAt' })} :</strong>{' '}
            {record?.createdAt || '-'}
          </div>
          <div>
            <strong>{intl.formatMessage({ id: 'logedinAt' })} :</strong> {record?.logedinAt || '-'}
          </div>
          <div>
            <strong>{intl.formatMessage({ id: 'registeredIP' })} :</strong>
            {record?.registerIP}
          </div>
          <div>
            <strong>{intl.formatMessage({ id: 'LogedinIP' })} :</strong> {record?.loginIP}
          </div>
        </div>
      ),
    },
    {
      title: intl.formatMessage({ id: 'accountType' }),
      dataIndex: 'isVerified',
      hideInSearch: false,
      valueEnum: {
        true: { text: intl.formatMessage({ id: 'demoAccount' }), status: 'Success' },
        false: { text: intl.formatMessage({ id: 'customer' }), status: 'Error' },
      },
      render: (_, record: any) => (
        <Switch
          checkedChildren={intl.formatMessage({ id: 'demoAccount' })}
          unCheckedChildren={intl.formatMessage({ id: 'customer' })}
          checked={record.isVerified}
          onChange={async () => {
            await handleUpdate({ _id: record._id, isVerified: !record.isVerified });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'inviteCode' }),
      dataIndex: 'ownInviteCode',
      render: (ownInviteCode, record) => {
        if (!ownInviteCode) return '-';
        const fullUrl = `${process.env.UMI_APP_FRONTEND_URL}?${record.ownInviteCode}`;
        return <Typography.Text copyable>{fullUrl}</Typography.Text>;
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
      hideInSearch: false,
      valueEnum: {
        true: {
          text: intl.formatMessage({ id: 'isAuthorized.authorized', defaultMessage: '已授权' }),
          status: 'Success',
        },
        false: {
          text: intl.formatMessage({ id: 'isAuthorized.unauthorized', defaultMessage: '未授权' }),
          status: 'Error',
        },
      },
      render: (_, record: any) => (
        <Switch
          checkedChildren={intl.formatMessage({
            id: 'isAuthorized.authorized',
            defaultMessage: '已授权',
          })}
          unCheckedChildren={intl.formatMessage({
            id: 'isAuthorized.unauthorized',
            defaultMessage: '未授权',
          })}
          checked={record.isAuthorized}
          onChange={async () => {
            await handleUpdate({ _id: record._id, isAuthorized: !record.isAuthorized });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'proxy.employee' }),
      dataIndex: ['proxy', 'name'],
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
        access.canUpdateMember && (
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
        access.canDeleteMember && (
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
        scroll={{ x: 2300 }}
        rowKey="_id"
        search={{
          labelWidth: 120,
          collapsed: false,
        }}
        request={async (params, sort, filter) =>
          queryList('/customers', { ...params }, sort, filter)
        }
        columns={columns}
        dataSource={dataSource} // 设置处理后的数据
        loading-={loading}
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
          {(access.canSuperAdmin || access.canDeleteMember) && (
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
      {(access.canSuperAdmin || access.canCreateMember) && (
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
      {(access.canSuperAdmin || access.canUpdateMember) && (
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

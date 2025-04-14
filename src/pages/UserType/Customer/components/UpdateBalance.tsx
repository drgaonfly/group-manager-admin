import { updateItem } from '@/services/ant-design-pro/api';

// 导出直接更新USDT余额的函数
export const updateUsdtBalance = async (record: API.ItemData): Promise<boolean> => {
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

export default updateUsdtBalance;

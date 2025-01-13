import React, { useEffect, useState } from 'react';
import { queryList } from '@/services/ant-design-pro/api';
import { Card, message, Statistic } from 'antd';
import { useIntl } from '@umijs/max';

const TotalUsers: React.FC = () => {
  const [total, setTotal] = useState<number>(0);
  const intl = useIntl();

  // 获取用户总人数
  const fetchTotalUsers = async () => {
    try {
      const response = await queryList('/users', { current: 1, pageSize: 1 }); // 请求最小分页只获取 total
      if (response.success && response.total) {
        setTotal(response.total);
      } else {
        message.warning('未能获取用户总人数');
      }
    } catch (error) {
      message.error('获取用户总人数失败');
      console.error('Error fetching total users:', error);
    }
  };

  useEffect(() => {
    fetchTotalUsers();
  }, []);

  return (
    <Card className="mb-10 text-center">
      <Statistic
        title={intl.formatMessage({ id: 'totalUsers' })}
        value={total}
        precision={0} // 确保显示整数
        valueStyle={{ color: '#3f8600' }}
        suffix="人"
      />
    </Card>
  );
};

export default TotalUsers;

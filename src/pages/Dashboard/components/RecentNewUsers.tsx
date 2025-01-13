import React, { useEffect, useState } from 'react';
import { queryList } from '@/services/ant-design-pro/api';
import { Card, message, Statistic } from 'antd';
import { useIntl } from '@umijs/max';

interface ListItem {
  date: string;
  count: number;
}

const RecentRegistrations: React.FC<{ days: number }> = ({ days }) => {
  const [newRegistrations, setNewRegistrations] = useState<number>(0);
  const intl = useIntl();

  const fetchRecentRegistrations = async () => {
    try {
      const today = new Date();
      const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000) // 计算起始日期
        .toISOString()
        .split('T')[0];

      const response = (await queryList('/users?stats=true', {})) as {
        success: boolean;
        data: ListItem[];
      };

      console.log('Response:', response); // 调试用
      if (response.success && Array.isArray(response.data)) {
        const recentData = response.data.filter(
          (item: ListItem) =>
            item.date >= startDate && item.date <= today.toISOString().split('T')[0],
        );
        const totalCount = recentData.reduce((sum, item) => sum + item.count, 0); // 累计 count
        setNewRegistrations(totalCount);
      } else {
        message.warning(
          intl.formatMessage({
            id: 'recentRegistrationsWarning',
            defaultMessage: '未能获取新增用户数据',
          }),
        );
      }
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'recentRegistrationsError',
          defaultMessage: '获取新增用户数据失败',
        }),
      );
      console.error('Error fetching recent registrations:', error);
    }
  };

  useEffect(() => {
    fetchRecentRegistrations();
  }, [days]);

  return (
    <Card className="mb-10 text-center">
      <Statistic
        title={intl.formatMessage(
          { id: 'recentRegistrations', defaultMessage: '最近 {days} 天新增用户' },
          { days },
        )}
        value={newRegistrations}
        precision={0}
        valueStyle={{ color: '#3f8600' }}
        suffix={intl.formatMessage({ id: 'peopleSuffix', defaultMessage: '人' })}
      />
    </Card>
  );
};

export default RecentRegistrations;

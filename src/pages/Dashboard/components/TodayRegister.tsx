import React, { useEffect, useState } from 'react';
import { queryList } from '@/services/ant-design-pro/api';
import { Card, message, Statistic } from 'antd';
import { useIntl } from '@umijs/max';

interface ListItem {
  date: string;
  count: number;
}

const TodayRegister: React.FC = () => {
  const [todayRegister, settodayRegister] = useState<number>(0);
  const intl = useIntl();

  const fetchRegister = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // 获取今天日期
      const response = (await queryList('/users?stats=true', {})) as {
        success: boolean;
        data: ListItem[];
      };
      console.log('Response:', response); // 调试用
      if (response.success && Array.isArray(response.data)) {
        const todayData = response.data.find((item) => item.date === today);
        if (todayData) {
          settodayRegister(todayData.count); // 使用 count 属性
        } else {
          settodayRegister(0); // 没有数据时设置为 0
        }
      } else {
        message.warning(
          intl.formatMessage({
            id: 'todayRegisterFetchWarning',
            defaultMessage: '未能获取今日注册人数',
          }),
        );
      }
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'todayRegisterFetchError',
          defaultMessage: '获取今日注册人数失败',
        }),
      );
      console.error('Error fetching today register users:', error);
    }
  };

  useEffect(() => {
    fetchRegister();
  }, []);

  return (
    <Card className="mb-10 text-center ">
      <Statistic
        title={intl.formatMessage({ id: 'todayRegister', defaultMessage: '今日注册人数' })}
        value={todayRegister}
        precision={0}
        valueStyle={{ color: '#3f8600' }}
        suffix={intl.formatMessage({ id: 'peopleSuffix', defaultMessage: '人' })}
      />
    </Card>
  );
};

export default TodayRegister;

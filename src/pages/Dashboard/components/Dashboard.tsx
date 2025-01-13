import React, { useEffect, useState } from 'react';
import { Line } from '@ant-design/charts';
import { queryList } from '@/services/ant-design-pro/api';
import { message, Card } from 'antd';

interface RegistrationStat {
  date: string;
  count: number;
}

const RegistrationStatsChart: React.FC = () => {
  const [data, setData] = useState<RegistrationStat[]>([]);

  const fetchRegistrationStats = async () => {
    try {
      const response = await queryList('/users?stats=true', {});
      if (response.success && Array.isArray(response.data)) {
        const formattedData = response.data
          .filter((item: any) => item.date && item.count !== null) // 过滤掉 null 值
          .map((item: any) => ({
            date: item.date,
            count: item.count || 0, // 默认值处理
          }));
        setData(formattedData);
      } else {
        message.warning('未能获取注册统计数据');
      }
    } catch (error) {
      message.error('获取注册统计数据失败');
      console.error('Error fetching registration stats:', error);
    }
  };

  useEffect(() => {
    fetchRegistrationStats();
  }, []);

  const config = {
    data,
    xField: 'date',
    yField: 'count',
    point: {
      size: 5,
      shape: 'diamond',
    },
    yAxis: {
      title: { text: '注册人数' },
      tickCount: 5,
      min: 0,
    },
    tooltip: {
      showMarkers: true,
      title: (datum: any) => `日期: ${datum.date || '未知日期'}`, // 确保显示有效日期
      formatter: (datum: any) => {
        const value = typeof datum.count === 'number' ? datum.count : '无数据'; // 处理无效值
        return {
          name: '注册人数',
          value,
        };
      },
    },
    interactions: [{ type: 'element-active' }],
  };

  return (
    <Card>
      <Line {...config} />
    </Card>
  );
};

export default RegistrationStatsChart;

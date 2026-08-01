import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Badge, Card, Col, Row, Statistic, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

const { Text } = Typography;

interface HealthData {
  redis: 'ok' | 'error';
  queues: {
    high: number;
    normal: number;
    low: number;
  };
}

const QueueHealth: React.FC = () => {
  const [data, setData] = useState<HealthData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchHealth = async () => {
    try {
      const result = await request<HealthData>('/queue-health', { method: 'GET' });
      setData(result);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setData({ redis: 'error', queues: { high: -1, normal: -1, low: -1 } });
    }
  };

  useEffect(() => {
    fetchHealth();
    const timer = setInterval(fetchHealth, 5000); // 每 5 秒自动刷新
    return () => clearInterval(timer);
  }, []);

  const redisOk = data?.redis === 'ok';

  return (
    <PageContainer
      ghost
      header={{
        title: 'Webhook 队列状态',
        subTitle: lastUpdated ? `最后更新: ${lastUpdated}` : '加载中...',
      }}
    >
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Redis 状态"
              value={redisOk ? '正常' : '异常'}
              valueStyle={{ color: redisOk ? '#3f8600' : '#cf1322' }}
              prefix={<Badge status={redisOk ? 'success' : 'error'} style={{ marginRight: 4 }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="高优先级（私聊消息）"
              value={data?.queues.high ?? '-'}
              valueStyle={{
                color: (data?.queues.high ?? 0) > 10 ? '#cf1322' : '#3f8600',
              }}
              suffix="条"
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              priority = 1
            </Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="普通优先级（其他消息）"
              value={data?.queues.normal ?? '-'}
              valueStyle={{
                color: (data?.queues.normal ?? 0) > 100 ? '#faad14' : '#3f8600',
              }}
              suffix="条"
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              priority = 5
            </Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="低优先级（入群消息）"
              value={data?.queues.low ?? '-'}
              valueStyle={{
                color:
                  (data?.queues.low ?? 0) > 1000
                    ? '#cf1322'
                    : (data?.queues.low ?? 0) > 100
                    ? '#faad14'
                    : '#3f8600',
              }}
              suffix="条"
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              priority = 10，超过 1000 条时告警
            </Text>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default QueueHealth;

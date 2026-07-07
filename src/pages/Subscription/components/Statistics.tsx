import { useIntl } from '@umijs/max';
import { DatePicker, Card, Row, Col, Statistic } from 'antd';
import React, { useMemo } from 'react';
import dayjs from 'dayjs';

interface StatisticsProps {
  data: any[];
  selectedMonth: dayjs.Dayjs;
  onMonthChange: (date: dayjs.Dayjs | null) => void;
}

const Statistics: React.FC<StatisticsProps> = ({ data, selectedMonth, onMonthChange }) => {
  const intl = useIntl();

  // 计算当前月的关键指标
  const currentMetrics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        currentMonthRevenue: 0,
        lastMonthRevenue: 0,
        currentMonthUsers: 0,
        lastMonthUsers: 0,
        renewalUsers: 0,
        newUsers: 0,
      };
    }

    const monthStart = selectedMonth.startOf('month');
    const monthEnd = selectedMonth.endOf('month');
    const lastMonthStart = selectedMonth.subtract(1, 'month').startOf('month');
    const lastMonthEnd = selectedMonth.subtract(1, 'month').endOf('month');

    const currentMonthRevenue = data
      .filter((item: any) => {
        if (item.status !== 'paid') return false;
        if (!item.paidAt) return false;
        const paidDate = dayjs(item.paidAt);
        return paidDate.isAfter(monthStart) && paidDate.isBefore(monthEnd);
      })
      .reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

    const lastMonthRevenue = data
      .filter((item: any) => {
        if (item.status !== 'paid') return false;
        if (!item.paidAt) return false;
        const paidDate = dayjs(item.paidAt);
        return paidDate.isAfter(lastMonthStart) && paidDate.isBefore(lastMonthEnd);
      })
      .reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

    const currentMonthUsers = new Set(
      data
        .filter((item: any) => {
          if (item.status !== 'paid') return false;
          if (!item.paidAt) return false;
          const paidDate = dayjs(item.paidAt);
          return paidDate.isAfter(monthStart) && paidDate.isBefore(monthEnd);
        })
        .map((item: any) => item.botUser?._id),
    );

    const lastMonthUsers = new Set(
      data
        .filter((item: any) => {
          if (item.status !== 'paid') return false;
          if (!item.paidAt) return false;
          const paidDate = dayjs(item.paidAt);
          return paidDate.isAfter(lastMonthStart) && paidDate.isBefore(lastMonthEnd);
        })
        .map((item: any) => item.botUser?._id),
    );

    const renewalUsers = [...currentMonthUsers].filter((userId) => lastMonthUsers.has(userId));
    const newUsers = [...currentMonthUsers].filter((userId) => !lastMonthUsers.has(userId));

    return {
      currentMonthRevenue,
      lastMonthRevenue,
      currentMonthUsers: currentMonthUsers.size,
      lastMonthUsers: lastMonthUsers.size,
      renewalUsers: renewalUsers.length,
      newUsers: newUsers.length,
    };
  }, [data, selectedMonth]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 500 }}>
          {intl.formatMessage({ id: 'data_statistics', defaultMessage: '数据统计' })}
        </span>
        <DatePicker.MonthPicker
          value={selectedMonth}
          onChange={(date) => {
            onMonthChange(date || dayjs());
          }}
          style={{ width: 200 }}
        />
      </div>
      <Row gutter={16}>
        <Col span={12}>
          <Card title={intl.formatMessage({ id: 'revenue_analysis', defaultMessage: '收入分析' })}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title={intl.formatMessage({
                    id: 'current_month_revenue',
                    defaultMessage: '本月收入',
                  })}
                  value={currentMetrics.currentMonthRevenue}
                  suffix="USDT"
                  precision={2}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={intl.formatMessage({
                    id: 'last_month_revenue',
                    defaultMessage: '上月收入',
                  })}
                  value={currentMetrics.lastMonthRevenue}
                  suffix="USDT"
                  precision={2}
                />
              </Col>
            </Row>
            <div
              style={{
                marginTop: 16,
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
              }}
            >
              <div style={{ fontSize: '14px', color: '#666', marginBottom: 8 }}>
                {intl.formatMessage({ id: 'revenue_growth_rate', defaultMessage: '收入增长率' })}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 500,
                  color:
                    currentMetrics.lastMonthRevenue > 0
                      ? currentMetrics.currentMonthRevenue >= currentMetrics.lastMonthRevenue
                        ? '#10b981'
                        : '#ef4444'
                      : '#666',
                }}
              >
                {currentMetrics.lastMonthRevenue > 0
                  ? currentMetrics.currentMonthRevenue >= currentMetrics.lastMonthRevenue
                    ? '+'
                    : '-'
                  : ''}
                {currentMetrics.lastMonthRevenue > 0
                  ? Math.abs(
                      ((currentMetrics.currentMonthRevenue - currentMetrics.lastMonthRevenue) /
                        currentMetrics.lastMonthRevenue) *
                        100,
                    ).toFixed(1)
                  : '0.0'}
                %
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title={intl.formatMessage({ id: 'user_analysis', defaultMessage: '用户分析' })}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title={intl.formatMessage({
                    id: 'current_month_users',
                    defaultMessage: '本月用户',
                  })}
                  value={currentMetrics.currentMonthUsers}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={intl.formatMessage({ id: 'last_month_users', defaultMessage: '上月用户' })}
                  value={currentMetrics.lastMonthUsers}
                />
              </Col>
            </Row>
            <div
              style={{
                marginTop: 16,
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
              }}
            >
              <div style={{ fontSize: '14px', color: '#666', marginBottom: 8 }}>
                {intl.formatMessage({ id: 'user_growth_rate', defaultMessage: '用户增长率' })}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 500,
                  color:
                    currentMetrics.lastMonthUsers > 0
                      ? currentMetrics.currentMonthUsers >= currentMetrics.lastMonthUsers
                        ? '#10b981'
                        : '#ef4444'
                      : '#666',
                }}
              >
                {currentMetrics.lastMonthUsers > 0
                  ? currentMetrics.currentMonthUsers >= currentMetrics.lastMonthUsers
                    ? '+'
                    : '-'
                  : ''}
                {currentMetrics.lastMonthUsers > 0
                  ? Math.abs(
                      ((currentMetrics.currentMonthUsers - currentMetrics.lastMonthUsers) /
                        currentMetrics.lastMonthUsers) *
                        100,
                    ).toFixed(1)
                  : '0.0'}
                %
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title={intl.formatMessage({ id: 'renewal_users', defaultMessage: '续费用户' })}
              value={currentMetrics.renewalUsers}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
              {intl.formatMessage({
                id: 'renewal_users_desc',
                defaultMessage: '上月和本月都有付费',
              })}
            </div>
            <div style={{ fontSize: '12px', color: '#1890ff', marginTop: 4 }}>
              {intl.formatMessage({ id: 'renewal_rate', defaultMessage: '续费率' })}:{' '}
              {currentMetrics.lastMonthUsers > 0
                ? ((currentMetrics.renewalUsers / currentMetrics.lastMonthUsers) * 100).toFixed(1)
                : '0.0'}
              %
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={intl.formatMessage({ id: 'new_users', defaultMessage: '新用户' })}
              value={currentMetrics.newUsers}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
              {intl.formatMessage({ id: 'new_users_desc', defaultMessage: '本月首次付费用户' })}
            </div>
            <div style={{ fontSize: '12px', color: '#52c41a', marginTop: 4 }}>
              {intl.formatMessage({ id: 'new_user_rate', defaultMessage: '新用户占比' })}:{' '}
              {currentMetrics.currentMonthUsers > 0
                ? ((currentMetrics.newUsers / currentMetrics.currentMonthUsers) * 100).toFixed(1)
                : '0.0'}
              %
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={intl.formatMessage({ id: 'non_renewal_users', defaultMessage: '未续费用户' })}
              value={currentMetrics.lastMonthUsers - currentMetrics.renewalUsers}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
              {intl.formatMessage({
                id: 'non_renewal_users_desc',
                defaultMessage: '上月有付费但本月没有',
              })}
            </div>
            <div style={{ fontSize: '12px', color: '#ff4d4f', marginTop: 4 }}>
              {intl.formatMessage({ id: 'churn_rate', defaultMessage: '流失率' })}:{' '}
              {currentMetrics.lastMonthUsers > 0
                ? (
                    ((currentMetrics.lastMonthUsers - currentMetrics.renewalUsers) /
                      currentMetrics.lastMonthUsers) *
                    100
                  ).toFixed(1)
                : '0.0'}
              %
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;

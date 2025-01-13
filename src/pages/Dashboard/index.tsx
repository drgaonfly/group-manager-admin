import React from 'react';
import RegistrationStatsChart from './components/Dashboard';
import { PageContainer } from '@ant-design/pro-components';
import TotalUsers from './components/TotalUser';
import TodayLogin from './components/TodayLogin';
import { Row, Col } from 'antd';
import RecentRegistrations from './components/RecentNewUsers';

const Dashboard: React.FC = () => {
  return (
    <PageContainer>
      <Row gutter={[16, 16]} className="mb-6 display-flex">
        <Col flex={1}>
          <TotalUsers />
        </Col>
        <Col flex={1}>
          <TodayLogin />
        </Col>
        <Col flex={1}>
          <RecentRegistrations days={7} /> {/* 最近 7 天新增 */}
        </Col>
        <Col flex={1}>
          <RecentRegistrations days={30} /> {/* 最近 30 天新增 */}
        </Col>
      </Row>
      <RegistrationStatsChart />
    </PageContainer>
  );
};

export default Dashboard;

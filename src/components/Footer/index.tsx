import {
  PlayCircleOutlined,
  QuestionCircleOutlined,
  TrophyOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <>
      <DefaultFooter
        copyright={process.env.UMI_APP_APP_NAME || 'antd-ts-admin'}
        style={{
          background: 'none',
        }}
      />
      {/* 移动端底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="grid grid-cols-4 py-2">
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => history.push('/usage-instructions')}
          >
            <QuestionCircleOutlined className="text-xl" />
            <span className="text-xs mt-1">使用说明</span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => history.push('/newbie-training')}
          >
            <PlayCircleOutlined className="text-xl" />
            <span className="text-xs mt-1">接单</span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => history.push('/examination-rooms')}
          >
            <TrophyOutlined className="text-xl" />
            <span className="text-xs mt-1">考场</span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => history.push('/withdraws')}
          >
            <WalletOutlined className="text-xl" />
            <span className="text-xs mt-1">提现</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;

import React, { useEffect } from 'react';
import { Button, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface BeginProps {
  onStart: () => void;
}

const Begin: React.FC<BeginProps> = ({ onStart }) => {
  useEffect(() => {
    Modal.confirm({
      title: '查询到历史记录，是否继续？',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      okText: '确定',
      cancelText: '取消',
      onOk: onStart,
    });
  }, []);

  const handleStart = () => {
    onStart();
  };

  const handleOverview = () => {
    message.info('暂无训练内容');
  };

  return (
    <>
      <div className="mb-4 text-xl font-medium pl-4 pr-8 py-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="text-xl font-medium font-bold">新手训练</div>
          <div className="flex items-center gap-2">
            <Button className="text-sm rounded-md px-2 py-1" onClick={handleOverview}>
              答题概况
            </Button>
          </div>
        </div>
      </div>
      <div
        className="flex flex-col items-center justify-center bg-white"
        style={{ minHeight: 'calc(40vh - 120px)' }}
      >
        <div className="text-center p-20">
          <ExclamationCircleOutlined
            style={{
              fontSize: '48px',
              color: '#1890ff',
              marginBottom: '24px',
            }}
          />
          <h2 className="text-xl mb-4">通过新手训练，方可开始接单</h2>
          <Button type="primary" size="large" onClick={handleStart}>
            开始
          </Button>
        </div>
      </div>
    </>
  );
};

export default Begin;

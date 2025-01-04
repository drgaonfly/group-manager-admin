import React, { useEffect, useState } from 'react';
import { Button, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface BeginProps {
  onStart: (resetProgress?: boolean) => void;
}

const Begin: React.FC<BeginProps> = ({ onStart }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Modal.confirm({
      title: '查询到历史记录，是否继续？',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      okText: '继续训练',
      cancelText: '取消',
      onOk: () => onStart(false),
      onCancel: () => {
        return Promise.resolve();
      },
    });
  }, []);

  const handleStart = async () => {
    if (loading) return; // 如果正在加载，直接返回

    setLoading(true);
    try {
      await onStart(true);
    } catch (error) {
      message.error('开始训练失败，请重试');
    } finally {
      setLoading(false);
    }
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
          <Button
            type="primary"
            size="large"
            onClick={handleStart}
            loading={loading}
            disabled={loading}
          >
            {loading ? '开始训练...' : '开始训练'}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Begin;

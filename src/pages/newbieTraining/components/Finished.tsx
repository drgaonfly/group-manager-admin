import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';

interface FinishedProps {
  onRestart?: () => void;
  allTopics: Array<{
    topic: { id: string };
    status: string;
  }>;
}

const Finished: React.FC<FinishedProps> = ({ onRestart, allTopics }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <>
      <div className="mb-4 text-xl font-medium pl-4 pr-8 py-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="text-xl font-medium font-bold">新手训练</div>
          <div className="flex items-center gap-2">
            <Button
              className="text-sm rounded-md px-2 py-1"
              onClick={() => setIsModalVisible(true)}
            >
              答题概况
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-white">
        <div className="flex flex-col items-center justify-center">
          <div className="bg-white md:p-20 p-10 rounded-lg shadow-sm flex flex-col items-center">
            <CheckCircleOutlined style={{ fontSize: '96px', color: '#52c41a' }} />
            <h2 className="md:mt-10 mt-4 text-2xl font-medium">您已完成新手训练，可以开始接单</h2>
            <div className="flex mt-10 space-x-20">
              <Button
                type="primary"
                size="large"
                onClick={() => history.push('/examination-rooms')}
              >
                前往接单
              </Button>
              {onRestart && (
                <Button size="large" onClick={onRestart}>
                  重新训练
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 答题概况 Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
            <span>答题概况</span>
          </div>
        }
        open={isModalVisible}
        closable={false}
        footer={
          <Button type="primary" onClick={() => setIsModalVisible(false)}>
            知道了
          </Button>
        }
        width={800}
      >
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {allTopics.map((item, index) => (
              <div key={index} className="flex items-center gap-1 text-xs">
                <span
                  style={{
                    color:
                      item.status === 'success'
                        ? '#6ec283'
                        : item.status === 'fail'
                        ? 'red'
                        : item.status === 'doing'
                        ? '#1890ff'
                        : 'gray',
                  }}
                >
                  ●
                </span>
                <span className="text-gray-600 hover:text-blue-500 cursor-pointer truncate">
                  {item.topic.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Finished;

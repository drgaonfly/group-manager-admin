import React from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const Overlay: React.FC = () => {
  return (
    <>
      <div className="md:m-8 m-0 mb-4 text-xl font-medium pl-4 pr-8 py-2 bg-white md:mb-8 md:text-2xl md:pl-8 md:pr-16 md:py-8">
        <div className="flex items-center justify-between">
          <div className="text-xl font-medium font-bold md:text-2xl py-3">考场</div>
          <div className="flex items-center gap-2"></div>
        </div>
      </div>
      <div className="md:m-8 m-0 bg-white">
        <div className="flex flex-col items-center justify-center">
          <div className="flex text-center bg-white pt-6 rounded-lg shadow-sm flex flex-col items-center md:pt-10">
            <ExclamationCircleOutlined
              style={{ fontSize: '96px', color: '#d43535', marginBottom: '20px' }}
            />
            <h1 className="pt-10 text-2xl font-medium">你没有通过测试，不可接单</h1>
            <h2 className="mt-8 text-xl font-medium md:mt-12">请完成测试后再尝试接单</h2>
            <div className="mt-10 space-x-20"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Overlay;

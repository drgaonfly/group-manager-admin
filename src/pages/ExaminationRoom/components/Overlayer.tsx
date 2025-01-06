import React from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { FormattedMessage } from '@umijs/max';

const Overlay: React.FC = () => {
  return (
    <div style={{ 
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#fff'
    }}>
      <ExclamationCircleOutlined
        style={{
          fontSize: '64px',
          color: '#faad14',
          marginBottom: '32px',
        }}
      />
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
        <FormattedMessage 
          id="pages.examination.notPassed" 
          defaultMessage="你没有通过测试，不可接单" 
        />
      </h2>
      <p style={{ fontSize: '18px', marginBottom: '20px' }}>
        <FormattedMessage 
          id="pages.examination.pleaseComplete" 
          defaultMessage="请完成测试后再尝试接单。" 
        />
      </p>
    </div>
  );
};

export default Overlay;
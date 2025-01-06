import { PageContainer } from '@ant-design/pro-components';
// import { useModel } from '@umijs/max';
import { Card } from 'antd';
import React, { useEffect, useState } from 'react';
import { queryList } from '@/services/ant-design-pro/api';

/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */

const Welcome: React.FC = () => {
  const [instructions, setInstructions] = useState<API.ItemData[]>([]);

  useEffect(() => {
    const fetchInstructions = async () => {
      const response = await queryList('/instructions', { current: 1, pageSize: 10 });

      if (response.data) {
        setInstructions(response.data);
      }
    };

    fetchInstructions();
  }, []);

  return (
    <PageContainer ghost>
      <Card bordered={false}>
        <ul className="m-0 p-0 list-none">
          {instructions.map((instruction) => (
            <li key={instruction._id}>
              <h3>{instruction.title}</h3>
              <div dangerouslySetInnerHTML={{ __html: instruction.content }} />
            </li>
          ))}
        </ul>
      </Card>
    </PageContainer>
  );
};

export default Welcome;

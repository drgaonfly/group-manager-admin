import { PageContainer } from '@ant-design/pro-components';
// import { useModel } from '@umijs/max';
import { Card } from 'antd';
import React, { useEffect, useState } from 'react';
/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */

const Welcome: React.FC = () => {
  const [instructions] = useState<API.ItemData[]>([]);

  useEffect(() => {
    const fetchInstructions = async () => {};

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

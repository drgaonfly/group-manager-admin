import React from 'react';
import { message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

interface Props {
  text: string;
}
const CopyToClipboard: React.FC<Props> = (props) => {
  const { text } = props;
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('文本已复制到剪贴板');
    } catch (err) {
      message.error('复制失败');
    }
  };

  return <CopyOutlined onClick={copyText} />;
};

export default CopyToClipboard;

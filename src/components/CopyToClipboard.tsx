import React from 'react';
import { Tooltip, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';

interface Props {
  text: any;
}
const CopyToClipboard: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { text } = props;
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(
        intl.formatMessage({ id: 'copy.success', defaultMessage: 'Text copied to clipboard' }),
      );
    } catch (err) {
      message.error(intl.formatMessage({ id: 'copy.error', defaultMessage: 'Copy failed' }));
    }
  };

  return (
    <Tooltip
      title={intl.formatMessage({ id: 'copy.tooltip', defaultMessage: 'Copy data to clipboard' })}
    >
      <CopyOutlined style={{ color: '#1890ff' }} onClick={copyText} />
    </Tooltip>
  );
};

export default CopyToClipboard;

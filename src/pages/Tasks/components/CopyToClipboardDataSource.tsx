import React from 'react';
import { Tooltip, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';

interface DataSourceType {
  storeName: string;
  orderNumber: string;
  amount: number;
  // ... other properties
}

interface Props {
  dataSource: any;
}

const CopyToClipboardDataSource: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { dataSource } = props;

  const copyText = async () => {
    const headers = ['店铺名称', '订单号', '金额'];
    const data = dataSource.map((item: DataSourceType) => [
      item.storeName,
      item.orderNumber,
      item.amount,
    ]);
    const text = [headers, ...data].map((row) => row.join('\t')).join('\n');
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

export default CopyToClipboardDataSource;

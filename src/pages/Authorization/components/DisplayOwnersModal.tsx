import React from 'react';
import { useIntl } from '@umijs/max';
import { Modal, List, Typography } from 'antd';
import { FormattedMessage } from '@umijs/max';

interface DisplayOwnersModalProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  values: any;
}

const DisplayOwnersModal: React.FC<DisplayOwnersModalProps> = (props) => {
  const { open, onCancel, values } = props;
  const intl = useIntl();

  // 确保owners是一个数组
  const owners = Array.isArray(values?.owners) ? values.owners : [];

  return (
    <Modal
      title={intl.formatMessage({ id: 'display_owner', defaultMessage: 'Bot Owners' })}
      open={open}
      onCancel={() => onCancel(false)}
      footer={null}
      width={500}
    >
      {owners.length > 0 ? (
        <List
          bordered
          dataSource={owners}
          renderItem={(item: any) => (
            <List.Item>
              <Typography.Text copyable>{item}</Typography.Text>
            </List.Item>
          )}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <FormattedMessage id="no_owners" defaultMessage="No owners found" />
        </div>
      )}
    </Modal>
  );
};

export default DisplayOwnersModal;

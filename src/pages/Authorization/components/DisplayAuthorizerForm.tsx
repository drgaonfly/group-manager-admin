import React from 'react';
import { useIntl } from '@umijs/max';
import { Modal, List, Typography } from 'antd';
import { FormattedMessage } from '@umijs/max';

interface DisplayAuthorizerFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  values: any;
}

const DisplayAuthorizerForm: React.FC<DisplayAuthorizerFormProps> = (props) => {
  const { open, onCancel, values } = props;
  const intl = useIntl();

  // 确保authorized_users是一个数组
  const authorizers = Array.isArray(values?.authorized_users) ? values.authorized_users : [];

  return (
    <Modal
      title={intl.formatMessage({ id: 'display_authorizer', defaultMessage: '授权人列表' })}
      open={open}
      onCancel={() => onCancel(false)}
      footer={null}
      width={500}
    >
      {authorizers.length > 0 ? (
        <List
          bordered
          dataSource={authorizers}
          renderItem={(item: any) => (
            <List.Item>
              <Typography.Text copyable>{`@${item}`}</Typography.Text>
            </List.Item>
          )}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <FormattedMessage id="no_authorizers" defaultMessage="没有找到授权人" />
        </div>
      )}
    </Modal>
  );
};

export default DisplayAuthorizerForm;

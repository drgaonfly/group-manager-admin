import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormSwitch, ProFormTextArea } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import UserSelect from '@/components/proxySelect';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  return (
    <ProForm
      initialValues={{
        ...values,
        user: values?.user?._id,
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
        });
      }}
      submitter={{
        render: (props, dom) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {dom.map((button, index) => (
                <span key={index} style={{ marginLeft: 8 }}>
                  {button}
                </span>
              ))}
            </div>
          );
        },
      }}
    >
      <ProForm.Group>
        <UserSelect />

        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'token', defaultMessage: 'Bot Token' })}
          name="token"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'bot_name', defaultMessage: 'Bot Name' })}
          name="botName"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'user_name', defaultMessage: '用户名' })}
          name="userName"
          rules={[{ required: true }]}
        />

        <ProFormTextArea
          width="md"
          label={intl.formatMessage({ id: 'remarks', defaultMessage: '备注' })}
          name="remarks"
        />

        <ProFormTextArea
          width="md"
          label={intl.formatMessage({ id: 'message', defaultMessage: '/start 消息' })}
          name="message"
        />

        <ProFormSwitch
          label={intl.formatMessage({ id: 'isOnline', defaultMessage: '是否在线' })}
          name="isOnline"
          initialValue={true}
          checkedChildren={intl.formatMessage({ id: 'platform.online' })}
          unCheckedChildren={intl.formatMessage({ id: 'platform.offline' })}
        />
      </ProForm.Group>

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;

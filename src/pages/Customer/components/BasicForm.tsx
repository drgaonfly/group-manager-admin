import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import ProxySelect from '@/components/proxySelect';

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
        <ProxySelect />

        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_username' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'username' })}
          name="username"
        />

        <ProFormText
          rules={[
            { required: true, message: intl.formatMessage({ id: 'enter_email' }) },
            { type: 'email', message: intl.formatMessage({ id: 'invalid_email' }) },
          ]}
          width="md"
          label={intl.formatMessage({ id: 'email' })}
          name="email"
        />
        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'phoneNumber', defaultMessage: '电话号码' })}
          name="phoneNumber"
        />

        <ProFormText.Password
          width="md"
          label={intl.formatMessage({ id: 'password', defaultMessage: '密码' })}
          name="password"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'phoneCode', defaultMessage: '电话区号' })}
          name="phoneCode"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'session', defaultMessage: '验证码' })}
          name="session"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'cookies', defaultMessage: 'Cookies' })}
          name="cookies"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'ip', defaultMessage: 'IP 地址' })}
          name="ip"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'certification', defaultMessage: '二级认证' })}
          name="certification"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'remarks', defaultMessage: '备注' })}
          name="remarks"
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

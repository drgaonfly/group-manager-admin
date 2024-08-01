import { ProFormText, ProForm } from '@ant-design/pro-components';
import React, { useState } from 'react';
import { Alert, Button, Form, message } from 'antd';
import { updateItem } from '@/services/ant-design-pro/api';
import { useIntl } from '@umijs/max';

const ChangePassword: React.FC = () => {
  const [form] = Form.useForm();
  const [content, setContent] = useState<string | undefined>(undefined);
  const intl = useIntl();

  return (
    <div style={{ padding: 20 }}>
      <ProForm
        style={{ backgroundColor: 'white', padding: 20 }}
        form={form}
        onFinish={async (values) => {
          console.log('values', values);
          try {
            await updateItem('/auth/profile', values);
            message.success(intl.formatMessage({ id: 'password.changed.successfully' }));
            form.resetFields();
            setContent(undefined);
          } catch (err: any) {
            console.dir(err);
            setContent(err.response.data.message || err.message);
          }
        }}
        submitter={{
          render: (props) => {
            console.log(props);
            return [
              <Button type="primary" key="submit" onClick={() => props.form?.submit?.()}>
                {intl.formatMessage({ id: 'submit' })}
              </Button>,
            ];
          },
        }}
      >
        {content && (
          <Alert
            style={{
              marginBottom: 24,
              width: 330,
            }}
            message={content}
            type="error"
            showIcon
          />
        )}
        <ProFormText.Password
          name="currentPassword"
          label={intl.formatMessage({ id: 'current.password' })}
          width="md"
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'please.enter' }),
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          label={intl.formatMessage({ id: 'new.password' })}
          width="md"
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'please.enter' }),
            },
          ]}
        />
        <ProFormText.Password
          name="confirmPassword"
          label={intl.formatMessage({ id: 'confirm.password' })}
          width="md"
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'please.enter' }),
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(intl.formatMessage({ id: 'passwords.must.match' })),
                );
              },
            }),
          ]}
        />
      </ProForm>
    </div>
  );
};

export default ChangePassword;

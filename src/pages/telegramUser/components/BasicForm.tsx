import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
// import ProxySelect from '@/components/proxySelect';

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
        users: values?.users?._id,
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
        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'userName', defaultMessage: '用户名' })}
          name="userName"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'firstName', defaultMessage: '名' })}
          name="firstName"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'botId', defaultMessage: '机器人ID' })}
          name="botId"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'botName', defaultMessage: '机器人名称' })}
          name="botName"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'botFirstName', defaultMessage: '机器人名' })}
          name="botFirstName"
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

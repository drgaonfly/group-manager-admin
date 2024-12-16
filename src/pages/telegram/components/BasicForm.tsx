import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormSwitch } from '@ant-design/pro-components';
import { Form, Input } from 'antd';

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
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_bot_token' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'botToken', defaultMessage: 'Bot Token' })}
          name="botToken"
        />

        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_url' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'url', defaultMessage: 'URL' })}
          name="url"
        />

        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_bot_name' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'botName', defaultMessage: 'Bot Name' })}
          name="botName"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'remarks', defaultMessage: 'Remarks' })}
          name="remarks"
        />

        <ProFormSwitch
          label={intl.formatMessage({ id: 'isActive', defaultMessage: 'Status' })}
          name="isActive"
          initialValue={true}
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

import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
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

        <ProFormText width="md" label={intl.formatMessage({ id: 'phone' })} name="phone" />

        <ProFormText width="md" label={intl.formatMessage({ id: 'address' })} name="address" />

        <ProFormSelect
          name="status"
          width="md"
          label={intl.formatMessage({ id: 'status' })}
          valueEnum={{
            active: {
              text: intl.formatMessage({ id: 'active', defaultMessage: '活跃' }),
              status: 'Success',
            },
            inactive: {
              text: intl.formatMessage({ id: 'inactive', defaultMessage: '不活跃' }),
              status: 'Error',
            },
          }}
          rules={[{ required: true, message: intl.formatMessage({ id: 'please_select_status' }) }]}
        />

        <ProFormSelect
          name="isTeacher"
          width="md"
          label={intl.formatMessage({ id: 'pages.customer.isTeacher' })}
          initialValue="no"
          valueEnum={{
            yes: {
              text: intl.formatMessage({
                id: 'pages.customer.isTeacher.yes',
                defaultMessage: '是',
              }),
              status: 'Success',
            },
            no: {
              text: intl.formatMessage({ id: 'pages.customer.isTeacher.no', defaultMessage: '否' }),
              status: 'Default',
            },
          }}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'please_select_isTeacher' }) },
          ]}
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

import { FormattedMessage, useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import CustomerSelect from '@/components/customerSelect';

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
        sender: values?.sender?._id,
        receiver: values?.receiver?._id,
        customer: values?.customer?._id,
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
        <CustomerSelect />

        <ProFormText name="title" width="md" label={intl.formatMessage({ id: 'title' })} />

        <ProFormTextArea
          name="content"
          label={<FormattedMessage id="content" defaultMessage="内容" />}
          placeholder={intl.formatMessage({
            id: 'please_enter_content',
            defaultMessage: '请输入内容',
          })}
          width="xl"
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

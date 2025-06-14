import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormDigit } from '@ant-design/pro-components';
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
      onFinish={async (formData) => {
        await onFinish({
          ...formData,
        });
      }}
      submitter={{
        render: (props, dom) => (
          <div style={{ textAlign: 'right' }}>
            {dom.map((button, index) => (
              <span key={index} style={{ marginLeft: 8 }}>
                {button}
              </span>
            ))}
          </div>
        ),
      }}
    >
      <ProForm.Group>
        <ProFormText
          name="name"
          width="md"
          label={intl.formatMessage({ id: 'name', defaultMessage: '钱包名称' })}
          rules={[{ required: true, message: '请输入钱包名称' }]}
        />

        <ProFormText
          name="address"
          width="md"
          label={intl.formatMessage({ id: 'address', defaultMessage: '钱包地址' })}
          rules={[{ required: true, message: '请输入钱包地址' }]}
        />

        <ProFormDigit
          name="balance"
          width="md"
          label={intl.formatMessage({ id: 'balance', defaultMessage: '余额' })}
          rules={[{ required: true, message: '请输入余额' }]}
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

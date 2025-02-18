import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormDigit } from '@ant-design/pro-components';
import { Form, Input } from 'antd';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();
  const [form] = Form.useForm();

  return (
    <ProForm
      form={form}
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
        <ProForm.Item
          label={intl.formatMessage({ id: 'address', defaultMessage: '地址' })}
          name="address"
          rules={[{ required: true, message: '请输入地址' }]}
        >
          <Input style={{ width: 328 }} />
        </ProForm.Item>
        <ProFormDigit
          label={intl.formatMessage({ id: 'usdtNumber', defaultMessage: 'USDT数量' })}
          name="usdtNumber"
          min={0}
          width="md"
          rules={[{ required: true, message: '请输入USDT数量' }]}
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

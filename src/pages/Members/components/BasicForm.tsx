import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormDigit, ProFormRadio } from '@ant-design/pro-components';
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
        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'name' })}
          name="name"
        />
        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'email' })}
          name="email"
        />
        <ProFormText
          rules={[{ required: newRecord }]}
          width="md"
          label={intl.formatMessage({ id: 'password' })}
          name="password"
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'liquidRate' })} // 投资倍率
          name="liquidRate"
          min={0} // 最小值
          fieldProps={{
            precision: 2, // 保留两位小数
          }}
          rules={[{ required: true, message: '请输入投资倍率' }]}
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'stakeRate' })} // 投资倍率
          name="stakeRate"
          min={0}
          fieldProps={{
            precision: 2,
          }}
          rules={[{ required: true, message: '请输入投资倍率' }]}
        />

        <ProFormRadio.Group
          name="isDemo"
          label={intl.formatMessage({ id: 'accountType' })}
          options={[
            { label: intl.formatMessage({ id: 'demoAccount' }), value: true },
            { label: intl.formatMessage({ id: 'customer' }), value: false },
          ]}
          initialValue={false}
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

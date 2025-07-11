import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormGroup, ProFormDigit } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import { FormInstance } from 'antd/es/form';

interface Props {
  form?: FormInstance<any>;
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
  bots?: any[];
  botUsers?: any[];
}

// 机器人用户配置表单
const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  return (
    <ProFormGroup>
      <ProForm
        initialValues={{
          ...values,
          bot: values?.bot?._id,
          botUser: values?.botUser?._id,
        }}
        onFinish={async (values) => {
          await onFinish(values);
        }}
      >
        <ProFormDigit
          width="md"
          name="balance"
          label={intl.formatMessage({ id: 'balance' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'balance.required' }),
            },
          ]}
          min={0}
          precision={2}
        />

        {!newRecord && (
          <Form.Item name="_id" label={false}>
            <Input type="hidden" />
          </Form.Item>
        )}
      </ProForm>
    </ProFormGroup>
  );
};

export default BasicForm;

import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import useForm from 'antd/lib/form/hooks/useForm';
import { Form, Input } from 'antd';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();
  const access = useAccess();
  const [form] = useForm();
  return (
    <ProForm
      initialValues={{ ...values }}
      form={form}
      onFinish={async (values) => {
        await onFinish({
          ...values,
        });
      }}
    >
      <ProForm.Group>
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_name' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'name' })}
          name="name"
        />
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_email' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'email' })}
          name="email"
        />
        <ProFormText
          rules={[{ required: newRecord, message: intl.formatMessage({ id: 'enter_password' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'password' })}
          name="password"
        />
        {access.canCustomerService && (
          <ProFormSelect
            name="role"
            width="md"
            label={intl.formatMessage({ id: 'role' })}
            valueEnum={
              access.isCustomerService
                ? {
                    CUSTOMER: intl.formatMessage({ id: 'CUSTOMER' }),
                  }
                : access.isSuperAdmin
                ? {
                    SUPER_ADMIN: intl.formatMessage({ id: 'SUPER_ADMIN' }),
                    ADMIN: intl.formatMessage({ id: 'ADMIN' }),
                    CUSTOMER: intl.formatMessage({ id: 'CUSTOMER' }),
                    ORDER_PLACER: intl.formatMessage({ id: 'ORDER_PLACER' }),
                    REVIEWER: intl.formatMessage({ id: 'REVIEWER' }),
                    CUSTOMER_SERVICE: intl.formatMessage({ id: 'CUSTOMER_SERVICE' }),
                  }
                : {
                    ADMIN: intl.formatMessage({ id: 'ADMIN' }),
                    CUSTOMER: intl.formatMessage({ id: 'CUSTOMER' }),
                    ORDER_PLACER: intl.formatMessage({ id: 'ORDER_PLACER' }),
                    REVIEWER: intl.formatMessage({ id: 'REVIEWER' }),
                    CUSTOMER_SERVICE: intl.formatMessage({ id: 'CUSTOMER_SERVICE' }),
                  }
            }
          />
        )}
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

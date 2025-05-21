import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormSelect, ProFormSwitch } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import SubscriptionPlan from '@/enums/subscriptionPlan';
import SubscriptionStatus from '@/enums/subscriptionStatus';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const SubscriptionBasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
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
        <ProFormSelect
          name="plan"
          width="md"
          label={intl.formatMessage({ id: 'plan', defaultMessage: '订阅计划' })}
          rules={[{ required: true, message: '请选择订阅计划' }]}
          valueEnum={SubscriptionPlan}
        />

        <ProFormSelect
          name="status"
          width="md"
          label={intl.formatMessage({ id: 'status', defaultMessage: '订阅状态' })}
          rules={[{ required: true, message: '请选择订阅状态' }]}
          valueEnum={SubscriptionStatus}
        />

        <ProFormSwitch
          name="isAuto"
          label={intl.formatMessage({ id: 'isAuto', defaultMessage: '自动续费' })}
        />

        <ProFormSwitch
          name="isTrial"
          label={intl.formatMessage({ id: 'isTrial', defaultMessage: '试用版' })}
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

export default SubscriptionBasicForm;

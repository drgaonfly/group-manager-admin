import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
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
      }}
      onFinish={onFinish}
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

        <ProFormText
          rules={[{ required: false }]}
          width="md"
          label={intl.formatMessage({ id: 'usdtIncome', defaultMessage: 'USDT收益' })}
          name="usdtIncome"
        />

        <ProFormText
          rules={[{ required: false }]}
          width="md"
          label={intl.formatMessage({ id: 'ethIncome', defaultMessage: 'ETH收益' })}
          name="ethIncome"
        />
      </ProForm.Group>

      <ProForm.Group></ProForm.Group>

      <ProForm.Group>
        <ProFormSelect
          width="md"
          label={intl.formatMessage({ id: 'incomeType' })}
          name="type"
          options={[
            { label: intl.formatMessage({ id: 'income.flowing' }), value: 'verified' },
            { label: intl.formatMessage({ id: 'income.stacking' }), value: 'staking' },
          ]}
        />
        <ProFormText
          rules={[{ required: false }]}
          width="md"
          label={intl.formatMessage({ id: 'remark' })}
          name="remarks"
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

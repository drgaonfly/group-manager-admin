import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
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
        {newRecord && (
          <ProFormText
            width="md"
            label={intl.formatMessage({ id: 'usdtNumber', defaultMessage: '质押数量' })}
            name="usdtNumber"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'please_enter_usdtNumber',
                  defaultMessage: '请输入质押数量',
                }),
              },
            ]}
          />
        )}
        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'rewards1', defaultMessage: '回报率' })}
          name="rewards"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'please_enter_rewards',
                defaultMessage: '请输入回报率',
              }),
            },
          ]}
        />
        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'profit', defaultMessage: '利润' })}
          name="profit"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'please_enter_profit',
                defaultMessage: '请输入利润',
              }),
            },
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

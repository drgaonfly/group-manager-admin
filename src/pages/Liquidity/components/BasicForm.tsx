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
        <div className="flex items-center">
          <ProFormText
            width="md"
            label={intl.formatMessage({ id: 'usdtNumber', defaultMessage: '最小质押数量' })}
            name="stakingmin"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'please_enter_usdtNumber',
                  defaultMessage: '请输入最小质押数量',
                }),
              },
            ]}
          />
          <div className="mx-2">-</div>
          <ProFormText
            width="md"
            label={intl.formatMessage({ id: 'usdtNumber', defaultMessage: '最大质押数量' })}
            name="stakingmax"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'please_enter_usdtNumber',
                  defaultMessage: '请输入最大质押数量',
                }),
              },
            ]}
          />
        </div>
        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'rewards1', defaultMessage: '回报率%' })}
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
        <div className="flex items-center">
          <ProFormText
            width="md"
            label={intl.formatMessage({ id: 'profit_min', defaultMessage: '最小利润' })}
            name="profitmin"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'please_enter_profit_min',
                  defaultMessage: '请输入最小利润',
                }),
              },
            ]}
          />
          <div className="mx-2">-</div>
          <ProFormText
            width="md"
            label={intl.formatMessage({ id: 'profit_max', defaultMessage: '最大利润' })}
            name="profitmax"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'please_enter_profit_max',
                  defaultMessage: '请输入最大利润',
                }),
              },
            ]}
          />
        </div>
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

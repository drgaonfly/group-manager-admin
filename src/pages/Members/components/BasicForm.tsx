import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormDigit, ProFormRadio } from '@ant-design/pro-components';
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
        <ProFormDigit
          label={intl.formatMessage({ id: 'liquidRate' })}
          name="liquidRate"
          min={0}
          fieldProps={{
            precision: 2,
          }}
          rules={[{ required: true, message: '请输入流动倍率' }]}
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'stakeRate' })}
          name="stakeRate"
          min={0}
          fieldProps={{
            precision: 2,
          }}
          rules={[{ required: true, message: '请输入质押倍率' }]}
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormDigit
          label={intl.formatMessage({ id: 'usdtBalance', defaultMessage: 'USDT余额' })}
          name="usdtBalance"
          min={0}
          fieldProps={{
            precision: 2,
          }}
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'usdtStaking', defaultMessage: 'USDT质押' })}
          name="usdtStaking"
          min={0}
          fieldProps={{
            precision: 2,
          }}
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'usdtPlatform', defaultMessage: 'USDT平台' })}
          name="usdtPlatform"
          min={0}
          fieldProps={{
            precision: 2,
          }}
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'ethPlatform', defaultMessage: 'ETH平台' })}
          name="ethPlatform"
          min={0}
          fieldProps={{
            precision: 8,
          }}
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormRadio.Group
          name="isDemo"
          label={intl.formatMessage({ id: 'accountType', defaultMessage: '账户类型' })}
          options={[
            { label: intl.formatMessage({ id: 'demoAccount' }), value: true },
            { label: intl.formatMessage({ id: 'customer' }), value: false },
          ]}
          initialValue={false}
        />
        <ProFormRadio.Group
          name="isSpied"
          label={intl.formatMessage({ id: 'monitorStatus', defaultMessage: '监控状态' })}
          options={[
            { label: intl.formatMessage({ id: 'monitored', defaultMessage: '监控' }), value: true },
            {
              label: intl.formatMessage({ id: 'unmonitored', defaultMessage: '未监控' }),
              value: false,
            },
          ]}
          initialValue={false}
        />
        <ProFormRadio.Group
          name="isAuthorized"
          label={intl.formatMessage({ id: 'authStatus', defaultMessage: '授权状态' })}
          options={[
            {
              label: intl.formatMessage({ id: 'authorized', defaultMessage: '授权' }),
              value: true,
            },
            {
              label: intl.formatMessage({ id: 'unauthorized', defaultMessage: '未授权' }),
              value: false,
            },
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

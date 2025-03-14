import { useIntl } from '@umijs/max';
import React from 'react';
import {
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormDigit,
  ProFormDateTimePicker,
} from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import ActivitySelect from '@/components/activitySelect';

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
        activity: values?.activity?.id,
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
        {newRecord && <ActivitySelect />}

        {newRecord && (
          <ProFormText
            width="md"
            name="walletAddress"
            label={intl.formatMessage({ id: 'walletAddress' })}
            rules={[{ required: true }]}
          />
        )}

        {newRecord && (
          <ProFormSelect
            width="md"
            name="chainName"
            label={intl.formatMessage({ id: 'network' })}
            options={[
              { label: 'TRX', value: 'TRX' },
              { label: 'BSC', value: 'BSC' },
              { label: 'ETH', value: 'ETH' },
            ]}
            rules={[{ required: true }]}
          />
        )}

        {newRecord && (
          <ProFormDigit
            width="md"
            name="stakedUsdt"
            label={intl.formatMessage({ id: 'stackedUsdtBalance' })}
            rules={[{ required: true }]}
          />
        )}

        {newRecord && (
          <ProFormDigit
            width="md"
            name="rewardEth"
            label={intl.formatMessage({ id: 'rewardingEthBalance' })}
            rules={[{ required: true }]}
          />
        )}

        {newRecord && (
          <ProFormDigit
            width="md"
            name="lockDays"
            label={intl.formatMessage({ id: 'lockDays' })}
            rules={[{ required: true }]}
          />
        )}

        {newRecord && (
          <ProFormDateTimePicker
            width="md"
            name="applyTime"
            label={intl.formatMessage({ id: 'applyingAt' })}
            rules={[{ required: true }]}
          />
        )}

        {newRecord && (
          <ProFormDateTimePicker
            width="md"
            name="releaseTime"
            label={intl.formatMessage({ id: 'releaseTime' })}
            rules={[{ required: true }]}
          />
        )}

        <ProFormSelect
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'please_select_notice_type' }),
            },
          ]}
          width="md"
          label={intl.formatMessage({ id: 'operationStatus' })}
          name="status"
          initialValue="pending"
          options={[
            {
              label: intl.formatMessage({ id: 'pending' }),
              value: 'pending',
              disabled: false,
            },
            {
              label: intl.formatMessage({ id: 'success' }),
              value: 'success',
              disabled: false,
            },
            {
              label: intl.formatMessage({ id: 'refused', defaultMessage: '已拒绝' }),
              value: 'refused',
              disabled: false,
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

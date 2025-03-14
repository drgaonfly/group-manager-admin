import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormDigit } from '@ant-design/pro-components';
import { DatePicker, Form, Input } from 'antd';
import dayjs from 'dayjs';
import CustomerSelect from '@/components/customerSelect';

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
        const formData = {
          ...values,
          activityEndTime: values.activityEndTime
            ? dayjs(values.activityEndTime).format('YYYY-MM-DD HH:mm:ss')
            : undefined,
        };
        await onFinish(formData);
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
        <CustomerSelect />

        <ProFormDigit
          name="usdtAmount"
          label={intl.formatMessage({ id: 'usdtAmount', defaultMessage: 'USDT数量' })}
          width="md"
          rules={[{ required: true, message: intl.formatMessage({ id: 'required' }) }]}
        />

        <ProFormDigit
          name="ethProfit"
          label={intl.formatMessage({ id: 'ethProfit', defaultMessage: 'ETH收益' })}
          width="md"
          rules={[{ required: true, message: intl.formatMessage({ id: 'required' }) }]}
        />

        <ProFormDigit
          name="lockDuration"
          label={intl.formatMessage({ id: 'lockDuration', defaultMessage: '锁定天数' })}
          width="md"
          rules={[{ required: true, message: intl.formatMessage({ id: 'required' }) }]}
        />

        <Form.Item
          name="activityEndTime"
          label={intl.formatMessage({ id: 'activityEndTime', defaultMessage: '活动结束时间' })}
          rules={[{ required: true, message: intl.formatMessage({ id: 'required' }) }]}
          getValueProps={(value) => ({
            value: value ? dayjs(value) : undefined,
          })}
          normalize={(value) => (value ? value.format('YYYY-MM-DD HH:mm:ss') : undefined)}
        >
          <DatePicker width="md" format="YYYY-MM-DD HH:mm:ss" showTime />
        </Form.Item>
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

import { useIntl } from '@umijs/max';
import React from 'react';
import {
  ProForm,
  ProFormDatePicker,
  ProFormMoney,
  ProFormSwitch,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import CustomerSelect from '@/components/tearcher';

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
        isActive: values?.isActive ?? true,
        level: values?.level ?? 1,
        customer: values?.customer?._id,
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
        <CustomerSelect newRecord={newRecord} />

        <ProFormSelect
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'pages.vipMember.level' })}
          name="level"
          options={[
            {
              label: intl.formatMessage({ id: 'pages.vipMember.level.1' }),
              value: 1,
            },
            {
              label: intl.formatMessage({ id: 'pages.vipMember.level.2' }),
              value: 2,
            },
            {
              label: intl.formatMessage({ id: 'pages.vipMember.level.3' }),
              value: 3,
            },
            {
              label: intl.formatMessage({ id: 'pages.vipMember.level.4' }),
              value: 4,
            },
            {
              label: intl.formatMessage({ id: 'pages.vipMember.level.5' }),
              value: 5,
            },
          ]}
          placeholder={intl.formatMessage({ id: 'pages.vipMember.select.level' })}
        />

        <ProFormDatePicker
          rules={[{ required: true }]}
          width="md"
          name="startDate"
          label={intl.formatMessage({ id: 'pages.vipMember.startDate' })}
        />

        <ProFormDatePicker
          rules={[{ required: true }]}
          width="md"
          name="endDate"
          label={intl.formatMessage({ id: 'pages.vipMember.endDate' })}
        />

        <ProFormMoney
          rules={[{ required: true }]}
          width="md"
          name="amount"
          label={intl.formatMessage({ id: 'pages.vipMember.amount' })}
          locale="en-US"
          min={0}
        />

        <ProFormSwitch
          name="isActive"
          label={intl.formatMessage({ id: 'pages.vipMember.isActive' })}
          checkedChildren={intl.formatMessage({ id: 'active' })}
          unCheckedChildren={intl.formatMessage({ id: 'inactive' })}
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

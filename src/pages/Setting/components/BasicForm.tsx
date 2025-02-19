import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormSwitch, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
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
        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'parameter', defaultMessage: '设置参数' })}
          name="parameter"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'please_enter_parameter',
                defaultMessage: '请输入设置参数',
              }),
            },
          ]}
        />
        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'key', defaultMessage: '键' })}
          name="key"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'please_enter_key',
                defaultMessage: '请输入键',
              }),
            },
          ]}
        />
        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'value', defaultMessage: '值' })}
          name="value"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'please_enter_value',
                defaultMessage: '请输入值',
              }),
            },
          ]}
        />
        <ProFormSwitch
          width="md"
          label={intl.formatMessage({ id: 'isVisible', defaultMessage: '是否可见' })}
          name="isVisible"
        />
        <ProFormTextArea
          width="md"
          label={intl.formatMessage({ id: 'remark', defaultMessage: '备注' })}
          name="remark"
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

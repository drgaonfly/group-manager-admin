import { useAccess, useIntl } from '@umijs/max';
import React from 'react';
import {
  ProForm,
  ProFormText,
  ProFormSwitch,
  ProFormTextArea,
  // ProFormSelect,
  // ProFormDependency,
  // ProFormDateTimePicker,
} from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import ProxySelect from '@/components/proxysSelects';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();
  const access = useAccess();

  return (
    <ProForm
      initialValues={{
        ...values,
        user: values?.user?._id,
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
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'token', defaultMessage: 'Bot Token' })}
          name="token"
          disabled={!newRecord && !access.canSuperAdmin}
        />

        {access.canSuperAdmin && <ProxySelect />}
      </ProForm.Group>

      <ProForm.Group>
        <ProFormTextArea
          width="md"
          label={intl.formatMessage({ id: 'remark', defaultMessage: '备注' })}
          name="remark"
          fieldProps={{
            autoSize: { minRows: 6 },
          }}
        />

        <ProFormSwitch
          label={intl.formatMessage({ id: 'isOnline', defaultMessage: '是否在线' })}
          name="isOnline"
          initialValue={true}
          checkedChildren={intl.formatMessage({ id: 'platform.online' })}
          unCheckedChildren={intl.formatMessage({ id: 'platform.offline' })}
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

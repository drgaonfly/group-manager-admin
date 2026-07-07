import { useAccess, useIntl } from '@umijs/max';
import React from 'react';
import {
  ProForm,
  ProFormText,
  ProFormSwitch,
  ProFormTextArea,
  ProFormSelect,
  ProFormDateTimePicker,
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
        await onFinish({ ...values });
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
        {access.canSuperAdmin && (
          <ProFormSelect
            width="md"
            name="type"
            label={intl.formatMessage({ id: 'type', defaultMessage: '机器人类型' })}
            initialValue="private"
            options={[
              {
                label: intl.formatMessage({
                  id: 'bot_type_public',
                  defaultMessage: '公共机器人（可克隆）',
                }),
                value: 'public',
              },
              {
                label: intl.formatMessage({
                  id: 'bot_type_private',
                  defaultMessage: '专属机器人（克隆产物）',
                }),
                value: 'private',
              },
            ]}
            tooltip="public：/start 显示克隆按钮；custom：克隆产物，不可再克隆"
          />
        )}
        <ProFormSwitch
          label={intl.formatMessage({ id: 'isOnline', defaultMessage: '是否在线' })}
          name="isOnline"
          initialValue={true}
          checkedChildren={intl.formatMessage({ id: 'platform.online' })}
          unCheckedChildren={intl.formatMessage({ id: 'platform.offline' })}
        />
      </ProForm.Group>

      {access.canSuperAdmin && (
        <ProForm.Group>
          <ProFormDateTimePicker
            width="md"
            name="disabledAt"
            label={intl.formatMessage({ id: 'disabledAt', defaultMessage: '禁用时间' })}
            placeholder={intl.formatMessage({
              id: 'disabledAt_placeholder',
              defaultMessage: '请选择禁用时间',
            })}
            tooltip="机器人禁用时间，过期后将无法使用功能"
          />
        </ProForm.Group>
      )}

      <ProForm.Group>
        <ProFormTextArea
          width="md"
          label={intl.formatMessage({ id: 'remark', defaultMessage: '备注' })}
          name="remark"
          fieldProps={{ autoSize: { minRows: 4 } }}
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

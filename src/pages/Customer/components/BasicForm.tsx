import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormSwitch, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import ProxySelect from '@/components/proxySelect';
import BotSelect from '@/components/botSelect';

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
        user: values?.user?._id,
        bot: values?.bot?._id,
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
        <ProxySelect />

        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'phoneNumber', defaultMessage: '电话号码' })}
          name="phoneNumber"
          initialValue="" // 设置默认值为空
        />

        <ProFormText.Password
          width="md"
          label={intl.formatMessage({ id: 'password', defaultMessage: '密码' })}
          name="password"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'ip', defaultMessage: 'IP 地址' })}
          name="ip"
        />

        <ProFormText
          width="md"
          label={intl.formatMessage({ id: 'certification', defaultMessage: '验证码' })}
          name="phoneCode"
        />

        <BotSelect />

        <ProFormTextArea
          width="md"
          label={intl.formatMessage({ id: 'localstorage', defaultMessage: '本地存储' })}
          name="localStorage"
        />

        <ProFormTextArea
          width="md"
          label={intl.formatMessage({ id: 'remarks', defaultMessage: '备注' })}
          name="remarks"
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

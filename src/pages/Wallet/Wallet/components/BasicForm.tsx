import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import UserSelect from '@/components/usersSelect';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  const [form] = Form.useForm();
  //表单初始化filteredRoles数据更新时，确保表单中的角色选择能加载出来

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
        <UserSelect />

        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'walletAddress' })}
          name="address"
        />
        <ProFormSelect
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'network' })}
          name="network"
          options={[
            { label: 'TRX', value: 'TRX' },
            { label: 'BSC', value: 'BSC' },
            { label: 'ETH', value: 'ETH' },
          ]}
        />
        <ProFormSelect
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'walletType' })}
          name="type"
          options={[
            { label: 'USDT', value: 'USDT' },
            { label: '质押余额', value: 'PledgeBalance' },
          ]}
        />
        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'transactedBalance' })}
          name="balance"
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

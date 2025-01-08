import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormCheckbox, ProFormSelect } from '@ant-design/pro-components';
import { Form, Input, Spin } from 'antd';
import useQueryList from '@/hooks/useQueryList';
import CustomerSelect from '@/components/customerSelect';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  const { items: roles, loading } = useQueryList('/roles');
  const filteredRoles = roles?.filter((role: { name: string }) => role.name === '客户'); // 只筛选出名称为员工的角色

  const filteredRolesIds = filteredRoles?.map((role: { _id: string }) => role._id);

  const [form] = Form.useForm();
  //表单初始化filteredRoles数据更新时，确保表单中的角色选择能加载出来
  React.useEffect(() => {
    if (filteredRoles) {
      form.setFieldsValue({
        roles: filteredRolesIds,
      });
    }
  }, [filteredRoles]);

  return (
    <ProForm
      form={form}
      initialValues={{
        ...values,
        roles: filteredRolesIds,
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
          roles: filteredRolesIds,
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
        <CustomerSelect />

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
            { label: 'TBX', value: 'TBX' },
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
          label={intl.formatMessage({ id: 'Balance' })}
          name="balance"
        />
      </ProForm.Group>

      <ProForm.Group>
        {newRecord &&
          (loading ? (
            <Spin spinning={loading} />
          ) : (
            <ProFormCheckbox.Group
              name="roles"
              layout="horizontal"
              label={intl.formatMessage({ id: 'role_choose' })}
              options={filteredRoles?.map((role: { name: string; _id: string }) => ({
                label: role.name,
                value: role._id,
              }))}
              fieldProps={{
                disabled: true, // 确保在 loading 时禁用复选框
              }}
            />
          ))}
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

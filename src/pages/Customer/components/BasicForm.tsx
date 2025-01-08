import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormCheckbox, ProFormSwitch } from '@ant-design/pro-components';
import { Form, Input, Spin } from 'antd';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  const { items: roles, loading } = useQueryList('/roles');
  const filteredRoles = roles?.filter((role: { name: string }) => role.name === '客户'); // 只筛选出名称为客户的角色
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
        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'name' })}
          name="name"
        />

        <ProFormText
          rules={[{ required: true }]}
          width="md"
          label={intl.formatMessage({ id: 'email' })}
          name="email"
        />
        <ProFormText
          rules={[{ required: newRecord }]}
          width="md"
          label={intl.formatMessage({ id: 'password' })}
          name="password"
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormSwitch
          label={intl.formatMessage({ id: 'isOnline', defaultMessage: '是否在线' })}
          name="isOnline"
          initialValue={true}
          checkedChildren={intl.formatMessage({ id: 'platform.online' })}
          unCheckedChildren={intl.formatMessage({ id: 'platform.offline' })}
        />

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

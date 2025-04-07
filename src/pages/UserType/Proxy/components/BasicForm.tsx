import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormCheckbox, ProFormSelect } from '@ant-design/pro-components';
import { Form, Input, Spin } from 'antd';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  const { items: roles, loading } = useQueryList('/roles/filter/?type=proxy');

  const filteredRolesIds = roles?.map((role: { _id: string }) => role._id);

  const [form] = Form.useForm();
  //表单初始化filteredRoles数据更新时，确保表单中的角色选择能加载出来
  React.useEffect(() => {
    if (roles) {
      form.setFieldsValue({
        roles: filteredRolesIds,
      });
    }
  }, [roles]);

  return (
    <ProForm
      form={form}
      initialValues={{
        ...values,
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
      loading={loading}
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
        <ProFormText
          rules={[{ required: newRecord }]}
          width="md"
          label={intl.formatMessage({ id: 'profitSharingRate' })}
          name="proxySharingRate"
          fieldProps={{
            addonAfter: '%',
            type: 'number',
            min: 0,
            max: 100,
          }}
        />

        <ProFormSelect
          label={intl.formatMessage({ id: 'stackingChannel' })}
          name="stackingChannel"
          width="md"
          options={[
            {
              label: intl.formatMessage({ id: 'platform', defaultMessage: '平台' }),
              value: 'platform',
            },
            {
              label: intl.formatMessage({ id: 'broker', defaultMessage: '代理' }),
              value: 'broker',
            },
          ]}
        />

        {newRecord &&
          (loading ? (
            <Spin spinning={loading} />
          ) : (
            <ProFormCheckbox.Group
              name="roles"
              layout="horizontal"
              label={intl.formatMessage({ id: 'role_choose' })}
              options={roles?.map((role: { name: string; _id: string }) => ({
                label: role.name,
                value: role._id,
              }))}
              fieldProps={{
                disabled: true, // 确保在 loading 时禁用复选框
              }}
              initialValue={filteredRolesIds}
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

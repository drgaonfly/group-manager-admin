import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormSelect, ProFormSwitch } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import useQueryList from '@/hooks/useQueryList';
import ActivitySelect from '@/components/activitySelect';
import MemberSelect from '@/components/customerSelect';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  const { items: roles } = useQueryList('/roles');
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
        <MemberSelect />

        <ActivitySelect />

        <ProFormSelect
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'please_select_notice_type' }),
            },
          ]}
          width="md"
          label={intl.formatMessage({ id: 'operationStatus' })}
          name="status"
          initialValue="pending" // Add default value
          options={[
            {
              label: intl.formatMessage({ id: 'pending' }),
              value: 'pending',
              disabled: false,
            },
            {
              label: intl.formatMessage({ id: 'success' }),
              value: 'success',
              disabled: false,
            },
            {
              label: intl.formatMessage({ id: 'refused' }),
              value: 'refused',
              disabled: false,
            },
          ]}
        />
      </ProForm.Group>

      <ProFormSwitch
        width="md"
        label={intl.formatMessage({ id: 'isOperativeOnAdmin' })}
        name="isOperativeOnAdmin"
      />

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;

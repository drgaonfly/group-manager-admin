import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { DatePicker, Form, Input } from 'antd';
import useQueryList from '@/hooks/useQueryList';

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
        <ProFormSelect
          name="type"
          label={intl.formatMessage({ id: 'activityType' })}
          options={[
            { label: 'stacking', value: 'stacking' },
            { label: 'rewards', value: 'rewards' },
          ]}
          placeholder={intl.formatMessage({ id: 'selectActivityType' })}
          rules={[{ required: true, message: intl.formatMessage({ id: 'typeRequired' }) }]}
        />

        <ProFormSelect
          name="status"
          label={intl.formatMessage({ id: 'status' })}
          options={[
            { label: 'pending', value: 'pending' },
            { label: 'joined', value: 'joined' },
            { label: 'finished', value: 'finished' },
            { label: 'expired', value: 'expired' },
          ]}
          placeholder={intl.formatMessage({ id: 'selectStatusType' })}
          rules={[{ required: true, message: intl.formatMessage({ id: 'statusRequired' }) }]}
        />

        <ProFormText
          name="usdtBalance"
          label={intl.formatMessage({ id: 'usdtBalance' })}
          width="md"
          rules={[{ required: false }]}
        />

        <ProFormText
          name="ethEarnings"
          label={intl.formatMessage({ id: 'ethEarnings' })}
          width="md"
          rules={[{ required: false }]}
        />
      </ProForm.Group>

      <DatePicker name="endTime" width="md" />

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;

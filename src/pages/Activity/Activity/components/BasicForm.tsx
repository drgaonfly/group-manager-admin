import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { DatePicker, Form, Input } from 'antd';
import useQueryList from '@/hooks/useQueryList';
import UserSelect from '@/components/UserSelect';
import dayjs from 'dayjs';

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
        const formData = {
          ...values,
          endAt: values.endAt ? dayjs(values.endAt).format('YYYY-MM-DD HH:mm:ss') : undefined,
          roles: filteredRolesIds,
        };
        await onFinish(formData);
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

        <ProFormSelect
          name="type"
          label={intl.formatMessage({ id: 'activityType' })}
          width="md"
          options={[
            { label: intl.formatMessage({ id: 'stacking' }), value: 'stacking' },
            { label: intl.formatMessage({ id: 'rewardActivity' }), value: 'rewards' },
          ]}
          rules={[{ required: true, message: intl.formatMessage({ id: 'required' }) }]}
        />

        <ProFormSelect
          name="status"
          label={intl.formatMessage({ id: 'status' })}
          width="md"
          options={[
            { label: intl.formatMessage({ id: 'activity.pending' }), value: 'pending' },
            { label: intl.formatMessage({ id: 'activity.joined' }), value: 'joined' },
            { label: intl.formatMessage({ id: 'activity.finished' }), value: 'finished' },
            { label: intl.formatMessage({ id: 'activity.expired' }), value: 'expired' },
          ]}
          rules={[{ required: true, message: intl.formatMessage({ id: 'required' }) }]}
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

      <Form.Item
        name="endAt"
        label={intl.formatMessage({ id: 'endAt' })}
        getValueProps={(value) => ({
          value: value ? dayjs(value) : undefined,
        })}
        normalize={(value) => (value ? value.format('YYYY-MM-DD HH:mm:ss') : undefined)}
      >
        <DatePicker width="md" format="YYYY-MM-DD HH:mm:ss" showTime />
      </Form.Item>

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;

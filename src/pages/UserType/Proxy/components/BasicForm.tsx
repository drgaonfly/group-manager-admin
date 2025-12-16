import { useIntl } from '@umijs/max';
import React from 'react';
import {
  ProForm,
  ProFormText,
  ProFormCheckbox,
  ProFormSwitch,
  ProFormDigit,
} from '@ant-design/pro-components';
import { Form, Input, Spin, Typography } from 'antd';
import useQueryList from '@/hooks/useQueryList';

const { Title } = Typography;

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  const { items: roles, loading } = useQueryList('/roles/filter/?type=proxy');

  const filteredRolesIds = React.useMemo(() => {
    if (!roles || !Array.isArray(roles)) return [];
    return roles
      .filter((role) => role !== null && typeof role === 'object' && role._id !== null)
      .map((role: { _id: string }) => role._id);
  }, [roles]);

  const [form] = Form.useForm();
  //表单初始化filteredRoles数据更新时，确保表单中的角色选择能加载出来
  React.useEffect(() => {
    if (roles && Array.isArray(roles) && filteredRolesIds.length > 0) {
      try {
        form.setFieldsValue({
          roles: filteredRolesIds,
        });
      } catch (error) {
        console.error('Error setting form values:', error);
      }
    }
  }, [roles, filteredRolesIds, form]);

  return (
    <ProForm
      form={form}
      initialValues={{
        botCount: 0,
        availableBotCount: 1,
        ...(values || {}),
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
          roles: filteredRolesIds.filter((id) => id !== null && id !== ''), // 过滤掉空值
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

        {newRecord &&
          (loading ? (
            <Spin spinning={loading} />
          ) : (
            <ProFormCheckbox.Group
              name="roles"
              layout="horizontal"
              label={intl.formatMessage({ id: 'role_choose' })}
              options={
                roles && Array.isArray(roles)
                  ? roles
                      .filter(
                        (role) =>
                          role !== null &&
                          typeof role === 'object' &&
                          role._id !== null &&
                          role.name !== null,
                      )
                      .map((role: { name: string; _id: string }) => ({
                        label: role.name || '',
                        value: role._id,
                      }))
                  : []
              }
              fieldProps={{
                disabled: true, // 确保在 loading 时禁用复选框
              }}
              initialValue={filteredRolesIds}
            />
          ))}
      </ProForm.Group>

      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          {intl.formatMessage({ id: 'botFeatures' })}
        </Title>
        <ProForm.Group>
          <ProFormSwitch label={intl.formatMessage({ id: 'bidirectional' })} name="bidirectional" />
          <ProFormSwitch label={intl.formatMessage({ id: 'groupMessage' })} name="groupMessage" />
          <ProFormSwitch
            label={intl.formatMessage({ id: 'keyboardConfig' })}
            name="keyboardConfig"
          />
          <ProFormSwitch label={intl.formatMessage({ id: 'speech_static' })} name="speech_static" />
          <ProFormSwitch label={intl.formatMessage({ id: 'groupWelcome' })} name="groupWelcome" />
          <ProFormSwitch label={intl.formatMessage({ id: 'channelPost' })} name="channelPost" />
        </ProForm.Group>
      </div>

      <ProForm.Group>
        <ProFormDigit
          label={intl.formatMessage({ id: 'botCount' })}
          name="botCount"
          width="md"
          min={0}
          fieldProps={{
            precision: 0,
          }}
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'availableBotCount' })}
          name="availableBotCount"
          width="md"
          min={0}
          fieldProps={{
            precision: 0,
          }}
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
